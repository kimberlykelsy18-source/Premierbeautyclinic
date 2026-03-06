const express = require('express');

// Customer-facing routes (auth, products, cart, checkout, appointments)
const path = require('path');
const LOGO_PATH = path.join(__dirname, '../../src/assets/logo.png');

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
    const { data: sourceItems } = await supabase
      .from('cart_items')
      .select('product_id, quantity')
      .eq('cart_id', sourceCartId);

    if (!sourceItems || sourceItems.length === 0) return;

    const { data: destItems } = await supabase
      .from('cart_items')
      .select('product_id, quantity')
      .eq('cart_id', destinationCartId);

    const destMap = new Map((destItems || []).map(item => [item.product_id, item.quantity]));

    const merged = sourceItems.map(item => ({
      cart_id: destinationCartId,
      product_id: item.product_id,
      quantity: (destMap.get(item.product_id) || 0) + item.quantity
    }));

    await supabase.from('cart_items').upsert(merged, { onConflict: 'cart_id,product_id' });
  }

  async function getOrCreateCart(userId, sessionId) {
    let userCart = null;
    let sessionCart = null;

    if (userId) {
      const { data } = await supabase.from('carts').select('id').eq('user_id', userId).single();
      userCart = data || null;
    }

    if (sessionId) {
      const { data } = await supabase.from('carts').select('id').eq('session_id', sessionId).single();
      sessionCart = data || null;
    }

    if (userId && sessionId && sessionCart) {
      if (!userCart) {
        const { data } = await supabase
          .from('carts')
          .update({ user_id: userId, session_id: null })
          .eq('id', sessionCart.id)
          .select()
          .single();
        return data;
      }

      if (userCart.id !== sessionCart.id) {
        await mergeCartItems(userCart.id, sessionCart.id);
        await supabase.from('cart_items').delete().eq('cart_id', sessionCart.id);
        await supabase.from('carts').delete().eq('id', sessionCart.id);
      }

      return userCart;
    }

    if (userCart) return userCart;
    if (sessionCart) return sessionCart;

    if (!userId && !sessionId) return null;

    const insertData = userId ? { user_id: userId } : { session_id: sessionId };
    const { data: newCart } = await supabase.from('carts').insert(insertData).select().single();
    return newCart;
  }

  const { createServiceClient } = require('../config/supabase');

  // Auth
  router.post('/auth/signup', async (req, res) => {
    const { email, password, full_name, phone } = req.body;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name, phone } }
    });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true, user: data.user, session: data.session });
  });

  router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ error: error.message });
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
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, marketing_consent, shipping_address')
      .eq('id', req.user.id)
      .single();
    if (error || !data) return res.status(404).json({ error: 'Profile not found' });
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

    const { error } = await supabase
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

    // Clear temp-password flag if this is an employee (no-op for customers)
    await supabase.from('employees').update({ is_temporary_password: false }).eq('id', req.user.id);

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

    const { data: ratings } = await supabase
      .from('product_ratings')
      .select('rating')
      .eq('product_id', req.params.id);

    const rating_count = ratings?.length || 0;
    const average_rating = rating_count > 0
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / rating_count).toFixed(1)
      : '0';

    product.product_avg_ratings = { average_rating, rating_count: String(rating_count) };
    res.json(product);
  });

  // Services
  router.get('/services', async (req, res) => {
    const { data, error } = await supabase
      .from('services')
      .select('id, name, slug, description, base_price, deposit_percentage, duration_minutes, images, category, form_fields')
      .eq('is_active', true)
      .order('category')
      .order('name');
    if (error) return res.status(400).json(error);
    res.json(data);
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

    const { data: items } = await supabase
      .from('cart_items')
      .select('quantity, products(id, name, price, images)')
      .eq('cart_id', cart.id);

    res.json({ cart_id: cart.id, items: items || [] });
  });

  router.post('/cart/add', authenticateOptional, async (req, res) => {
    const { product_id, quantity = 1 } = req.body;
    const sessionId = req.headers['x-session-id'];
    const userId = req.user?.id || null;

    if (!product_id) return res.status(400).json({ error: 'product_id required' });
    if (!userId && !sessionId) return res.status(400).json({ error: 'session id or login required' });

    const cart = await getOrCreateCart(userId, sessionId);
    if (!cart) return res.status(500).json({ error: 'Failed to create cart' });

    const { error } = await supabase
      .from('cart_items')
      .upsert({ cart_id: cart.id, product_id, quantity }, { onConflict: 'cart_id,product_id' });
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

    await supabase.from('cart_items').delete().eq('cart_id', cart.id).eq('product_id', product_id);
    res.json({ success: true });
  });

  router.post('/cart/clear', authenticateOptional, async (req, res) => {
    const sessionId = req.headers['x-session-id'];
    const userId = req.user?.id || null;

    if (!userId && !sessionId) return res.status(400).json({ error: 'session id or login required' });

    const cart = await getOrCreateCart(userId, sessionId);
    if (cart) await supabase.from('cart_items').delete().eq('cart_id', cart.id);

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

    const { data: cartItems } = await supabase
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

    // Use the shipping fee sent by the frontend (calculated from the county).
    // Falls back to 200 if missing, but the frontend always sends it.
    const shipping_fee = typeof req.body.shipping_fee === 'number'
      ? Math.round(req.body.shipping_fee)
      : 200;
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
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order insert failed:', orderError);
      return res.status(500).json({ error: orderError?.message || 'Failed to create order' });
    }

    await supabase.from('order_items').insert(orderItems.map(i => ({ ...i, order_id: order.id })));

    const { data: payment } = await supabase
      .from('payments')
      .insert({ order_id: order.id, amount: total, phone: normalizedPhone, status: 'pending' })
      .select()
      .single();

    try {
      const ordRef = `ORD-${order.order_number || order.id.slice(0, 7)}`;
      const stkResult = await initiateSTKPush(normalizedPhone, total, ordRef);

      if (payment) {
        await supabase
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
        await supabase.from('payments').update({ status: 'failed' }).eq('id', payment.id);
      }
      const message = darajaError?.errorMessage || 'Failed to initiate M-Pesa payment. Please check your phone number and try again.';
      return res.status(502).json({ error: message });
    }
  });

  // Payment status polling — frontend calls this every few seconds after sending STK push.
  // Returns the payment status ('pending', 'paid', 'failed') and the order_id once paid.
  // No auth needed — the checkout_request_id is a unique secret only the payer knows.
  router.get('/payment/status/:checkoutRequestId', async (req, res) => {
    const { checkoutRequestId } = req.params;
    const { data, error } = await supabase
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
        const { data: profile } = await supabase
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
            from:        `"Premier Beauty Clinic" <${process.env.GMAIL_EMAIL}>`,
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

  // Delete account — permanently removes the auth user (cascades to profile via Supabase FK)
  router.delete('/account', authenticate, async (req, res) => {
    const adminClient = createServiceClient();
    const { error } = await adminClient.auth.admin.deleteUser(req.user.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // History
  router.get('/orders', authenticate, async (req, res) => {
    const { data, error } = await db
      .from('orders')
      .select('*, order_number, order_items(id, product_id, quantity, price_at_time, products(id, name, price, images))')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) console.error('[Orders] Query error:', error.message);
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

  return router;
};
