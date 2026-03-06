const express = require('express');
const path    = require('path');

const LOGO_PATH = path.join(__dirname, '../../src/assets/logo.png');

// Admin dashboard routes (inventory, orders, appointments, sales)
module.exports = ({ supabase, serviceSupabase, authenticate, requireEmployeePermission, initiateSTKPush, transporter }) => {
  // Use service client for queries that need to bypass RLS (e.g. payments join)
  const adminDb = serviceSupabase || supabase;
  const router = express.Router();

  // Inventory + low stock alerts
  router.get('/admin/inventory', authenticate, requireEmployeePermission('view_inventory'), async (req, res) => {
    const { data: products } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('stock', { ascending: true });

    const lowStock = products.filter(p => p.stock <= (p.low_stock_threshold || 5));

    res.json({ products, lowStockAlerts: lowStock });
  });

  // Add stock
  router.post('/admin/stock/add', authenticate, requireEmployeePermission('edit_stock'), async (req, res) => {
    const { product_id, quantity } = req.body;
    if (!product_id || !quantity || Number(quantity) <= 0) {
      return res.status(400).json({ error: 'product_id and a positive quantity are required' });
    }
    // Fetch current stock, then increment — avoids relying on a missing RPC function
    const { data: product, error: fetchErr } = await adminDb
      .from('products')
      .select('stock')
      .eq('id', product_id)
      .single();
    if (fetchErr || !product) return res.status(404).json({ error: 'Product not found' });

    const newStock = (product.stock || 0) + Number(quantity);
    const { error: updateErr } = await adminDb
      .from('products')
      .update({ stock: newStock })
      .eq('id', product_id);
    if (updateErr) return res.status(500).json({ error: updateErr.message });

    res.json({ success: true, stock: newStock });
  });

  // Orders + mark delivered
  router.get('/admin/orders', authenticate, requireEmployeePermission('view_orders'), async (req, res) => {
    const { data, error } = await adminDb
      .from('orders')
      .select('*, order_number, order_items(*, products(name)), deliveries(*), payments(status, checkout_request_id, mpesa_receipt, failure_reason, phone)')
      .order('created_at', { ascending: false });
    if (error) console.error('[Admin Orders] Query error:', error.message);
    res.json(data || []);
  });

  router.post('/admin/orders/:id/deliver', authenticate, requireEmployeePermission('mark_delivered'), async (req, res) => {
    await Promise.all([
      adminDb.from('delivery_updates').insert({
        order_id: req.params.id,
        status: 'delivered',
        notes: req.body.notes,
        updated_by: req.user.id,
      }),
      adminDb.from('orders').update({ status: 'delivered' }).eq('id', req.params.id),
    ]);
    res.json({ success: true });
  });

  // General order status update (shipped, pending/processing, cancelled)
  router.patch('/admin/orders/:id/status', authenticate, requireEmployeePermission('mark_delivered'), async (req, res) => {
    const { status, notes } = req.body;
    const allowed = ['pending', 'shipped', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const ops = [adminDb.from('orders').update({ status }).eq('id', req.params.id)];
    if (status === 'shipped') {
      ops.push(adminDb.from('delivery_updates').insert({
        order_id: req.params.id,
        status: 'shipped',
        notes: notes || null,
        updated_by: req.user.id,
      }));
    }
    await Promise.all(ops);
    res.json({ success: true });
  });

  // Appointments
  router.get('/admin/appointments', authenticate, requireEmployeePermission('view_appointments'), async (req, res) => {
    const { data, error } = await adminDb
      .from('appointments')
      .select('*, appointment_number, practitioner, services(name, base_price, deposit_percentage), profiles(full_name, phone), payments(status, mpesa_receipt, amount, failure_reason)')
      .not('status', 'eq', 'failed')
      .order('appointment_time');
    if (error) console.error('[Admin Appointments] Query error:', error.message);
    res.json(data || []);
  });

  router.post('/admin/appointments/:id/complete', authenticate, requireEmployeePermission('complete_appointment'), async (req, res) => {
    const update = { status: 'completed' };
    if (req.body.practitioner) update.practitioner = req.body.practitioner;
    await adminDb.from('appointments').update(update).eq('id', req.params.id);
    res.json({ success: true });
  });

  // Check-in payment — used for zero-deposit or balance-collection at the clinic.
  // Creates a payment record and triggers an STK push to the customer's phone.
  // The M-Pesa callback will then set appointment → 'completed' and send the final email.
  router.post('/admin/appointments/:id/checkin-pay', authenticate, requireEmployeePermission('complete_appointment'), async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'phone is required' });

    const { data: apt, error: aptErr } = await adminDb
      .from('appointments')
      .select('id, total_amount, deposit_amount, status, service_id')
      .eq('id', req.params.id)
      .single();

    if (aptErr || !apt) return res.status(404).json({ error: 'Appointment not found' });
    if (apt.status === 'completed' || apt.status === 'failed') {
      return res.status(400).json({ error: `Appointment is already ${apt.status}` });
    }

    // Amount to collect = full price minus whatever deposit was already paid
    const amountToCollect = Math.round(apt.total_amount - (apt.deposit_amount || 0));
    if (amountToCollect <= 0) {
      // Nothing to collect — just complete it directly
      await adminDb.from('appointments').update({ status: 'completed' }).eq('id', apt.id);
      return res.json({ success: true, free: true });
    }

    // Normalize phone
    const digits = String(phone).replace(/\D/g, '');
    let normalized = digits;
    if (digits.startsWith('0') && digits.length === 10) normalized = '254' + digits.slice(1);
    else if (digits.startsWith('7') && digits.length === 9) normalized = '254' + digits;

    if (!/^2547\d{8}$|^2541\d{8}$/.test(normalized)) {
      return res.status(400).json({ error: 'Invalid phone number. Use a valid Kenyan M-Pesa number.' });
    }

    // Insert pending payment
    const { data: payment, error: payErr } = await adminDb
      .from('payments')
      .insert({ appointment_id: apt.id, amount: amountToCollect, phone: normalized, status: 'pending' })
      .select()
      .single();

    if (payErr || !payment) return res.status(500).json({ error: 'Failed to create payment record' });

    try {
      const aptRef = `BAL-${req.params.id.slice(0, 7)}`;
      const stkResult = await initiateSTKPush(normalized, amountToCollect, aptRef);
      await adminDb.from('payments').update({ checkout_request_id: stkResult.CheckoutRequestID }).eq('id', payment.id);
      res.json({ success: true, free: false, checkout_request_id: stkResult.CheckoutRequestID });
    } catch (err) {
      const daraja = err.response?.data;
      await adminDb.from('payments').update({ status: 'failed' }).eq('id', payment.id);
      const message = daraja?.errorMessage || err.message || 'Failed to initiate M-Pesa payment.';
      res.status(502).json({ error: message });
    }
  });

  // ── Phone normaliser (reused across walk-in endpoints) ──────────────────────
  function normalizePhone(phone) {
    const digits = String(phone).replace(/\D/g, '');
    if (digits.startsWith('0') && digits.length === 10) return '254' + digits.slice(1);
    if (digits.startsWith('7') && digits.length === 9)  return '254' + digits;
    return digits;
  }

  // Walk-ins — create with smart payment logic
  // Rules:
  //   appointment is TODAY (or no date set = immediate walk-in) → charge full price
  //   future date + service has deposit_percentage > 0          → charge deposit only
  //   future date + service has no deposit (deposit_pct = 0)    → no payment, send email only
  router.post('/admin/walkin', authenticate, requireEmployeePermission('create_walkin'), async (req, res) => {
    const { customer_name, phone, email, service_id, practitioner, notes, appointment_time } = req.body;

    if (!customer_name?.trim()) return res.status(400).json({ error: 'Customer name is required' });
    if (!service_id)            return res.status(400).json({ error: 'Service is required' });

    // ── 1. Fetch service pricing ──────────────────────────────────────────────
    const { data: svc } = await adminDb.from('services')
      .select('name, base_price, deposit_percentage, duration_minutes')
      .eq('id', service_id)
      .single();

    if (!svc) return res.status(400).json({ error: 'Service not found' });

    const basePrice  = Number(svc.base_price) || 0;
    const depositPct = svc.deposit_percentage ?? 0;
    const hasDeposit = depositPct > 0;

    // ── 2. Determine if appointment is today ─────────────────────────────────
    let isAppointmentToday = true; // no date = immediate walk-in = today
    if (appointment_time) {
      const aptDate   = new Date(appointment_time).toISOString().slice(0, 10);
      const todayDate = new Date().toISOString().slice(0, 10);
      isAppointmentToday = aptDate === todayDate;
    }

    // ── 3. Compute payment amount ─────────────────────────────────────────────
    let paymentAmount = 0;
    let paymentType   = 'none'; // 'full' | 'deposit' | 'none'
    if (isAppointmentToday) {
      paymentAmount = basePrice;
      paymentType   = 'full';
    } else if (hasDeposit) {
      paymentAmount = Math.round((basePrice * depositPct) / 100);
      paymentType   = 'deposit';
    }

    // ── 4. Slot conflict check (only for scheduled future appointments) ───────
    if (appointment_time && service_id && !isAppointmentToday) {
      const durationMs  = (svc.duration_minutes || 60) * 60000;
      const newStart    = new Date(appointment_time).getTime();
      const newEnd      = newStart + durationMs;
      const windowStart = new Date(newStart - 4 * 3600000).toISOString();
      const windowEnd   = new Date(newEnd).toISOString();

      const { data: nearby } = await adminDb
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
        return res.status(409).json({ error: 'That time slot already has a booking. Please choose a different time.' });
      }
    }

    // ── 5. Insert walk-in (created_by intentionally omitted — see FK note) ───
    const { data: walkin, error: wiErr } = await adminDb.from('walk_ins').insert({
      customer_name:    customer_name.trim(),
      phone:            phone || null,
      email:            email || null,
      service_id:       Number(service_id) || null,
      deposit_paid:     paymentAmount,
      notes:            notes || null,
      appointment_time: appointment_time || null,
      practitioner:     practitioner || null,
    }).select().single();

    if (wiErr) console.error('[Walk-in insert error]', wiErr.message);
    if (wiErr || !walkin) return res.status(500).json({ error: wiErr?.message || 'Failed to record walk-in' });

    // ── 6. STK push (when payment is required and phone is available) ─────────
    if (paymentAmount > 0 && phone) {
      const normalized = normalizePhone(phone);
      if (/^2547\d{8}$|^2541\d{8}$/.test(normalized)) {
        try {
          const { data: payment } = await adminDb.from('payments').insert({
            walk_in_id: walkin.id,
            amount:     paymentAmount,
            phone:      normalized,
            status:     'pending',
          }).select().single();

          const ref = `WLK-${walkin.id.slice(0, 7)}`;
          const stkResult = await initiateSTKPush(normalized, paymentAmount, ref);
          await adminDb.from('payments')
            .update({ checkout_request_id: stkResult.CheckoutRequestID })
            .eq('id', payment.id);

          return res.json({ ...walkin, checkout_request_id: stkResult.CheckoutRequestID });
        } catch (err) {
          const daraja = err.response?.data;
          console.error('[Walk-in STK]', daraja?.errorMessage || err.message);
          // Walk-in recorded — STK failed. Return without checkout_request_id so frontend can inform staff.
        }
      }
    }

    // ── 7. No payment required — send booking confirmation email ──────────────
    if (paymentAmount === 0 && email) {
      const aptDate = appointment_time
        ? new Date(appointment_time).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        : new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const aptTime = appointment_time
        ? new Date(appointment_time).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
        : 'Today';

      transporter.sendMail({
        from: `"Premier Beauty Clinic" <${process.env.GMAIL_EMAIL}>`,
        to: email,
        subject: `Booking Received — ${svc.name} · Premier Beauty Clinic`,
        attachments: [{ filename: 'logo.png', path: LOGO_PATH, cid: 'premier_logo' }],
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee">
            <div style="background:#1A1A1A;padding:28px 32px;text-align:center">
              <img src="cid:premier_logo" alt="Premier Beauty Clinic" style="height:48px;object-fit:contain" />
            </div>
            <div style="background:#0f766e;padding:24px 32px;text-align:center">
              <p style="color:rgba(255,255,255,0.8);font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px">Booking Confirmed</p>
              <h2 style="color:#fff;margin:0;font-size:22px">${svc.name}</h2>
            </div>
            <div style="padding:36px 32px">
              <p style="color:#555;margin:0 0 24px;font-size:15px">
                Hi <strong>${customer_name.trim()}</strong>, your appointment has been booked. No advance payment is required — please pay at the clinic on the day.
              </p>
              <table style="background:#FDFBF7;border-radius:10px;padding:20px;width:100%;border-collapse:collapse">
                <tr><td style="padding:8px 12px;color:#888;font-size:13px;width:140px">Service</td><td style="padding:8px 12px;font-weight:bold;font-size:14px">${svc.name}</td></tr>
                <tr><td style="padding:8px 12px;color:#888;font-size:13px">Date</td><td style="padding:8px 12px;font-size:14px">${aptDate}</td></tr>
                <tr><td style="padding:8px 12px;color:#888;font-size:13px">Time</td><td style="padding:8px 12px;font-size:14px">${aptTime}</td></tr>
                <tr><td style="padding:8px 12px;color:#888;font-size:13px">Total Fee</td><td style="padding:8px 12px;font-weight:bold;font-size:14px">KES ${basePrice.toLocaleString()}</td></tr>
                <tr><td style="padding:8px 12px;color:#888;font-size:13px">Payment</td><td style="padding:8px 12px;font-size:14px;color:#0f766e;font-weight:bold">Pay at clinic</td></tr>
                ${practitioner ? `<tr><td style="padding:8px 12px;color:#888;font-size:13px">Practitioner</td><td style="padding:8px 12px;font-size:14px">${practitioner}</td></tr>` : ''}
              </table>
              <div style="background:#f0fdf4;border-left:4px solid #0f766e;padding:12px 16px;border-radius:4px;margin:24px 0 0;font-size:13px;color:#065f46">
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
      }).catch(err => console.error('[Walk-in no-payment email]', err.message));
    }

    res.json(walkin);
  });

  // Walk-ins — list (for dashboard display)
  router.get('/admin/walkins', authenticate, requireEmployeePermission('view_appointments'), async (req, res) => {
    const { data, error } = await adminDb
      .from('walk_ins')
      .select('*, walk_in_number, email, practitioner, services(name, base_price, deposit_percentage), payments(id, status, mpesa_receipt, amount, failure_reason, checkout_request_id)')
      .order('created_at', { ascending: false });
    if (error) console.error('[Admin Walk-ins] Query error:', error.message);
    res.json(data || []);
  });

  // Walk-ins — collect payment after the fact (STK push to already-recorded walk-in)
  router.post('/admin/walkins/:id/pay', authenticate, requireEmployeePermission('create_walkin'), async (req, res) => {
    const { phone, amount } = req.body;
    if (!phone) return res.status(400).json({ error: 'phone is required' });

    const { data: walkin } = await adminDb.from('walk_ins').select('*').eq('id', req.params.id).single();
    if (!walkin) return res.status(404).json({ error: 'Walk-in not found' });
    if (walkin.status === 'paid' || walkin.status === 'completed') {
      return res.status(400).json({ error: `Walk-in is already ${walkin.status}` });
    }

    const depositAmount = Number(amount) || Number(walkin.deposit_paid) || 0;
    if (depositAmount <= 0) return res.status(400).json({ error: 'No amount to collect' });

    const normalized = normalizePhone(phone);
    if (!/^2547\d{8}$|^2541\d{8}$/.test(normalized)) {
      return res.status(400).json({ error: 'Invalid phone number. Use a valid Kenyan M-Pesa number.' });
    }

    const { data: payment, error: payErr } = await adminDb.from('payments').insert({
      walk_in_id: walkin.id,
      amount:     depositAmount,
      phone:      normalized,
      status:     'pending',
    }).select().single();

    if (payErr || !payment) return res.status(500).json({ error: 'Failed to create payment record' });

    try {
      const ref = `WLK-${req.params.id.slice(0, 7)}`;
      const stkResult = await initiateSTKPush(normalized, depositAmount, ref);
      await adminDb.from('payments').update({ checkout_request_id: stkResult.CheckoutRequestID }).eq('id', payment.id);
      res.json({ success: true, checkout_request_id: stkResult.CheckoutRequestID });
    } catch (err) {
      const daraja = err.response?.data;
      await adminDb.from('payments').update({ status: 'failed' }).eq('id', payment.id);
      const message = daraja?.errorMessage || err.message || 'Failed to initiate M-Pesa payment.';
      res.status(502).json({ error: message });
    }
  });

  // Walk-ins — mark completed (client has been served)
  router.post('/admin/walkins/:id/complete', authenticate, requireEmployeePermission('complete_appointment'), async (req, res) => {
    const { error } = await adminDb.from('walk_ins').update({ status: 'completed' }).eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // Customers — returns all profiles with order counts and total spend
  router.get('/admin/customers', authenticate, requireEmployeePermission('view_orders'), async (req, res) => {
    const { data, error } = await adminDb
      .from('profiles')
      .select('id, full_name, email, phone, created_at, orders(id, total, created_at, status)')
      .order('created_at', { ascending: false });
    if (error) console.error('[Admin Customers] Query error:', error.message);
    res.json(data || []);
  });

  // Sales + Graphs
  router.get('/admin/sales', authenticate, requireEmployeePermission('view_sales'), async (req, res) => {
    const { data, error } = await adminDb.rpc('get_sales_summary');
    if (error) console.error('[Admin Sales] RPC error:', error.message);
    res.json(data || []);
  });

  // Recent activity feed (last 5 orders + last 5 appointments, merged) + counts for Overview cards
  router.get('/admin/recent-activity', authenticate, requireEmployeePermission('view_orders'), async (req, res) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [ordersResult, appointmentsResult, customersResult, totalOrdersResult, totalApptsResult] = await Promise.all([
      adminDb
        .from('orders')
        .select('id, total, created_at, profiles(full_name), order_items(products(name))')
        .order('created_at', { ascending: false })
        .limit(5),
      adminDb
        .from('appointments')
        .select('id, created_at, profiles(full_name), services(name)')
        .order('created_at', { ascending: false })
        .limit(5),
      adminDb
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString()),
      // Total order count — used by Overview cards for all roles
      adminDb
        .from('orders')
        .select('id', { count: 'exact', head: true }),
      // Total appointment count — used by Overview cards for all roles
      adminDb
        .from('appointments')
        .select('id', { count: 'exact', head: true }),
    ]);

    res.json({
      recentOrders:          ordersResult.data      || [],
      recentAppointments:    appointmentsResult.data || [],
      newCustomersCount:     customersResult.count   || 0,
      totalOrdersCount:      totalOrdersResult.count || 0,
      totalAppointmentsCount: totalApptsResult.count  || 0,
    });
  });

  // Clinic settings (single row, id = 1)
  router.get('/admin/settings', authenticate, requireEmployeePermission('manage_staff'), async (req, res) => {
    const { data } = await supabase
      .from('clinic_settings')
      .select('clinic_name, support_email, currency, timezone, default_deposit_percentage')
      .eq('id', 1)
      .single();

    // Return defaults if the row doesn't exist yet
    res.json(data || {
      clinic_name: 'Premier Beauty Clinic',
      support_email: 'support@premierbeauty.com',
      currency: 'KES',
      timezone: 'Africa/Nairobi',
      default_deposit_percentage: 20,
    });
  });

  // ── Product management ────────────────────────────────────────────────────

  // Categories list (for the Add/Edit product dropdowns)
  router.get('/admin/categories', authenticate, requireEmployeePermission('view_inventory'), async (req, res) => {
    const { data, error } = await adminDb.from('categories').select('id, name').order('name');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  });

  // Create new product
  router.post('/admin/products', authenticate, requireEmployeePermission('edit_stock'), async (req, res) => {
    const { name, description, price, stock, low_stock_threshold, category_id, is_active, brand } = req.body;
    if (!name?.trim())                                 return res.status(400).json({ error: 'Product name is required' });
    if (!price || isNaN(Number(price)) || Number(price) <= 0) return res.status(400).json({ error: 'Valid price is required' });

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const { data, error } = await adminDb.from('products').insert({
      name:                name.trim(),
      slug,
      description:         description?.trim() || null,
      price:               Number(price),
      stock:               Number(stock) || 0,
      low_stock_threshold: Number(low_stock_threshold) || 5,
      category_id:         category_id ? Number(category_id) : null,
      is_active:           is_active ?? true,
      brand:               brand?.trim() || null,
      images:              Array.isArray(req.body.images) ? req.body.images : [],
    }).select('*, categories(name)').single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  // Edit product (price, name, threshold, active, brand, category)
  router.patch('/admin/products/:id', authenticate, requireEmployeePermission('edit_stock'), async (req, res) => {
    const ALLOWED = ['name', 'price', 'low_stock_threshold', 'is_active', 'brand', 'description', 'category_id', 'images'];
    const updates = {};
    for (const key of ALLOWED) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (updates.name) {
      updates.slug = updates.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      updates.name = updates.name.trim();
    }

    const { data, error } = await adminDb
      .from('products')
      .update(updates)
      .eq('id', req.params.id)
      .select('*, categories(name)')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  // Bulk create products from spreadsheet upload
  router.post('/admin/products/bulk', authenticate, requireEmployeePermission('edit_stock'), async (req, res) => {
    const { products: rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0)
      return res.status(400).json({ error: 'No products provided' });

    // Build category name → id map (case-insensitive)
    const { data: cats } = await adminDb.from('categories').select('id, name');
    const catMap = {};
    (cats || []).forEach(c => { catMap[c.name.toLowerCase().trim()] = c.id; });

    const inserted = [];
    const errors   = [];

    for (let i = 0; i < rows.length; i++) {
      const row    = rows[i];
      const rowNum = i + 1;

      if (!row.name?.trim()) {
        errors.push({ row: rowNum, error: 'Name is required' });
        continue;
      }
      if (!row.price || isNaN(Number(row.price)) || Number(row.price) <= 0) {
        errors.push({ row: rowNum, name: row.name, error: 'Valid price is required' });
        continue;
      }

      const slug       = row.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const categoryId = row.category ? (catMap[row.category.toLowerCase().trim()] ?? null) : null;

      const { data, error } = await adminDb.from('products').insert({
        name:                row.name.trim(),
        slug,
        description:         row.description?.trim() || null,
        price:               Number(row.price),
        stock:               Number(row.stock)               || 0,
        low_stock_threshold: Number(row.low_stock_threshold) || 5,
        category_id:         categoryId,
        is_active:           false,   // hidden until images are added
        brand:               row.brand?.trim() || null,
        images:              [],
      }).select('id, name').single();

      if (error) {
        errors.push({ row: rowNum, name: row.name, error: error.message });
      } else {
        inserted.push(data);
      }
    }

    res.json({ created: inserted.length, errors, inserted });
  });

  router.patch('/admin/settings', authenticate, requireEmployeePermission('manage_staff'), async (req, res) => {
    const { clinic_name, support_email, currency, timezone, default_deposit_percentage } = req.body;
    const updates = { id: 1, updated_at: new Date().toISOString(), updated_by: req.user.id };

    if (clinic_name               !== undefined) updates.clinic_name               = clinic_name;
    if (support_email             !== undefined) updates.support_email             = support_email;
    if (currency                  !== undefined) updates.currency                  = currency;
    if (timezone                  !== undefined) updates.timezone                  = timezone;
    if (default_deposit_percentage !== undefined) updates.default_deposit_percentage = Number(default_deposit_percentage);

    const { error } = await supabase.from('clinic_settings').upsert(updates);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  return router;
};
