const express = require('express');

// Customer-facing routes (auth, products, cart, checkout, appointments)
const path = require('path');
const LOGO_PATH = path.join(__dirname, '../../src/assets/logo.png');
const { buildWhatsAppUrl, buildOrderMessage, buildBookingMessage, formatDeliveryLine } = require('../services/whatsapp');

function toShortId(prefix, n) {
  if (!n) return `${prefix}-???`;
  const letterIndex = Math.floor((n - 1) / 999);
  const numPart     = ((n - 1) % 999) + 1;
  const letter      = String.fromCharCode(65 + letterIndex);
  return `${prefix}-${letter}${String(numPart).padStart(3, '0')}`;
}
const toShortAptId = n => toShortId('APT', n);

module.exports = ({ supabase, serviceSupabase, authenticate, authenticateOptional, initiateSTKPush, transporter }) => {
  // Use service-role client for writes that must bypass RLS (server-side inserts/updates)
  const db = serviceSupabase || supabase;
  const router = express.Router();

  const isPlainObject = value => value && typeof value === 'object' && !Array.isArray(value);

  const normalizeShippingAddress = input => {
    if (!input) return null;
    if (isPlainObject(input)) return input;
    if (typeof input === 'string') return { raw: input };
    return { raw: String(input) };
  };

  async function mergeCartItems(destinationCartId, sourceCartId) {
    const { data: sourceItems } = await db
      .from('cart_items')
      .select('product_id, quantity')
      .eq('cart_id', sourceCartId);

    if (!sourceItems || sourceItems.length === 0) return;

    const { data: destItems } = await db
      .from('cart_items')
      .select('product_id, quantity')
      .eq('cart_id', destinationCartId);

    const destMap = new Map((destItems || []).map(item => [item.product_id, item.quantity]));

    const merged = sourceItems.map(item => ({
      cart_id: destinationCartId,
      product_id: item.product_id,
      quantity: (destMap.get(item.product_id) || 0) + item.quantity
    }));

    await db.from('cart_items').upsert(merged, { onConflict: 'cart_id,product_id' });
  }

  async function getOrCreateCart(userId, sessionId) {
    let userCart = null;
    let sessionCart = null;

    if (userId) {
      const { data } = await db.from('carts').select('id').eq('user_id', userId).maybeSingle();
      userCart = data || null;
    }

    if (sessionId) {
      const { data } = await db.from('carts').select('id').eq('session_id', sessionId).maybeSingle();
      sessionCart = data || null;
    }

    if (userId && sessionId && sessionCart) {
      if (!userCart) {
        const { data } = await db
          .from('carts')
          .update({ user_id: userId, session_id: null })
          .eq('id', sessionCart.id)
          .select()
          .single();
        return data;
      }

      if (userCart.id !== sessionCart.id) {
        await mergeCartItems(userCart.id, sessionCart.id);
        await db.from('cart_items').delete().eq('cart_id', sessionCart.id);
        await db.from('carts').delete().eq('id', sessionCart.id);
      }

      return userCart;
    }

    if (userCart) return userCart;
    if (sessionCart) return sessionCart;

    if (!userId && !sessionId) return null;

    const insertData = userId ? { user_id: userId } : { session_id: sessionId };
    const { data: newCart } = await db.from('carts').insert(insertData).select().single();
    return newCart;
  }

  const { createServiceClient } = require('../config/supabase');

  // Auth
  // "Database error saving new user" is a transient Supabase-side failure we've seen
  // under connection pressure (the on_auth_user_created trigger racing to insert the
  // profile row) — retrying once after a short delay clears it. Real validation errors
  // (weak password, duplicate email, etc.) come back with a 4xx status and are not retried.
  const isTransientSignupError = err => (err?.status ?? 0) >= 500 || /database error/i.test(err?.message || '');

  router.post('/auth/signup', async (req, res) => {
    const { email, password, full_name, phone } = req.body;

    let data, error;
    for (let attempt = 0; attempt < 2; attempt++) {
      ({ data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name, phone } }
      }));
      if (!error || !isTransientSignupError(error)) break;
      console.warn(`[signup] Transient error, retrying (attempt ${attempt + 1}):`, error.message);
      await new Promise(r => setTimeout(r, 500));
    }

    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true, user: data.user, session: data.session });
  });

  router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ error: error.message });

    // Block staff/admin from logging in via the customer portal
    const db = createServiceClient();
    const { data: employee } = await db.from('employees').select('id').eq('id', data.user.id).maybeSingle();
    if (employee) {
      return res.status(403).json({ error: 'Staff accounts must log in via the staff dashboard.' });
    }

    res.json({ success: true, user: data.user, session: data.session });
  });

  // Forgot password — Supabase sends a reset email with a magic link.
  // The link redirects the user to /reset-password on the frontend.
  router.post('/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });

    const redirectTo = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) return res.status(400).json({ error: error.message });

    res.json({ success: true, message: 'Password reset email sent.' });
  });

  // Get profile — returns the current user's profile row including marketing_consent and saved address.
  router.get('/profile', authenticate, async (req, res) => {
    const { data, error } = await db
      .from('profiles')
      .select('id, full_name, email, phone, marketing_consent, shipping_address')
      .eq('id', req.user.id)
      .single();
    if (error || !data) {
      // Profile row missing (trigger didn't fire) — create it on-the-fly
      const { data: created, error: insertErr } = await db
        .from('profiles')
        .insert({ id: req.user.id, email: req.user.email || '' })
        .select('id, full_name, email, phone, marketing_consent, shipping_address')
        .single();
      if (insertErr || !created) return res.status(404).json({ error: 'Profile not found' });
      return res.json(created);
    }
    res.json(data);
  });

  // Update profile — saves name, phone, marketing_consent, and/or shipping_address back to profiles.
  // Email is read-only (it lives in auth.users, not profiles).
  router.patch('/profile', authenticate, async (req, res) => {
    const { full_name, phone, marketing_consent, shipping_address } = req.body;
    const updates = {};
    if (full_name          !== undefined) updates.full_name          = full_name;
    if (phone              !== undefined) updates.phone              = phone;
    if (marketing_consent  !== undefined) updates.marketing_consent  = Boolean(marketing_consent);
    if (shipping_address   !== undefined) updates.shipping_address   = shipping_address;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    const { error } = await db
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // Update password — used by employees to change their temp password on first login.
  // Uses service-role client to update auth.users by ID, then clears the
  // is_temporary_password flag in the employees table.
  router.post('/auth/update-password', authenticate, async (req, res) => {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const adminClient = createServiceClient();
    const { error } = await adminClient.auth.admin.updateUserById(req.user.id, { password });
    if (error) return res.status(400).json({ error: error.message });

    // Clear temp-password flag if this is an employee (uses service client to bypass RLS)
    await db.from('employees').update({ is_temporary_password: false }).eq('id', req.user.id);

    res.json({ success: true, message: 'Password updated successfully' });
  });

  // Products — returns all active products with their category name
  router.get('/products', async (req, res) => {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) return res.status(400).json(error);
    res.json(data);
  });

  // Public FAQ list — no auth required
  router.get('/faqs', async (req, res) => {
    const { data, error } = await supabase
      .from('faqs')
      .select('id, category, question, answer, order_num')
      .order('category')
      .order('order_num');
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  });

  // Single product by ID — used by the ProductDetail page.
  // Ratings are computed manually from product_ratings since the
  // product_avg_ratings view is not joinable via PostgREST foreign key.
  router.get('/products/:id', async (req, res) => {
    const { data: product, error } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .eq('id', req.params.id)
      .eq('is_active', true)
      .single();
    if (error || !product) return res.status(404).json({ error: 'Product not found' });

    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', req.params.id)
      .eq('status', 'approved');

    const rating_count = reviews?.length || 0;
    const average_rating = rating_count > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / rating_count).toFixed(1)
      : '0';

    product.product_avg_ratings = { average_rating, rating_count: String(rating_count) };
    res.json(product);
  });

  // Public storefront content (marquee, hero overrides, features)
  router.get('/storefront-content', async (req, res) => {
    const { data } = await supabase.from('storefront_content').select('*').eq('id', 1).single();
    res.json(data || { marquee_items: [], hero: {}, features: [] });
  });

  // Public promo carousel
  router.get('/promo-carousel', async (req, res) => {
    const { data, error } = await supabase
      .from('promo_carousel')
      .select('id, title, subtitle, image_url, cta_text, cta_link, sort_order')
      .eq('is_active', true)
      .order('sort_order');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  });

  // Services — list with manually computed avg ratings (no PostgREST view join)
  router.get('/services', async (req, res) => {
    const { data, error } = await supabase
      .from('services')
      .select('id, name, slug, description, base_price, deposit_percentage, duration_minutes, images, category, form_fields, benefits, results_stat')
      .eq('is_active', true)
      .order('category')
      .order('name');
    if (error) return res.status(400).json(error);
    if (!data || data.length === 0) return res.json([]);

    // Fetch approved ratings for all services in one query
    const serviceIds = data.map(s => s.id);
    const { data: ratings } = await Promise.resolve(
      supabase
        .from('reviews')
        .select('service_id, rating')
        .in('service_id', serviceIds)
        .eq('status', 'approved')
    ).catch(() => ({ data: [] }));

    // Build a ratings map keyed by service_id
    const ratingsMap = {};
    for (const r of (ratings || [])) {
      if (!ratingsMap[r.service_id]) ratingsMap[r.service_id] = [];
      ratingsMap[r.service_id].push(r.rating);
    }

    const result = data.map(s => {
      const rs = ratingsMap[s.id] || [];
      const avg = rs.length > 0 ? (rs.reduce((a, b) => a + b, 0) / rs.length).toFixed(1) : '0';
      return {
        ...s,
        service_avg_ratings: { average_rating: avg, rating_count: String(rs.length) },
      };
    });

    res.json(result);
  });

  // Services — single service with related products + approved reviews
  // Accepts both slug (string) and numeric ID as the :slug param
  router.get('/services/:slug', async (req, res) => {
    const param = req.params.slug;
    const isId  = /^\d+$/.test(param);

    // Build the base query — try by slug first, fall back to numeric ID
    let query = supabase
      .from('services')
      .select('id, name, slug, description, base_price, deposit_percentage, duration_minutes, images, category, form_fields, is_active');

    // Fetch benefits/results_stat separately so missing columns don't 404 the whole request
    const { data: serviceBase, error: baseErr } = await query
      .eq(isId ? 'id' : 'slug', isId ? Number(param) : param)
      .eq('is_active', true)
      .single();

    if (baseErr || !serviceBase) return res.status(404).json({ error: 'Service not found' });

    // Fetch optional extended fields — these may not exist if migrations are pending
    const { data: extended } = await Promise.resolve(
      supabase.from('services').select('benefits, results_stat').eq('id', serviceBase.id).single()
    ).catch(() => ({ data: null }));

    // Fetch ratings, related products, reviews — each wrapped so missing tables don't crash
    const [ratingsRes, productsRes, reviewsRes] = await Promise.all([
      Promise.resolve(
        supabase.from('service_avg_ratings').select('average_rating, rating_count').eq('service_id', serviceBase.id).single()
      ).catch(() => ({ data: null })),
      Promise.resolve(
        supabase.from('service_products').select('product_id, products(id, name, size, price, images, slug, categories(name))').eq('service_id', serviceBase.id)
      ).catch(() => ({ data: [] })),
      Promise.resolve(
        supabase.from('reviews').select('id, reviewer_name, rating, title, body, is_verified_purchase, created_at').eq('service_id', serviceBase.id).eq('status', 'approved').order('created_at', { ascending: false }).limit(20)
      ).catch(() => ({ data: [] })),
    ]);

    res.json({
      ...serviceBase,
      benefits:         extended?.benefits      ?? [],
      results_stat:     extended?.results_stat  ?? null,
      service_avg_ratings: ratingsRes.data ?? null,
      related_products: (productsRes.data || []).map(r => r.products).filter(Boolean),
      reviews:          reviewsRes.data || [],
    });
  });

  // Cart
  router.get('/cart', authenticateOptional, async (req, res) => {
    const sessionId = req.headers['x-session-id'] || req.query.sessionId;
    const userId = req.user?.id || null;

    if (!userId && !sessionId) {
      return res.json({ cart_id: null, items: [] });
    }

    const cart = await getOrCreateCart(userId, sessionId);
    if (!cart) return res.json({ cart_id: null, items: [] });

    const { data: items } = await db
      .from('cart_items')
      .select('quantity, products(id, name, size, price, images)')
      .eq('cart_id', cart.id);

    res.json({ cart_id: cart.id, items: items || [] });
  });

  router.post('/cart/add', authenticateOptional, async (req, res) => {
    const { product_id, quantity = 1 } = req.body;
    const sessionId = req.headers['x-session-id'];
    const userId = req.user?.id || null;

    if (!product_id) return res.status(400).json({ error: 'product_id required' });
    if (!userId && !sessionId) return res.status(400).json({ error: 'session id or login required' });
    const qty = parseInt(quantity, 10);
    if (!qty || qty < 1 || qty > 99) return res.status(400).json({ error: 'quantity must be between 1 and 99' });

    const cart = await getOrCreateCart(userId, sessionId);
    if (!cart) return res.status(500).json({ error: 'Failed to create cart' });

    const { error } = await db
      .from('cart_items')
      .upsert({ cart_id: cart.id, product_id, quantity: qty }, { onConflict: 'cart_id,product_id' });
    if (error) return res.status(400).json({ error: error.message });

    res.json({ success: true, cart_id: cart.id });
  });

  // Remove a single item from the cart by product_id
  router.post('/cart/remove', authenticateOptional, async (req, res) => {
    const { product_id } = req.body;
    const sessionId = req.headers['x-session-id'];
    const userId = req.user?.id || null;

    if (!product_id) return res.status(400).json({ error: 'product_id required' });
    if (!userId && !sessionId) return res.status(400).json({ error: 'session id or login required' });

    const cart = await getOrCreateCart(userId, sessionId);
    if (!cart) return res.status(400).json({ error: 'Cart not found' });

    await db.from('cart_items').delete().eq('cart_id', cart.id).eq('product_id', product_id);
    res.json({ success: true });
  });

  router.post('/cart/clear', authenticateOptional, async (req, res) => {
    const sessionId = req.headers['x-session-id'];
    const userId = req.user?.id || null;

    if (!userId && !sessionId) return res.status(400).json({ error: 'session id or login required' });

    const cart = await getOrCreateCart(userId, sessionId);
    if (cart) await db.from('cart_items').delete().eq('cart_id', cart.id);

    res.json({ success: true, message: 'Cart cleared' });
  });

  // Normalize any common Kenyan phone format to 254XXXXXXXXX for Daraja
  const normalizeMpesaPhone = (phone) => {
    const digits = String(phone).replace(/\D/g, '');
    if (digits.startsWith('0') && digits.length === 10) return '254' + digits.slice(1);
    if (digits.startsWith('254') && digits.length === 12) return digits;
    if (digits.startsWith('7') && digits.length === 9) return '254' + digits;
    return digits;
  };

  // Product Checkout (M-Pesa)
  router.post('/checkout/mpesa', authenticateOptional, async (req, res) => {
    const { shipping_address, phone, session_id: bodySessionId, email, customer_email } = req.body;
    const userId = req.user?.id || null;
    const sessionId = bodySessionId || req.headers['x-session-id'];
    const finalEmail = customer_email || email;

    const normalizedShipping = normalizeShippingAddress(shipping_address);
    const normalizedPhone = phone ? normalizeMpesaPhone(phone) : null;

    if (!normalizedShipping || !normalizedPhone) {
      return res.status(400).json({ error: 'shipping_address and phone required' });
    }

    // Validate the resulting phone format before hitting Daraja
    if (!/^2547\d{8}$|^2541\d{8}$/.test(normalizedPhone)) {
      return res.status(400).json({ error: 'Invalid phone number. Use a valid Kenyan M-Pesa number (e.g. 0712345678 or 254712345678).' });
    }

    if (!userId && !sessionId) {
      return res.status(400).json({ error: 'session id or login required' });
    }

    const cart = await getOrCreateCart(userId, sessionId);
    if (!cart) return res.status(400).json({ error: 'Cart is empty' });

    const { data: cartItems } = await db
      .from('cart_items')
      .select('quantity, products(id, price)')
      .eq('cart_id', cart.id);

    if (!cartItems || cartItems.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    const validItems = cartItems.filter(item => item?.products?.id && item?.products?.price);
    if (validItems.length === 0) return res.status(400).json({ error: 'No valid products in cart' });

    let subtotal = 0;
    const orderItems = [];
    validItems.forEach(item => {
      const price = Number(item.products.price);
      subtotal += price * item.quantity;
      orderItems.push({ product_id: item.products.id, quantity: item.quantity, price_at_time: price });
    });

    // Validate shipping fee is a sane number (0–5000 KES).
    // Admins can set custom rates so we allow any value in range rather than a fixed list.
    const clientFee = typeof req.body.shipping_fee === 'number' ? Math.round(req.body.shipping_fee) : null;
    const shipping_fee = (clientFee !== null && clientFee >= 0 && clientFee <= 5000) ? clientFee : 200;
    const total = subtotal + shipping_fee;

    const orderData = {
      subtotal,
      shipping_fee,
      total,
      shipping_address: normalizedShipping,
      status: 'pending',
      payment_method: 'mpesa',
      customer_email: finalEmail || null
    };
    if (userId) orderData.user_id = userId;
    if (sessionId) orderData.session_id = sessionId;

    // Create order
    const { data: order, error: orderError } = await db
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order insert failed:', orderError);
      return res.status(500).json({ error: orderError?.message || 'Failed to create order' });
    }

    await db.from('order_items').insert(orderItems.map(i => ({ ...i, order_id: order.id })));

    const { data: payment } = await db
      .from('payments')
      .insert({ order_id: order.id, amount: total, phone: normalizedPhone, status: 'pending' })
      .select()
      .single();

    try {
      const ordRef = `ORD-${order.order_number || order.id.slice(0, 7)}`;
      const stkResult = await initiateSTKPush(normalizedPhone, total, ordRef);

      if (payment) {
        await db
          .from('payments')
          .update({ checkout_request_id: stkResult.CheckoutRequestID })
          .eq('id', payment.id);
      }

      return res.json({
        success: true,
        checkout_request_id: stkResult.CheckoutRequestID,
        order_id: order.id,
        total
      });
    } catch (error) {
      const darajaError = error.response?.data;
      console.error('STK push failed:', darajaError || error.message);
      if (payment) {
        await db.from('payments').update({ status: 'failed' }).eq('id', payment.id);
      }
      const message = darajaError?.errorMessage || 'Failed to initiate M-Pesa payment. Please check your phone number and try again.';
      return res.status(502).json({ error: message });
    }
  });

  // ── WhatsApp checkout handoff (M-Pesa/card paused) ────────────────────────────
  // Creates the order as 'pending' with no payment attempt, then hands back a
  // pre-filled wa.me link so the customer sends their order details to the
  // clinic's WhatsApp themselves. Staff follows up manually from there.
  router.post('/checkout/whatsapp', authenticateOptional, async (req, res) => {
    const { shipping_address, phone, session_id: bodySessionId, customer_email, customer_name } = req.body;
    const userId = req.user?.id || null;
    const sessionId = bodySessionId || req.headers['x-session-id'];

    const normalizedShipping = normalizeShippingAddress(shipping_address);
    const normalizedPhone = phone ? normalizeMpesaPhone(phone) : null;

    if (!normalizedShipping || !normalizedPhone) {
      return res.status(400).json({ error: 'shipping_address and phone required' });
    }
    if (!/^2547\d{8}$|^2541\d{8}$/.test(normalizedPhone)) {
      return res.status(400).json({ error: 'Invalid phone number. Use a valid Kenyan number (e.g. 0712345678 or 254712345678).' });
    }
    if (!userId && !sessionId) {
      return res.status(400).json({ error: 'session id or login required' });
    }

    const cart = await getOrCreateCart(userId, sessionId);
    if (!cart) return res.status(400).json({ error: 'Cart is empty' });

    const { data: cartItems } = await db
      .from('cart_items')
      .select('quantity, products(id, name, size, price)')
      .eq('cart_id', cart.id);

    if (!cartItems || cartItems.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    const validItems = cartItems.filter(item => item?.products?.id && item?.products?.price);
    if (validItems.length === 0) return res.status(400).json({ error: 'No valid products in cart' });

    let subtotal = 0;
    const orderItems = [];
    const messageItems = [];
    validItems.forEach(item => {
      const price = Number(item.products.price);
      subtotal += price * item.quantity;
      orderItems.push({ product_id: item.products.id, quantity: item.quantity, price_at_time: price });
      messageItems.push({ name: item.products.name + (item.products.size ? ` (${item.products.size})` : ''), quantity: item.quantity, price });
    });

    const clientFee = typeof req.body.shipping_fee === 'number' ? Math.round(req.body.shipping_fee) : null;
    const shipping_fee = (clientFee !== null && clientFee >= 0 && clientFee <= 5000) ? clientFee : 200;
    const total = subtotal + shipping_fee;

    const customerName = (customer_name || '').trim() || 'Customer';

    const orderData = {
      subtotal,
      shipping_fee,
      total,
      shipping_address: { ...normalizedShipping, fullName: customerName },
      status: 'pending',
      payment_method: 'whatsapp',
      customer_email: customer_email || null,
    };
    if (userId) orderData.user_id = userId;
    if (sessionId) orderData.session_id = sessionId;

    const { data: order, error: orderError } = await db
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError || !order) {
      console.error('WhatsApp order insert failed:', orderError);
      return res.status(500).json({ error: orderError?.message || 'Failed to create order' });
    }

    await db.from('order_items').insert(orderItems.map(i => ({ ...i, order_id: order.id })));

    const orderRef = toShortId('ORD', order.order_number);
    const message = buildOrderMessage({
      customerName,
      phone: normalizedPhone,
      deliveryLine: formatDeliveryLine(normalizedShipping),
      items: messageItems,
      subtotal,
      shippingFee: shipping_fee,
      total,
      orderRef,
    });

    res.json({ success: true, order_id: order.id, order_ref: orderRef, whatsapp_url: buildWhatsAppUrl(message) });
  });

  // ── Paystack direct card charge flow ─────────────────────────────────────────
  // POST /checkout/card           → initiate charge (returns next_action or null)
  // POST /checkout/card/submit_pin → submit card PIN after send_pin
  // POST /checkout/card/submit_otp → submit OTP after send_otp
  //
  // next_action types: send_pin | send_otp | open_url | null (immediate success)
  // On success: payment marked 'paid', inventory reduced, email sent.
  // On open_url (3DS): frontend opens Paystack's 3DS URL; webhook confirms payment.

  // Shared helper — marks payment+order as paid, reduces inventory, sends email.
  // Idempotent: exits early if already paid.
  async function finalizePaystackPayment(reference, order) {
    const { data: pmt } = await db
      .from('payments')
      .select('id, status')
      .eq('checkout_request_id', reference)
      .maybeSingle();

    if (!pmt || pmt.status === 'paid') return; // already processed

    await db.from('payments').update({ status: 'paid', payment_reference: reference }).eq('id', pmt.id);
    await db.from('orders').update({ status: 'paid' }).eq('id', order.id);

    // Reduce stock for every line item
    const { data: orderItems } = await db
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', order.id);

    if (orderItems?.length) {
      const shortId = toShortId('ORD', order.order_number);
      await Promise.all(orderItems.map(async item => {
        const { data: prod } = await db.from('products').select('stock').eq('id', item.product_id).single();
        if (prod !== null) {
          await db.from('products')
            .update({ stock: Math.max(0, (prod.stock || 0) - item.quantity) })
            .eq('id', item.product_id);
        }
        await db.from('inventory_logs').insert({
          product_id:      item.product_id,
          staff_id:        null,
          quantity_change: -item.quantity,
          reason:          `Sale — Order ${shortId}`,
        });
      }));
      console.log(`[Paystack] Inventory reduced for order ${shortId}`);
    }

    // Send confirmation email
    if (order.customer_email) {
      const shortId = toShortId('ORD', order.order_number);
      transporter.sendMail({
        from:        `"Premier Beauty Clinic" <${process.env.SMTP_USER}>`,
        to:          order.customer_email,
        subject:     `Order Confirmed — ${shortId} · Premier Beauty Clinic`,
        attachments: [{ filename: 'logo.png', path: LOGO_PATH, cid: 'premier_logo' }],
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee">
            <div style="background:#1A1A1A;padding:28px 32px;text-align:center">
              <img src="cid:premier_logo" alt="Premier Beauty Clinic" style="height:48px;object-fit:contain" />
            </div>
            <div style="background:#6D4C91;padding:24px 32px;text-align:center">
              <p style="color:rgba(255,255,255,0.7);font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px">Order Confirmed</p>
              <h2 style="color:#fff;margin:0;font-size:22px">${shortId}</h2>
            </div>
            <div style="padding:36px 32px">
              <p style="color:#555;margin:0 0 24px;font-size:15px">
                Thank you for your purchase! Your order has been received and payment confirmed via card.
              </p>
              <table style="background:#FDFBF7;border-radius:10px;padding:20px;width:100%;border-collapse:collapse">
                <tr>
                  <td style="padding:8px 12px;color:#888;font-size:13px;width:140px">Order ID</td>
                  <td style="padding:8px 12px;font-weight:bold;font-size:14px;color:#6D4C91">${shortId}</td>
                </tr>
                <tr>
                  <td style="padding:8px 12px;color:#888;font-size:13px">Payment Ref</td>
                  <td style="padding:8px 12px;font-weight:bold;font-size:14px">${reference}</td>
                </tr>
                <tr>
                  <td style="padding:8px 12px;color:#888;font-size:13px">Amount Paid</td>
                  <td style="padding:8px 12px;font-weight:bold;font-size:14px">KES ${Number(order.total).toLocaleString()}</td>
                </tr>
              </table>
              <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:4px;margin:24px 0 0;font-size:13px;color:#166534">
                <strong>What's next?</strong> Your order will be packed and dispatched within 1–2 business days. You'll receive a shipping update by email.
              </div>
            </div>
            <div style="background:#FDFBF7;padding:20px 32px;text-align:center;border-top:1px solid #eee">
              <p style="color:#aaa;font-size:12px;margin:0">© ${new Date().getFullYear()} Premier Beauty Clinic · Nairobi, Kenya</p>
              <p style="color:#aaa;font-size:12px;margin:6px 0 0">Questions? Email us at ${process.env.SUPPORT_EMAIL || 'customersupport@premierbeautyclinic.com'}</p>
            </div>
          </div>`,
      }).catch(e => console.error('[Paystack] Card confirmation email failed:', e.message));
    }
  }

  // Translate a Paystack result status into the next_action shape the frontend expects.
  function buildCardNextAction(result) {
    if (result.status === 'success') return null;
    if (result.status === 'open_url') return { type: 'open_url', url: result.url, display_text: result.display_text };
    // send_pin | send_otp | send_phone | send_birthday
    return { type: result.status, display_text: result.display_text };
  }

  // POST /checkout/card — Paystack direct card charge
  router.post('/checkout/card', authenticateOptional, async (req, res) => {
    const paystack = require('../services/paystack');
    const userId    = req.user?.id;
    const sessionId = req.body.session_id || req.headers['x-session-id'];
    const { shipping_address, customer_email, billing, card } = req.body;

    if (!card?.number || !card?.expiry_month || !card?.expiry_year || !card?.cvv) {
      return res.status(400).json({ error: 'Card details are required' });
    }

    const normalizedShipping = normalizeShippingAddress(shipping_address);
    const finalEmail = customer_email || req.user?.email;

    if (!normalizedShipping) return res.status(400).json({ error: 'shipping_address required' });
    if (!userId && !sessionId) return res.status(400).json({ error: 'session_id or login required' });
    if (!finalEmail)           return res.status(400).json({ error: 'customer_email required for card payments' });

    const cart = await getOrCreateCart(userId, sessionId);
    if (!cart) return res.status(400).json({ error: 'Cart is empty' });

    const { data: cartItems } = await db
      .from('cart_items')
      .select('quantity, products(id, price)')
      .eq('cart_id', cart.id);

    if (!cartItems || cartItems.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    const validItems = cartItems.filter(item => item?.products?.id && item?.products?.price);
    if (validItems.length === 0) return res.status(400).json({ error: 'No valid products in cart' });

    let subtotal = 0;
    const orderItems = [];
    validItems.forEach(item => {
      const price = Number(item.products.price);
      subtotal += price * item.quantity;
      orderItems.push({ product_id: item.products.id, quantity: item.quantity, price_at_time: price });
    });

    const shipping_fee = typeof req.body.shipping_fee === 'number' ? Math.round(req.body.shipping_fee) : 200;
    const total = subtotal + shipping_fee;

    const orderData = {
      subtotal, shipping_fee, total,
      shipping_address: normalizedShipping,
      status:           'pending',
      payment_method:   'card',
      customer_email:   finalEmail,
    };
    if (userId)    orderData.user_id    = userId;
    if (sessionId) orderData.session_id = sessionId;

    const { data: order, error: orderError } = await db
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError || !order) {
      console.error('Card order insert failed:', orderError);
      return res.status(500).json({ error: orderError?.message || 'Failed to create order' });
    }

    await db.from('order_items').insert(orderItems.map(i => ({ ...i, order_id: order.id })));

    const reference = paystack.makeReference('PBC');

    await db.from('payments').insert({
      order_id:            order.id,
      amount:              total,
      status:              'pending',
      phone:               billing?.phone || null,
      checkout_request_id: reference,
    });

    try {
      const result = await paystack.chargeCard({
        email:  finalEmail,
        amount: total,
        reference,
        card: {
          number:       card.number,
          cvv:          card.cvv,
          expiry_month: card.expiry_month,
          expiry_year:  card.expiry_year,
        },
      });

      console.log('[Paystack] /checkout/card status:', result.status, '| ref:', reference);

      if (result.status === 'success') {
        await finalizePaystackPayment(reference, order);
        return res.json({ success: true, reference, order_id: order.id, next_action: null });
      }

      if (result.status === 'failed') {
        await db.from('payments').update({ status: 'failed', failure_reason: result.display_text }).eq('checkout_request_id', reference);
        await db.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
        return res.status(402).json({ error: result.display_text || 'Card payment was declined. Please try a different card.' });
      }

      // send_pin | send_otp | open_url — more steps required
      return res.json({ success: true, reference, order_id: order.id, next_action: buildCardNextAction(result) });

    } catch (err) {
      console.error('Paystack checkout error:', err.message);
      await db.from('payments').update({ status: 'failed' }).eq('checkout_request_id', reference);
      await db.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
      return res.status(502).json({ error: err.message || 'Failed to initiate card payment. Please try again.' });
    }
  });

  // POST /checkout/card/submit_pin — submit card PIN (called after send_pin)
  router.post('/checkout/card/submit_pin', authenticateOptional, async (req, res) => {
    const paystack = require('../services/paystack');
    const { reference, pin } = req.body;

    if (!reference || !pin) return res.status(400).json({ error: 'reference and pin are required' });

    try {
      const result = await paystack.submitPin(reference, pin);
      console.log('[Paystack] submitPin status:', result.status, '| ref:', reference);

      if (result.status === 'success') {
        const { data: pmt } = await db.from('payments').select('order_id').eq('checkout_request_id', reference).maybeSingle();
        if (pmt) {
          const { data: order } = await db.from('orders').select('*').eq('id', pmt.order_id).single();
          if (order) await finalizePaystackPayment(reference, order);
        }
        return res.json({ success: true, reference, next_action: null });
      }

      if (result.status === 'failed') {
        await db.from('payments').update({ status: 'failed', failure_reason: result.display_text }).eq('checkout_request_id', reference);
        const { data: pmt } = await db.from('payments').select('order_id').eq('checkout_request_id', reference).maybeSingle();
        if (pmt) await db.from('orders').update({ status: 'cancelled' }).eq('id', pmt.order_id);
        return res.status(402).json({ error: result.display_text || 'Card payment was declined.' });
      }

      return res.json({ success: true, reference, next_action: buildCardNextAction(result) });
    } catch (err) {
      console.error('Paystack submitPin error:', err.message);
      return res.status(502).json({ error: err.message || 'PIN authorization failed. Please try again.' });
    }
  });

  // POST /checkout/card/submit_otp — submit OTP (called after send_otp)
  router.post('/checkout/card/submit_otp', authenticateOptional, async (req, res) => {
    const paystack = require('../services/paystack');
    const { reference, otp } = req.body;

    if (!reference || !otp) return res.status(400).json({ error: 'reference and otp are required' });

    try {
      const result = await paystack.submitOtp(reference, otp);
      console.log('[Paystack] submitOtp status:', result.status, '| ref:', reference);

      if (result.status === 'success') {
        const { data: pmt } = await db.from('payments').select('order_id').eq('checkout_request_id', reference).maybeSingle();
        if (pmt) {
          const { data: order } = await db.from('orders').select('*').eq('id', pmt.order_id).single();
          if (order) await finalizePaystackPayment(reference, order);
        }
        return res.json({ success: true, reference, next_action: null });
      }

      if (result.status === 'failed') {
        await db.from('payments').update({ status: 'failed', failure_reason: result.display_text }).eq('checkout_request_id', reference);
        const { data: pmt } = await db.from('payments').select('order_id').eq('checkout_request_id', reference).maybeSingle();
        if (pmt) await db.from('orders').update({ status: 'cancelled' }).eq('id', pmt.order_id);
        return res.status(402).json({ error: result.display_text || 'OTP verification failed.' });
      }

      return res.json({ success: true, reference, next_action: buildCardNextAction(result) });
    } catch (err) {
      console.error('Paystack submitOtp error:', err.message);
      return res.status(502).json({ error: err.message || 'OTP authorization failed. Please try again.' });
    }
  });

  // POST /checkout/card/submit_phone — submit phone number (called after send_phone)
  router.post('/checkout/card/submit_phone', authenticateOptional, async (req, res) => {
    const paystack = require('../services/paystack');
    const { reference, phone } = req.body;
    if (!reference || !phone) return res.status(400).json({ error: 'reference and phone are required' });
    try {
      const result = await paystack.submitPhone(reference, phone);
      console.log('[Paystack] submitPhone status:', result.status, '| ref:', reference);
      if (result.status === 'success') {
        const { data: pmt } = await db.from('payments').select('order_id').eq('checkout_request_id', reference).maybeSingle();
        if (pmt) {
          const { data: order } = await db.from('orders').select('*').eq('id', pmt.order_id).single();
          if (order) await finalizePaystackPayment(reference, order);
        }
        return res.json({ success: true, reference, next_action: null });
      }
      if (result.status === 'failed') {
        await db.from('payments').update({ status: 'failed', failure_reason: result.display_text }).eq('checkout_request_id', reference);
        const { data: pmt } = await db.from('payments').select('order_id').eq('checkout_request_id', reference).maybeSingle();
        if (pmt) await db.from('orders').update({ status: 'cancelled' }).eq('id', pmt.order_id);
        return res.status(402).json({ error: result.display_text || 'Phone verification failed.' });
      }
      return res.json({ success: true, reference, next_action: buildCardNextAction(result) });
    } catch (err) {
      console.error('Paystack submitPhone error:', err.message);
      return res.status(502).json({ error: err.message || 'Phone verification failed. Please try again.' });
    }
  });

  // POST /checkout/card/submit_birthday — submit birthday (called after send_birthday)
  router.post('/checkout/card/submit_birthday', authenticateOptional, async (req, res) => {
    const paystack = require('../services/paystack');
    const { reference, birthday } = req.body; // birthday: YYYY-MM-DD
    if (!reference || !birthday) return res.status(400).json({ error: 'reference and birthday are required' });
    try {
      const result = await paystack.submitBirthday(reference, birthday);
      console.log('[Paystack] submitBirthday status:', result.status, '| ref:', reference);
      if (result.status === 'success') {
        const { data: pmt } = await db.from('payments').select('order_id').eq('checkout_request_id', reference).maybeSingle();
        if (pmt) {
          const { data: order } = await db.from('orders').select('*').eq('id', pmt.order_id).single();
          if (order) await finalizePaystackPayment(reference, order);
        }
        return res.json({ success: true, reference, next_action: null });
      }
      if (result.status === 'failed') {
        await db.from('payments').update({ status: 'failed', failure_reason: result.display_text }).eq('checkout_request_id', reference);
        const { data: pmt } = await db.from('payments').select('order_id').eq('checkout_request_id', reference).maybeSingle();
        if (pmt) await db.from('orders').update({ status: 'cancelled' }).eq('id', pmt.order_id);
        return res.status(402).json({ error: result.display_text || 'Birthday verification failed.' });
      }
      return res.json({ success: true, reference, next_action: buildCardNextAction(result) });
    } catch (err) {
      console.error('Paystack submitBirthday error:', err.message);
      return res.status(502).json({ error: err.message || 'Birthday verification failed. Please try again.' });
    }
  });

  // Payment status polling — frontend calls this every few seconds after sending STK push.
  // Returns the payment status ('pending', 'paid', 'failed') and the order_id once paid.
  // No auth needed — the checkout_request_id is a unique secret only the payer knows.
  router.get('/payment/status/:checkoutRequestId', async (req, res) => {
    const { checkoutRequestId } = req.params;

    // Basic format guard — Daraja IDs are alphanumeric strings, 10-40 chars
    if (!checkoutRequestId || !/^[a-zA-Z0-9_-]{6,60}$/.test(checkoutRequestId)) {
      return res.status(400).json({ error: 'Invalid payment reference' });
    }

    const { data, error } = await db
      .from('payments')
      .select('status, order_id, appointment_id')
      .eq('checkout_request_id', checkoutRequestId)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Payment not found' });
    res.json({ status: data.status, order_id: data.order_id, appointment_id: data.appointment_id });
  });

  // ── Availability — public, no auth needed ──
  // Returns which of the fixed TIME_SLOTS are already booked for a service on a given date.
  // Frontend uses this to grey out unavailable slots before the customer selects a time.
  const TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:30 AM', '01:30 PM', '02:30 PM', '04:00 PM', '05:00 PM'];
  const EAT_OFFSET_MS = 3 * 60 * 60 * 1000; // Kenya = UTC+3

  function slotToMins(slot) {
    const [time, meridiem] = slot.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (meridiem === 'PM' && h !== 12) h += 12;
    if (meridiem === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  }

  router.get('/services/:id/availability', async (req, res) => {
    const { date } = req.query; // YYYY-MM-DD (Kenya local date)
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'date query param required (YYYY-MM-DD)' });
    }

    const { data: service } = await db.from('services')
      .select('duration_minutes').eq('id', req.params.id).single();
    const serviceDuration = service?.duration_minutes || 60;

    // Clinic hours are 9am–5pm Kenya time; querying the full UTC day safely covers all slots
    const { data: apts } = await db
      .from('appointments')
      .select('appointment_time, services(duration_minutes)')
      .in('status', ['pending', 'confirmed'])
      .gte('appointment_time', `${date}T00:00:00.000Z`)
      .lte('appointment_time', `${date}T23:59:59.999Z`);

    // A slot is booked if any existing appointment's window overlaps with it
    const bookedSlots = TIME_SLOTS.filter(slot => {
      const slotMins    = slotToMins(slot);
      const slotEndMins = slotMins + serviceDuration;

      return (apts || []).some(apt => {
        // Convert stored UTC time → Kenya local time for comparison
        const localDate = new Date(new Date(apt.appointment_time).getTime() + EAT_OFFSET_MS);
        const aptMins    = localDate.getUTCHours() * 60 + localDate.getUTCMinutes();
        const aptEndMins = aptMins + (apt.services?.duration_minutes || 60);
        return slotMins < aptEndMins && slotEndMins > aptMins;
      });
    });

    res.json({ bookedSlots });
  });

  // Book appointment — handles both deposit-required and no-deposit services
  router.post('/appointments/book-mpesa', authenticate, async (req, res) => {
    const { service_id, appointment_time, form_responses, phone } = req.body;

    const { data: service } = await db
      .from('services')
      .select('name, base_price, deposit_percentage, duration_minutes')
      .eq('id', service_id)
      .single();

    if (!service) return res.status(400).json({ error: 'Invalid service_id' });

    // ── Double-booking check ──
    // Query appointments whose start time is within a 4-hour lookback window,
    // then check for exact overlap using the service duration.
    const newStart     = new Date(appointment_time).getTime();
    const durationMs   = (service.duration_minutes || 60) * 60000;
    const newEnd       = newStart + durationMs;
    const windowStart  = new Date(newStart - 4 * 3600000).toISOString();
    const windowEnd    = new Date(newEnd).toISOString();

    const { data: nearby } = await db
      .from('appointments')
      .select('id, appointment_time, services(duration_minutes)')
      .in('status', ['pending', 'confirmed'])
      .gte('appointment_time', windowStart)
      .lte('appointment_time', windowEnd);

    const hasConflict = (nearby || []).some(apt => {
      const existStart = new Date(apt.appointment_time).getTime();
      const existEnd   = existStart + (apt.services?.duration_minutes || 60) * 60000;
      return newStart < existEnd && newEnd > existStart;
    });

    if (hasConflict) {
      return res.status(409).json({ error: 'This time slot is already booked. Please choose a different time.' });
    }

    const total   = Number(service.base_price);
    const deposit = Math.round(total * ((service.deposit_percentage || 0) / 100));

    // ── Create appointment ──
    const { data: appointment, error: aptError } = await db
      .from('appointments')
      .insert({
        user_id:          req.user.id,
        service_id,
        appointment_time,
        form_responses,
        deposit_amount:   deposit,
        total_amount:     total,
        status:           'pending',
      })
      .select('*, appointment_number')
      .single();

    if (aptError || !appointment) {
      console.error('Appointment insert failed:', aptError);
      return res.status(500).json({ error: aptError?.message || 'Failed to create appointment' });
    }

    // ── No-deposit path: confirm immediately, no M-Pesa needed ──
    if (deposit === 0) {
      await db.from('appointments').update({ status: 'confirmed' }).eq('id', appointment.id);

      // Insert a zero-amount 'paid' payment record so dashboard shows "Paid"
      await db.from('payments').insert({
        appointment_id: appointment.id,
        amount:         0,
        phone:          phone || null,
        status:         'paid',
      });

      // Send confirmation email
      if (transporter) {
        const { data: profile } = await db
          .from('profiles')
          .select('email, full_name')
          .eq('id', req.user.id)
          .single();

        const profileEmail = profile?.email;
        if (profileEmail) {
          const shortAptId = toShortAptId(appointment.appointment_number);
          const aptDate    = new Date(appointment_time).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
          const aptTime    = new Date(appointment_time).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });

          transporter.sendMail({
            from:        `"Premier Beauty Clinic" <${process.env.SMTP_USER}>`,
            to:          profileEmail,
            subject:     `Appointment Confirmed — ${service.name} · Premier Beauty Clinic`,
            attachments: [{ filename: 'logo.png', path: LOGO_PATH, cid: 'premier_logo' }],
            html: `
              <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee">
                <div style="background:#1A1A1A;padding:28px 32px;text-align:center">
                  <img src="cid:premier_logo" alt="Premier Beauty Clinic" style="height:48px;object-fit:contain" />
                </div>
                <div style="background:#6D4C91;padding:24px 32px;text-align:center">
                  <p style="color:rgba(255,255,255,0.7);font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px">Appointment Confirmed</p>
                  <h2 style="color:#fff;margin:0;font-size:22px">${service.name}</h2>
                </div>
                <div style="padding:36px 32px">
                  <p style="color:#555;margin:0 0 24px;font-size:15px">Hi ${profile?.full_name || 'there'}! Your appointment is confirmed. We look forward to seeing you.</p>
                  <table style="background:#FDFBF7;border-radius:10px;padding:20px;width:100%;border-collapse:collapse">
                    <tr><td style="padding:8px 12px;color:#888;font-size:13px;width:140px">Booking Ref</td><td style="padding:8px 12px;font-weight:bold;font-size:14px;color:#6D4C91">${shortAptId}</td></tr>
                    <tr><td style="padding:8px 12px;color:#888;font-size:13px">Service</td><td style="padding:8px 12px;font-weight:bold;font-size:14px">${service.name}</td></tr>
                    <tr><td style="padding:8px 12px;color:#888;font-size:13px">Date</td><td style="padding:8px 12px;font-size:14px">${aptDate}</td></tr>
                    <tr><td style="padding:8px 12px;color:#888;font-size:13px">Time</td><td style="padding:8px 12px;font-size:14px">${aptTime}</td></tr>
                    <tr><td style="padding:8px 12px;color:#888;font-size:13px">Total Due</td><td style="padding:8px 12px;font-weight:bold;font-size:14px">KES ${total.toLocaleString()} (payable at clinic)</td></tr>
                  </table>
                  <div style="background:#f5f3ff;border-left:4px solid #6D4C91;padding:12px 16px;border-radius:4px;margin:24px 0 0;font-size:13px;color:#4c1d95">
                    <strong>📍 Location:</strong> Premier Beauty Clinic, Ngong Road, Nairobi<br>
                    <strong>⏰ Please arrive</strong> 5–10 minutes before your appointment time.
                  </div>
                </div>
                <div style="background:#FDFBF7;padding:20px 32px;text-align:center;border-top:1px solid #eee">
                  <p style="color:#aaa;font-size:12px;margin:0">© ${new Date().getFullYear()} Premier Beauty Clinic · Nairobi, Kenya</p>
                  <p style="color:#aaa;font-size:12px;margin:6px 0 0">Need to reschedule? Call or WhatsApp us at +254707259295</p>
                </div>
              </div>
            `,
          }).catch(err => console.error('Confirmation email failed:', err));
        }
      }

      return res.json({ success: true, free: true, appointment_id: appointment.id });
    }

    // ── Deposit-required path: validate phone + trigger STK push ──
    const normalizedPhone = normalizeMpesaPhone(phone);
    if (!/^2547\d{8}$|^2541\d{8}$/.test(normalizedPhone)) {
      return res.status(400).json({ error: 'Invalid phone number. Use a valid Kenyan M-Pesa number.' });
    }

    const { data: payment } = await db
      .from('payments')
      .insert({ appointment_id: appointment.id, amount: deposit, phone: normalizedPhone, status: 'pending' })
      .select()
      .single();

    try {
      const aptRef = `APT-${appointment.appointment_number || appointment.id.slice(0, 7)}`;
      const stkResult = await initiateSTKPush(normalizedPhone, deposit, aptRef);
      await db.from('payments').update({ checkout_request_id: stkResult.CheckoutRequestID }).eq('id', payment.id);
      res.json({ success: true, free: false, checkout_request_id: stkResult.CheckoutRequestID, appointment_id: appointment.id });
    } catch (error) {
      const daraja = error.response?.data;
      console.error('STK push failed — Daraja response:', daraja || error.message);
      await db.from('payments').update({ status: 'failed' }).eq('id', payment.id);
      const message = daraja?.errorMessage || daraja?.ResultDesc || daraja?.error_message || error.message || 'Failed to initiate M-Pesa payment.';
      res.status(502).json({ error: message, daraja });
    }
  });

  // ── WhatsApp booking handoff (M-Pesa/card paused) ─────────────────────────────
  // Creates the appointment as 'pending' with no deposit/payment attempt, then
  // hands back a pre-filled wa.me link. Stays 'pending' until staff manually
  // confirm it via POST /admin/appointments/:id/confirm (unlocks check-in).
  router.post('/appointments/book-whatsapp', authenticate, async (req, res) => {
    const { service_id, appointment_time, form_responses, phone } = req.body;

    const { data: service } = await db
      .from('services')
      .select('name, base_price, duration_minutes')
      .eq('id', service_id)
      .single();

    if (!service) return res.status(400).json({ error: 'Invalid service_id' });

    // Same double-booking check as /appointments/book-mpesa
    const newStart     = new Date(appointment_time).getTime();
    const durationMs   = (service.duration_minutes || 60) * 60000;
    const newEnd       = newStart + durationMs;
    const windowStart  = new Date(newStart - 4 * 3600000).toISOString();
    const windowEnd    = new Date(newEnd).toISOString();

    const { data: nearby } = await db
      .from('appointments')
      .select('id, appointment_time, services(duration_minutes)')
      .in('status', ['pending', 'confirmed'])
      .gte('appointment_time', windowStart)
      .lte('appointment_time', windowEnd);

    const hasConflict = (nearby || []).some(apt => {
      const existStart = new Date(apt.appointment_time).getTime();
      const existEnd   = existStart + (apt.services?.duration_minutes || 60) * 60000;
      return newStart < existEnd && newEnd > existStart;
    });

    if (hasConflict) {
      return res.status(409).json({ error: 'This time slot is already booked. Please choose a different time.' });
    }

    const total = Number(service.base_price);

    const { data: appointment, error: aptError } = await db
      .from('appointments')
      .insert({
        user_id:          req.user.id,
        service_id,
        appointment_time,
        form_responses,
        deposit_amount:   0,
        total_amount:     total,
        status:           'pending',
      })
      .select('*, appointment_number')
      .single();

    if (aptError || !appointment) {
      console.error('WhatsApp appointment insert failed:', aptError);
      return res.status(500).json({ error: aptError?.message || 'Failed to create appointment' });
    }

    const { data: profile } = await db
      .from('profiles')
      .select('full_name, phone')
      .eq('id', req.user.id)
      .single();

    const customerName = profile?.full_name || 'Customer';
    const customerPhone = phone || profile?.phone || '';
    const aptRef = toShortAptId(appointment.appointment_number);
    const timeLabel = new Date(appointment_time)
      .toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', hour12: true })
      .replace(/am|pm/i, m => m.toUpperCase());
    const dateLabel = `${new Date(appointment_time).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })} — ${timeLabel}`;
    const hidePrice = !(total > 0 && total <= 20000);

    const message = buildBookingMessage({
      customerName,
      phone: customerPhone,
      serviceName: service.name,
      dateLabel,
      priceKes: hidePrice ? null : total,
      aptRef,
    });

    res.json({ success: true, appointment_id: appointment.id, whatsapp_url: buildWhatsAppUrl(message) });
  });

  // Delete account — cleans up dependent rows first to avoid FK constraint errors,
  // then removes the auth user (which cascades to the profiles row).
  router.delete('/account', authenticate, async (req, res) => {
    const adminClient = createServiceClient();
    const userId = req.user.id;

    try {
      // 1. Delete cart items then the cart itself
      const { data: cart } = await adminClient
        .from('carts').select('id').eq('user_id', userId).maybeSingle();
      if (cart) {
        await adminClient.from('cart_items').delete().eq('cart_id', cart.id);
        await adminClient.from('carts').delete().eq('id', cart.id);
      }

      // 2. Nullify user_id on orders & order_items so business records are kept
      await adminClient.from('orders').update({ user_id: null }).eq('user_id', userId);

      // 3. Nullify user_id on appointments so booking history is kept
      await adminClient.from('appointments').update({ user_id: null }).eq('user_id', userId);

      // 4. Delete the profile row (FK to auth.users — must go before deleteUser)
      await adminClient.from('profiles').delete().eq('id', userId);

      // 5. Finally delete the auth user
      const { error } = await adminClient.auth.admin.deleteUser(userId);
      if (error) return res.status(400).json({ error: error.message });

      res.json({ success: true });
    } catch (err) {
      console.error('[Delete account] error:', err.message);
      res.status(500).json({ error: 'Database error deleting user' });
    }
  });

  // History
  router.get('/orders', authenticate, async (req, res) => {
    const { data, error } = await db
      .from('orders')
      .select('*, order_number, order_items(id, product_id, quantity, price_at_time, products(id, name, size, price, images))')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) console.error('[Orders] Query error:', error.message);
    res.json(data || []);
  });

  // Public: shipping regions (used at checkout to show delivery options)
  router.get('/shipping-regions', async (_req, res) => {
    const { data, error } = await db
      .from('shipping_regions')
      .select('id, country, region, county, fee')
      .order('country')
      .order('county');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  });

  router.get('/appointments', authenticate, async (req, res) => {
    // Use service client so the payments join isn't blocked by RLS
    const { data, error } = await db
      .from('appointments')
      .select('*, appointment_number, services(name), payments(status, mpesa_receipt, failure_reason)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) console.error('[Appointments] Query error:', error.message);
    res.json(data || []);
  });

  // ── Reviews ──────────────────────────────────────────────────────────────────
  // GET /reviews?product_id=X  → approved reviews for a product
  // GET /reviews?service_id=X  → approved reviews for a service
  router.get('/reviews', async (req, res) => {
    const { product_id, service_id } = req.query;
    if (!product_id && !service_id) {
      return res.status(400).json({ error: 'product_id or service_id required' });
    }
    let query = supabase
      .from('reviews')
      .select('id, reviewer_name, rating, title, body, is_verified_purchase, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (product_id) query = query.eq('product_id', product_id);
    else            query = query.eq('service_id', service_id);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  });

  // GET /reviews/featured?limit=N — recent high-rated approved product reviews, for homepage social proof
  router.get('/reviews/featured', async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 20);
    const { data, error } = await supabase
      .from('reviews')
      .select('id, reviewer_name, rating, title, body, is_verified_purchase, created_at, product_id, products(id, name, size, images, price)')
      .eq('status', 'approved')
      .not('product_id', 'is', null)
      .gte('rating', 4)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) return res.status(500).json({ error: error.message });
    res.json((data || []).filter(r => r.products));
  });

  // POST /reviews — submit a new review (status = 'pending', awaits staff approval)
  router.post('/reviews', authenticateOptional, async (req, res) => {
    const { product_id, service_id, reviewer_name, reviewer_email, rating, title, body } = req.body;

    if (!product_id && !service_id) return res.status(400).json({ error: 'product_id or service_id required' });
    if (!reviewer_name?.trim()) return res.status(400).json({ error: 'reviewer_name required' });
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'rating must be 1–5' });
    if (!title?.trim()) return res.status(400).json({ error: 'title required' });
    if (!body?.trim()) return res.status(400).json({ error: 'body required' });

    const payload = {
      reviewer_name: reviewer_name.trim().slice(0, 80),
      reviewer_email: reviewer_email?.trim() || null,
      rating: parseInt(rating, 10),
      title: title.trim().slice(0, 120),
      body: body.trim().slice(0, 1000),
      status: 'pending',
      user_id: req.user?.id || null,
    };

    if (product_id) {
      payload.product_id = parseInt(product_id, 10);
      // Mark as verified purchase if user has ordered this product
      if (req.user?.id) {
        const { data: bought } = await db
          .from('order_items')
          .select('id')
          .eq('product_id', payload.product_id)
          .limit(1);
        if (bought?.length) payload.is_verified_purchase = true;
      }
    } else {
      payload.service_id = service_id;
    }

    const { error } = await db.from('reviews').insert(payload);
    if (error) return res.status(500).json({ error: error.message });

    res.json({ success: true, message: 'Review submitted and awaiting approval. Thank you!' });
  });

  return router;
};
