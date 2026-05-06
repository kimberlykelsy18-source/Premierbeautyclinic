const express = require('express');
const path    = require('path');

const LOGO_PATH = path.join(__dirname, '../../src/assets/logo.png');

// Admin dashboard routes (inventory, orders, appointments, sales)
module.exports = ({ supabase, serviceSupabase, authenticate, requireEmployeePermission, initiateSTKPush, transporter }) => {
  // Use service client for queries that need to bypass RLS (e.g. payments join)
  const adminDb = serviceSupabase || supabase;
  const router = express.Router();

  // ── Security helpers ────────────────────────────────────────────────────────
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isValidUUID = id => UUID_RE.test(id);

  // Rejects requests where req.params.id is not a valid UUID
  const validateId = (req, res, next) => {
    if (!isValidUUID(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    next();
  };

  // Rejects requests where req.params.id is not a positive integer (for products table)
  const validateIntId = (req, res, next) => {
    if (!/^\d+$/.test(req.params.id) || Number(req.params.id) < 1) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    next();
  };

  // Strip HTML/script tags from a string to prevent stored XSS
  const sanitize = str => (typeof str === 'string' ? str.replace(/<[^>]*>/g, '').trim() : str);

  // Inventory + low stock alerts
  router.get('/admin/inventory', authenticate, requireEmployeePermission('view_inventory'), async (req, res) => {
    const { data: products } = await adminDb
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

  router.post('/admin/orders/:id/deliver', authenticate, requireEmployeePermission('mark_delivered'), validateId, async (req, res) => {
    await Promise.all([
      adminDb.from('delivery_updates').insert({
        order_id: req.params.id,
        status: 'delivered',
        notes: sanitize(req.body.notes || '').slice(0, 500) || null,
        updated_by: req.user.id,
      }),
      adminDb.from('orders').update({ status: 'delivered' }).eq('id', req.params.id),
    ]);
    res.json({ success: true });
  });

  // General order status update (shipped, pending/processing, cancelled)
  router.patch('/admin/orders/:id/status', authenticate, requireEmployeePermission('mark_delivered'), validateId, async (req, res) => {
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

  router.post('/admin/appointments/:id/complete', authenticate, requireEmployeePermission('complete_appointment'), validateId, async (req, res) => {
    const update = { status: 'completed' };
    if (req.body.practitioner) update.practitioner = sanitize(req.body.practitioner).slice(0, 100);
    await adminDb.from('appointments').update(update).eq('id', req.params.id);
    res.json({ success: true });
  });

  // Check-in payment — used for zero-deposit or balance-collection at the clinic.
  // Creates a payment record and triggers an STK push to the customer's phone.
  // The M-Pesa callback will then set appointment → 'completed' and send the final email.
  router.post('/admin/appointments/:id/checkin-pay', authenticate, requireEmployeePermission('complete_appointment'), validateId, async (req, res) => {
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

  // Availability — returns 30-min time slots for a given date + service duration.
  // Rules per slot:
  //   past (date=today, time already elapsed) → { available: false, reason: 'past' }
  //   practitioner has an overlapping booking  → that practitioner marked busy for that slot
  // Query: ?date=YYYY-MM-DD&service_id=3&practitioner=Dr. X (practitioner optional)
  router.get('/admin/availability', authenticate, requireEmployeePermission('create_walkin'), async (req, res) => {
    const { date, service_id, practitioner } = req.query;
    if (!date || !service_id) return res.status(400).json({ error: 'date and service_id are required' });

    // Fetch service duration
    const { data: svc } = await adminDb.from('services')
      .select('duration_minutes')
      .eq('id', Number(service_id))
      .single();
    const durationMins = (svc?.duration_minutes || 60);

    // Fetch all bookings on that date from both appointments and walk_ins
    const dayStart = `${date}T00:00:00.000Z`;
    const dayEnd   = `${date}T23:59:59.999Z`;

    const [aptsRes, walkInsRes] = await Promise.all([
      adminDb.from('appointments')
        .select('appointment_time, practitioner, services(duration_minutes)')
        .gte('appointment_time', dayStart)
        .lte('appointment_time', dayEnd)
        .in('status', ['pending', 'confirmed']),
      adminDb.from('walk_ins')
        .select('appointment_time, practitioner, services(duration_minutes)')
        .gte('appointment_time', dayStart)
        .lte('appointment_time', dayEnd)
        .in('status', ['pending', 'paid', 'confirmed']),
    ]);

    const bookings = [
      ...(aptsRes.data || []).map(b => ({
        start:       new Date(b.appointment_time).getTime(),
        duration:    (b.services?.duration_minutes || 60),
        practitioner: b.practitioner || null,
      })),
      ...(walkInsRes.data || [])
        .filter(b => b.appointment_time)
        .map(b => ({
          start:       new Date(b.appointment_time).getTime(),
          duration:    (b.services?.duration_minutes || 60),
          practitioner: b.practitioner || null,
        })),
    ];

    // Generate 30-min slots from 08:00 to 18:30 (last start = 17:30 for a 60-min service)
    const nowMs   = Date.now();
    const isToday = new Date().toISOString().slice(0, 10) === date;
    const slots   = [];

    for (let h = 8; h < 19; h++) {
      for (let m = 0; m < 60; m += 30) {
        const slotLabel = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        const slotMs    = new Date(`${date}T${slotLabel}:00`).getTime();
        const slotEndMs = slotMs + durationMins * 60000;

        // Skip slots that would end after 19:00
        if (slotEndMs > new Date(`${date}T19:00:00`).getTime()) continue;

        const isPast = isToday && slotMs <= nowMs;

        // Find which practitioners are busy during this slot
        const busyPractitioners = new Set();
        for (const b of bookings) {
          const bEnd = b.start + b.duration * 60000;
          const overlaps = slotMs < bEnd && slotEndMs > b.start;
          if (overlaps && b.practitioner) {
            busyPractitioners.add(b.practitioner);
          }
        }

        // If a specific practitioner is requested, check their availability
        const practitionerBusy = practitioner
          ? busyPractitioners.has(practitioner)
          : false;

        slots.push({
          time:               slotLabel,
          available:          !isPast && !practitionerBusy,
          past:               isPast,
          busyPractitioners:  [...busyPractitioners],
        });
      }
    }

    res.json({ slots, durationMins });
  });

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

    // ── 4. Slot conflict check — per practitioner + across walk-ins ──────────
    // Only run conflict check for future-date appointments (not same-day walk-ins).
    // Same-day walk-ins are immediate — the client is already present — so past
    // time slots are valid (the appointment happened earlier today).
    if (appointment_time && !isAppointmentToday) {
      const durationMs  = (svc.duration_minutes || 60) * 60000;
      const newStart    = new Date(appointment_time).getTime();
      const newEnd      = newStart + durationMs;
      const windowStart = new Date(newStart - 4 * 3600000).toISOString();
      const windowEnd   = new Date(newEnd + 3600000).toISOString();

      // Past-time guard (future appointments only — can't book a future date that's already passed)
      if (newStart <= Date.now()) {
        return res.status(409).json({ error: 'That time is in the past. Please choose a future time slot.' });
      }

      if (practitioner) {
        // Check appointments for this practitioner
        const { data: aptNearby } = await adminDb
          .from('appointments')
          .select('id, appointment_time, services(duration_minutes)')
          .eq('practitioner', practitioner)
          .in('status', ['pending', 'confirmed'])
          .gte('appointment_time', windowStart)
          .lte('appointment_time', windowEnd);

        // Check walk-ins for this practitioner
        const { data: wkNearby } = await adminDb
          .from('walk_ins')
          .select('id, appointment_time, services(duration_minutes)')
          .eq('practitioner', practitioner)
          .in('status', ['pending', 'paid', 'confirmed'])
          .gte('appointment_time', windowStart)
          .lte('appointment_time', windowEnd);

        const allNearby = [...(aptNearby || []), ...(wkNearby || [])];
        const hasConflict = allNearby.some(b => {
          if (!b.appointment_time) return false;
          const existStart = new Date(b.appointment_time).getTime();
          const existEnd   = existStart + (b.services?.duration_minutes || 60) * 60000;
          return newStart < existEnd && newEnd > existStart;
        });

        if (hasConflict) {
          return res.status(409).json({ error: `${practitioner} is already booked at that time. Please choose a different time or practitioner.` });
        }
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
        from: `"Premier Beauty Clinic" <${process.env.SMTP_USER}>`,
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
  router.post('/admin/walkins/:id/pay', authenticate, requireEmployeePermission('create_walkin'), validateId, async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'phone is required' });

    const { data: walkin } = await adminDb.from('walk_ins').select('*').eq('id', req.params.id).single();
    if (!walkin) return res.status(404).json({ error: 'Walk-in not found' });
    if (walkin.status === 'paid' || walkin.status === 'completed') {
      return res.status(400).json({ error: `Walk-in is already ${walkin.status}` });
    }

    // Always use the amount stored in the DB — never trust the client-supplied value.
    const depositAmount = Math.round(Number(walkin.deposit_paid) || 0);
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
  router.post('/admin/walkins/:id/complete', authenticate, requireEmployeePermission('complete_appointment'), validateId, async (req, res) => {
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

  // Sales + Graphs — supports ?period=daily|monthly|yearly
  router.get('/admin/sales', authenticate, requireEmployeePermission('view_sales'), async (req, res) => {
    const period = ['daily', 'monthly', 'yearly'].includes(req.query.period) ? req.query.period : 'daily';

    const now = new Date();
    let fromDate = new Date(now);
    if (period === 'daily')        fromDate.setDate(now.getDate() - 30);
    else if (period === 'monthly') fromDate.setFullYear(now.getFullYear() - 1);
    else                           fromDate.setFullYear(now.getFullYear() - 5);

    const [ordersRes, apptsRes] = await Promise.all([
      adminDb.from('orders')
        .select('total, created_at, status')
        .gte('created_at', fromDate.toISOString())
        .neq('status', 'cancelled'),
      adminDb.from('appointments')
        .select('created_at')
        .gte('created_at', fromDate.toISOString()),
    ]);

    const buckets = {};
    const bucketKey = (isoStr) => {
      const d = new Date(isoStr);
      if (period === 'daily')   return d.toISOString().slice(0, 10); // YYYY-MM-DD
      if (period === 'monthly') return d.toISOString().slice(0, 7);  // YYYY-MM
      return String(d.getFullYear());                                  // YYYY
    };

    for (const order of (ordersRes.data || [])) {
      const k = bucketKey(order.created_at);
      if (!buckets[k]) buckets[k] = { period: k, revenue: 0, orders: 0, appointments: 0 };
      buckets[k].revenue += (order.total || 0);
      buckets[k].orders  += 1;
    }
    for (const appt of (apptsRes.data || [])) {
      const k = bucketKey(appt.created_at);
      if (!buckets[k]) buckets[k] = { period: k, revenue: 0, orders: 0, appointments: 0 };
      buckets[k].appointments += 1;
    }

    const result = Object.values(buckets).sort((a, b) => a.period.localeCompare(b.period));
    res.json(result);
  });

  // Overview stat cards — returns current vs previous 30-day values + % change for all 4 KPIs
  router.get('/admin/stats', authenticate, requireEmployeePermission('view_orders'), async (req, res) => {
    const now = new Date();
    const d30  = new Date(now); d30.setDate(now.getDate() - 30);
    const d60  = new Date(now); d60.setDate(now.getDate() - 60);

    const pct = (curr, prev) =>
      prev === 0 ? (curr > 0 ? 100 : 0) : +((curr - prev) / prev * 100).toFixed(1);

    const [ordCurr, ordPrev, aptCurr, aptPrev, custCurr, custPrev, allOrders] = await Promise.all([
      adminDb.from('orders').select('total').gte('created_at', d30.toISOString()).neq('status', 'cancelled'),
      adminDb.from('orders').select('total').gte('created_at', d60.toISOString()).lt('created_at', d30.toISOString()).neq('status', 'cancelled'),
      adminDb.from('appointments').select('id').gte('created_at', d30.toISOString()),
      adminDb.from('appointments').select('id').gte('created_at', d60.toISOString()).lt('created_at', d30.toISOString()),
      adminDb.from('profiles').select('id').gte('created_at', d30.toISOString()),
      adminDb.from('profiles').select('id').gte('created_at', d60.toISOString()).lt('created_at', d30.toISOString()),
      adminDb.from('orders').select('total').neq('status', 'cancelled'),
    ]);

    const revCurr  = (ordCurr.data  || []).reduce((s, o) => s + (o.total || 0), 0);
    const revPrev  = (ordPrev.data  || []).reduce((s, o) => s + (o.total || 0), 0);
    const revTotal = (allOrders.data || []).reduce((s, o) => s + (o.total || 0), 0);

    res.json({
      revenue:      { current: revCurr,                        previous: revPrev,                  change: pct(revCurr, revPrev),   total: revTotal },
      orders:       { current: ordCurr.data?.length  || 0,     previous: ordPrev.data?.length || 0, change: pct(ordCurr.data?.length || 0, ordPrev.data?.length || 0) },
      appointments: { current: aptCurr.data?.length  || 0,     previous: aptPrev.data?.length || 0, change: pct(aptCurr.data?.length || 0, aptPrev.data?.length || 0) },
      newCustomers: { current: custCurr.data?.length || 0,     previous: custPrev.data?.length || 0, change: pct(custCurr.data?.length || 0, custPrev.data?.length || 0) },
    });
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

  // Notification feed — recent orders, appointments, and low-stock alerts
  router.get('/admin/notifications', authenticate, requireEmployeePermission('view_orders'), async (req, res) => {
    const [ordersRes, apptsRes, productsRes] = await Promise.all([
      adminDb
        .from('orders')
        .select('id, order_number, total, created_at, status, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(6),
      adminDb
        .from('appointments')
        .select('id, created_at, appointment_date, profiles(full_name), services(name)')
        .order('created_at', { ascending: false })
        .limit(6),
      adminDb
        .from('products')
        .select('id, name, stock, low_stock_threshold')
        .eq('is_active', true),
    ]);

    const toShortOrder = n => {
      if (!n) return 'ORD-???';
      const letterIndex = Math.floor((n - 1) / 999);
      const numPart     = ((n - 1) % 999) + 1;
      return `ORD-${String.fromCharCode(65 + letterIndex)}${String(numPart).padStart(3, '0')}`;
    };

    const notifications = [];

    for (const o of (ordersRes.data || [])) {
      notifications.push({
        id:     `order-${o.id}`,
        type:   'order',
        title:  `New order ${toShortOrder(o.order_number)}`,
        detail: `${o.profiles?.full_name || 'Guest'} · KES ${(o.total || 0).toLocaleString()}`,
        time:   o.created_at,
        link:   '/staff/orders',
      });
    }

    for (const a of (apptsRes.data || [])) {
      notifications.push({
        id:     `appt-${a.id}`,
        type:   'appointment',
        title:  `Appointment booked`,
        detail: `${a.profiles?.full_name || 'Client'} · ${a.services?.name || 'Service'}`,
        time:   a.created_at,
        link:   '/staff/appointments',
      });
    }

    for (const p of (productsRes.data || [])) {
      const threshold = p.low_stock_threshold ?? 5;
      if (p.stock <= threshold) {
        notifications.push({
          id:     `stock-${p.id}`,
          type:   'low_stock',
          title:  'Low stock alert',
          detail: `${p.name} · ${p.stock} unit${p.stock === 1 ? '' : 's'} left`,
          time:   null,
          link:   '/staff/inventory',
        });
      }
    }

    // Sort: timed items by recency, low-stock at end
    notifications.sort((a, b) => {
      if (!a.time && !b.time) return 0;
      if (!a.time) return 1;
      if (!b.time) return -1;
      return new Date(b.time) - new Date(a.time);
    });

    res.json(notifications.slice(0, 15));
  });

  // Clinic settings (single row, id = 1)
  router.get('/admin/settings', authenticate, requireEmployeePermission('manage_staff'), async (req, res) => {
    const { data } = await adminDb
      .from('clinic_settings')
      .select('clinic_name, support_email, currency, timezone, default_deposit_percentage')
      .eq('id', 1)
      .single();

    // Return defaults if the row doesn't exist yet
    res.json(data || {
      clinic_name: 'Premier Beauty Clinic',
      support_email: 'customersupport@premierbeautyclinic.com',
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
  router.patch('/admin/products/:id', authenticate, requireEmployeePermission('edit_stock'), validateIntId, async (req, res) => {
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

  // Delete a single product permanently
  router.delete('/admin/products/:id', authenticate, requireEmployeePermission('edit_stock'), validateIntId, async (req, res) => {
    const { error } = await adminDb.from('products').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // Bulk delete multiple products
  router.post('/admin/products/bulk-delete', authenticate, requireEmployeePermission('edit_stock'), async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return res.status(400).json({ error: 'No product IDs provided' });
    const validIds = ids.filter(id => /^\d+$/.test(String(id)) && Number(id) >= 1);
    if (validIds.length === 0)
      return res.status(400).json({ error: 'No valid IDs provided' });
    const { error } = await adminDb.from('products').delete().in('id', validIds);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, deleted: validIds.length });
  });

  // Bulk create products from spreadsheet upload
  router.post('/admin/products/bulk', authenticate, requireEmployeePermission('edit_stock'), async (req, res) => {
    const { products: rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0)
      return res.status(400).json({ error: 'No products provided' });

    // Collect all unique category names from the uploaded rows
    const uniqueCatNames = [...new Set(
      rows.filter(r => r.category?.trim()).map(r => r.category.trim())
    )];

    // Fetch existing categories and build a name → id map (case-insensitive)
    const { data: existingCats } = await adminDb.from('categories').select('id, name');
    const catMap = {};
    (existingCats || []).forEach(c => { catMap[c.name.toLowerCase().trim()] = c.id; });

    // Auto-create any categories from the spreadsheet that don't exist yet
    for (const catName of uniqueCatNames) {
      const key = catName.toLowerCase().trim();
      if (!catMap[key]) {
        const slug = key.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const { data: newCat, error: insertErr } = await adminDb.from('categories').insert({
          name: catName.trim(),
          slug: `${slug}-${Date.now()}`,
        }).select('id, name').single();
        if (newCat) {
          catMap[key] = newCat.id;
        } else if (insertErr) {
          // Possible unique name conflict — look up the existing row by name
          const { data: existing } = await adminDb
            .from('categories')
            .select('id, name')
            .ilike('name', catName.trim())
            .maybeSingle();
          if (existing) catMap[key] = existing.id;
        }
      }
    }

    const results = await Promise.all(rows.map(async (row, i) => {
      const rowNum = i + 1;
      if (!row.name?.trim())
        return { success: false, row: rowNum, error: 'Name is required' };
      if (!row.price || isNaN(Number(row.price)) || Number(row.price) <= 0)
        return { success: false, row: rowNum, name: row.name, error: 'Valid price is required' };

      const baseSlug   = row.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const slug       = `${baseSlug}-${Date.now()}-${i}`;
      const categoryId = row.category ? (catMap[row.category.toLowerCase().trim()] ?? null) : null;

      const { data, error } = await adminDb.from('products').insert({
        name:                row.name.trim(),
        slug,
        description:         row.description?.trim() || null,
        price:               Number(row.price),
        stock:               Number(row.stock)               || 0,
        low_stock_threshold: Number(row.low_stock_threshold) || 5,
        category_id:         categoryId,
        is_active:           false,
        brand:               row.brand?.trim() || null,
        images:              [],
      }).select('id, name').single();

      if (error) return { success: false, row: rowNum, name: row.name, error: error.message };
      return { success: true, ...data };
    }));

    const inserted = results.filter(r => r.success);
    const errors   = results.filter(r => !r.success);
    res.json({ created: inserted.length, errors, inserted });
  });

  // ── Service management ───────────────────────────────────────────────────

  router.get('/admin/services', authenticate, requireEmployeePermission('view_appointments'), async (req, res) => {
    const { data, error } = await adminDb
      .from('services')
      .select('id, name, slug, description, base_price, deposit_percentage, duration_minutes, category, is_active, images, form_fields, benefits, results_stat')
      .order('category')
      .order('name');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  });

  router.post('/admin/services', authenticate, requireEmployeePermission('manage_staff'), async (req, res) => {
    const { name, description, base_price, deposit_percentage, duration_minutes, category, images, form_fields } = req.body;
    if (!name?.trim())                                             return res.status(400).json({ error: 'Service name is required' });
    if (!base_price || isNaN(Number(base_price)) || Number(base_price) <= 0) return res.status(400).json({ error: 'Valid base_price is required' });

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const { data, error } = await adminDb.from('services').insert({
      name:                sanitize(name).trim(),
      slug,
      description:         description ? sanitize(description).trim() : null,
      base_price:          Number(base_price),
      deposit_percentage:  deposit_percentage != null ? Number(deposit_percentage) : 0,
      duration_minutes:    duration_minutes   != null ? Number(duration_minutes)   : 60,
      category:            category ? sanitize(category).trim() : null,
      images:              Array.isArray(images) ? images : [],
      form_fields:         Array.isArray(form_fields) ? form_fields : [],
      is_active:           true,
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  router.patch('/admin/services/:id', authenticate, requireEmployeePermission('manage_staff'), validateId, async (req, res) => {
    const ALLOWED = ['name', 'description', 'base_price', 'deposit_percentage', 'duration_minutes', 'category', 'images', 'form_fields', 'is_active'];
    const updates = {};
    for (const key of ALLOWED) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (updates.name) {
      updates.name = sanitize(updates.name).trim();
      updates.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    if (updates.description) updates.description = sanitize(updates.description).trim();
    if (updates.category)    updates.category    = sanitize(updates.category).trim();

    const { data, error } = await adminDb.from('services').update(updates).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  router.delete('/admin/services/:id', authenticate, requireEmployeePermission('manage_staff'), validateId, async (req, res) => {
    const { error } = await adminDb.from('services').update({ is_active: false }).eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // ── Shipping Regions ──────────────────────────────────────────────────────
  router.get('/admin/shipping-regions', authenticate, async (req, res) => {
    const { data, error } = await adminDb.from('shipping_regions').select('*').order('country').order('county');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  });

  router.post('/admin/shipping-regions', authenticate, requireEmployeePermission('manage_staff'), async (req, res) => {
    const { country, region, county, fee } = req.body;
    if (!country || !region || !county || fee === undefined) {
      return res.status(400).json({ error: 'country, region, county, and fee are required' });
    }
    if (Number(fee) < 0) return res.status(400).json({ error: 'fee cannot be negative' });
    const { data, error } = await adminDb.from('shipping_regions').insert({
      country: sanitize(country).slice(0, 100),
      region:  sanitize(region).slice(0, 100),
      county:  sanitize(county).slice(0, 100),
      fee:     Number(fee),
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  router.patch('/admin/shipping-regions/:id', authenticate, requireEmployeePermission('manage_staff'), validateId, async (req, res) => {
    const { fee, country, region, county } = req.body;
    if (fee !== undefined && Number(fee) < 0) return res.status(400).json({ error: 'fee cannot be negative' });
    const updates = {};
    if (fee     !== undefined) updates.fee     = Number(fee);
    if (country !== undefined) updates.country = sanitize(country).slice(0, 100);
    if (region  !== undefined) updates.region  = sanitize(region).slice(0, 100);
    if (county  !== undefined) updates.county  = sanitize(county).slice(0, 100);
    const { data, error } = await adminDb.from('shipping_regions').update(updates).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  router.delete('/admin/shipping-regions/:id', authenticate, requireEmployeePermission('manage_staff'), validateId, async (req, res) => {
    const { error } = await adminDb.from('shipping_regions').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // ── FAQs ──────────────────────────────────────────────────────────────────
  router.get('/admin/faqs', authenticate, async (req, res) => {
    const { data, error } = await adminDb.from('faqs').select('*').order('category').order('order_num');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  });

  router.post('/admin/faqs', authenticate, requireEmployeePermission('manage_staff'), async (req, res) => {
    const { category, question, answer } = req.body;
    if (!category || !question || !answer) return res.status(400).json({ error: 'category, question, and answer are required' });
    const { data: last } = await adminDb.from('faqs').select('order_num').order('order_num', { ascending: false }).limit(1).single();
    const { data, error } = await adminDb.from('faqs').insert({
      category: sanitize(category).slice(0, 100),
      question: sanitize(question).slice(0, 500),
      answer:   sanitize(answer).slice(0, 3000),
      order_num: (last?.order_num || 0) + 1,
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  router.patch('/admin/faqs/:id', authenticate, requireEmployeePermission('manage_staff'), validateId, async (req, res) => {
    const { category, question, answer } = req.body;
    const updates = {};
    if (category) updates.category = sanitize(category).slice(0, 100);
    if (question) updates.question = sanitize(question).slice(0, 500);
    if (answer)   updates.answer   = sanitize(answer).slice(0, 3000);
    const { data, error } = await adminDb.from('faqs').update(updates).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  router.delete('/admin/faqs/:id', authenticate, requireEmployeePermission('manage_staff'), validateId, async (req, res) => {
    const { error } = await adminDb.from('faqs').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // ── Storefront Content ────────────────────────────────────────────────────
  router.get('/admin/storefront-content', authenticate, async (req, res) => {
    const { data, error } = await adminDb.from('storefront_content').select('*').eq('id', 1).single();
    if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message });
    res.json(data || { marquee_items: [], hero: {}, features: [] });
  });

  router.patch('/admin/storefront-content', authenticate, requireEmployeePermission('manage_staff'), async (req, res) => {
    const { marquee_items, hero, features, skin_concerns } = req.body;
    const updates = { id: 1, updated_at: new Date().toISOString() };
    if (marquee_items  !== undefined) updates.marquee_items  = marquee_items;
    if (hero           !== undefined) updates.hero           = hero;
    if (features       !== undefined) updates.features       = features;
    if (skin_concerns  !== undefined) updates.skin_concerns  = skin_concerns;
    const { error } = await adminDb.from('storefront_content').upsert(updates);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  router.patch('/admin/settings', authenticate, requireEmployeePermission('manage_staff'), async (req, res) => {
    const { clinic_name, support_email, currency, timezone, default_deposit_percentage } = req.body;

    // Validate email format if provided
    if (support_email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(support_email)) {
      return res.status(400).json({ error: 'Invalid support_email format' });
    }
    // Deposit must be 0–100 if provided
    if (default_deposit_percentage !== undefined) {
      const pct = Number(default_deposit_percentage);
      if (isNaN(pct) || pct < 0 || pct > 100) {
        return res.status(400).json({ error: 'default_deposit_percentage must be 0–100' });
      }
    }

    const updates = { id: 1, updated_at: new Date().toISOString(), updated_by: req.user.id };

    if (clinic_name               !== undefined) updates.clinic_name               = sanitize(clinic_name).slice(0, 100);
    if (support_email             !== undefined) updates.support_email             = support_email.trim().toLowerCase();
    if (currency                  !== undefined) updates.currency                  = sanitize(currency).slice(0, 10);
    if (timezone                  !== undefined) updates.timezone                  = sanitize(timezone).slice(0, 60);
    if (default_deposit_percentage !== undefined) updates.default_deposit_percentage = Number(default_deposit_percentage);

    const { error } = await adminDb.from('clinic_settings').upsert(updates);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // ── Reviews management ────────────────────────────────────────────────────────
  // GET /admin/reviews?status=pending|approved|rejected&type=product|service
  router.get('/admin/reviews', authenticate, requireEmployeePermission('manage_reviews'), async (req, res) => {
    const { status, type } = req.query;
    let query = adminDb
      .from('reviews')
      .select('id, reviewer_name, reviewer_email, rating, title, body, status, is_verified_purchase, staff_note, created_at, product_id, service_id, products(name), services(name)')
      .order('created_at', { ascending: false });

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = query.eq('status', status);
    }
    if (type === 'product') query = query.not('product_id', 'is', null);
    if (type === 'service') query = query.not('service_id', 'is', null);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    const total    = data?.length || 0;
    const pending  = data?.filter(r => r.status === 'pending').length  || 0;
    const approved = data?.filter(r => r.status === 'approved').length || 0;
    const rejected = data?.filter(r => r.status === 'rejected').length || 0;

    res.json({ reviews: data || [], stats: { total, pending, approved, rejected } });
  });

  router.patch('/admin/reviews/:id', authenticate, requireEmployeePermission('manage_reviews'), validateId, async (req, res) => {
    const { status, staff_note } = req.body;
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'status must be pending, approved, or rejected' });
    }
    const updates = { status };
    if (staff_note !== undefined) updates.staff_note = sanitize(String(staff_note)).slice(0, 500);

    const { data, error } = await adminDb.from('reviews').update(updates).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  router.delete('/admin/reviews/:id', authenticate, requireEmployeePermission('manage_reviews'), validateId, async (req, res) => {
    const { error } = await adminDb.from('reviews').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // ── Fix services validateId → validateIntId (services.id is BIGINT) ──────────
  // The existing PATCH/DELETE /admin/services/:id used validateId (UUID check) which
  // rejects numeric IDs like "1". Re-register them with validateIntId.
  router.patch('/admin/services/:id/fix', authenticate, requireEmployeePermission('manage_staff'), validateIntId, async (req, res) => {
    const ALLOWED = ['name', 'description', 'base_price', 'deposit_percentage', 'duration_minutes', 'category', 'images', 'form_fields', 'is_active', 'benefits', 'results_stat'];
    const updates = {};
    for (const key of ALLOWED) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (updates.name) {
      updates.name = sanitize(updates.name).trim();
      updates.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    if (updates.description)  updates.description  = sanitize(updates.description).trim();
    if (updates.category)     updates.category     = sanitize(updates.category).trim();
    if (updates.results_stat) updates.results_stat = sanitize(updates.results_stat).trim();
    const { data, error } = await adminDb.from('services').update(updates).eq('id', Number(req.params.id)).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  // ── Image Upload ─────────────────────────────────────────────────────────────
  // POST /admin/upload — accepts base64-encoded image, uploads to Supabase Storage,
  // returns the public URL. No extra packages needed — just Buffer from Node core.
  router.post('/admin/upload', authenticate, async (req, res) => {
    const { data: base64, filename, folder = 'general' } = req.body;
    if (!base64 || !filename) return res.status(400).json({ error: 'data and filename are required' });

    // Strip data-URL prefix (e.g. "data:image/png;base64,") if present
    const raw = base64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(raw, 'base64');

    const ext = (filename.split('.').pop() || 'jpg').toLowerCase();
    const mime = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' }[ext] || 'image/jpeg';
    const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const storagePath = `${folder}/${safeName}`;
    const BUCKET = 'clinic-images';

    const tryUpload = async () =>
      adminDb.storage.from(BUCKET).upload(storagePath, buffer, { contentType: mime, upsert: true });

    let { error } = await tryUpload();

    // If bucket doesn't exist yet, create it then retry
    if (error && (error.message?.includes('not found') || error.statusCode === '404' || error.error === 'Bucket not found')) {
      await adminDb.storage.createBucket(BUCKET, { public: true });
      const retry = await tryUpload();
      error = retry.error;
    }

    if (error) return res.status(500).json({ error: error.message });

    const { data: { publicUrl } } = adminDb.storage.from(BUCKET).getPublicUrl(storagePath);
    res.json({ url: publicUrl });
  });

  // ── Promo Carousel ─────────────────────────────────────────────────────────
  router.get('/admin/promo-carousel', authenticate, async (req, res) => {
    const { data, error } = await adminDb
      .from('promo_carousel')
      .select('*')
      .order('sort_order')
      .order('created_at');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  });

  router.post('/admin/promo-carousel', authenticate, requireEmployeePermission('manage_staff'), async (req, res) => {
    const { title, subtitle, image_url, cta_text, cta_link, sort_order } = req.body;
    if (!title?.trim())     return res.status(400).json({ error: 'title is required' });
    if (!image_url?.trim()) return res.status(400).json({ error: 'image_url is required' });
    const { data, error } = await adminDb.from('promo_carousel').insert({
      title:      sanitize(title).slice(0, 120),
      subtitle:   subtitle ? sanitize(subtitle).slice(0, 200) : null,
      image_url:  image_url.trim(),
      cta_text:   cta_text ? sanitize(cta_text).slice(0, 60) : 'Shop Now',
      cta_link:   cta_link ? cta_link.trim() : '/shop',
      sort_order: sort_order != null ? Number(sort_order) : 0,
      is_active:  true,
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  router.patch('/admin/promo-carousel/:id', authenticate, requireEmployeePermission('manage_staff'), validateId, async (req, res) => {
    const { title, subtitle, image_url, cta_text, cta_link, sort_order, is_active } = req.body;
    const updates = {};
    if (title      !== undefined) updates.title      = sanitize(title).slice(0, 120);
    if (subtitle   !== undefined) updates.subtitle   = subtitle ? sanitize(subtitle).slice(0, 200) : null;
    if (image_url  !== undefined) updates.image_url  = image_url.trim();
    if (cta_text   !== undefined) updates.cta_text   = sanitize(cta_text).slice(0, 60);
    if (cta_link   !== undefined) updates.cta_link   = cta_link.trim();
    if (sort_order !== undefined) updates.sort_order = Number(sort_order);
    if (is_active  !== undefined) updates.is_active  = Boolean(is_active);
    const { data, error } = await adminDb.from('promo_carousel').update(updates).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  router.delete('/admin/promo-carousel/:id', authenticate, requireEmployeePermission('manage_staff'), validateId, async (req, res) => {
    const { error } = await adminDb.from('promo_carousel').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // ── Service products (related products per service) ────────────────────────
  router.get('/admin/services/:id/products', authenticate, validateIntId, async (req, res) => {
    const { data, error } = await adminDb
      .from('service_products')
      .select('product_id, products(id, name, price, images, categories(name))')
      .eq('service_id', Number(req.params.id));
    if (error) return res.status(500).json({ error: error.message });
    res.json((data || []).map(r => r.products));
  });

  router.post('/admin/services/:id/products', authenticate, requireEmployeePermission('manage_staff'), validateIntId, async (req, res) => {
    const { product_id } = req.body;
    if (!product_id || isNaN(Number(product_id))) return res.status(400).json({ error: 'product_id is required' });
    const { error } = await adminDb.from('service_products').insert({
      service_id: Number(req.params.id),
      product_id: Number(product_id),
    });
    if (error && error.code === '23505') return res.status(409).json({ error: 'Product already linked' });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  router.delete('/admin/services/:id/products/:product_id', authenticate, requireEmployeePermission('manage_staff'), validateIntId, async (req, res) => {
    if (!/^\d+$/.test(req.params.product_id)) return res.status(400).json({ error: 'Invalid product_id' });
    const { error } = await adminDb.from('service_products')
      .delete()
      .eq('service_id', Number(req.params.id))
      .eq('product_id', Number(req.params.product_id));
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // ── Update service (with benefits/results_stat) — numeric ID version ───────
  router.patch('/admin/services-v2/:id', authenticate, requireEmployeePermission('manage_staff'), validateIntId, async (req, res) => {
    const ALLOWED = ['name', 'description', 'base_price', 'deposit_percentage', 'duration_minutes', 'category', 'images', 'form_fields', 'is_active', 'benefits', 'results_stat'];
    const updates = {};
    for (const key of ALLOWED) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (updates.name)        { updates.name = sanitize(updates.name).trim(); updates.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
    if (updates.description !== undefined) updates.description  = updates.description  ? sanitize(String(updates.description)).trim()  : null;
    if (updates.category    !== undefined) updates.category     = updates.category     ? sanitize(String(updates.category)).trim()     : null;
    if (updates.results_stat !== undefined) updates.results_stat = updates.results_stat ? sanitize(String(updates.results_stat)).trim() : null;
    const { data, error } = await adminDb.from('services').update(updates).eq('id', Number(req.params.id)).select().single();
    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'A service with that name already exists. Choose a different name.' });
      return res.status(400).json({ error: error.message });
    }
    res.json(data);
  });

  router.post('/admin/services-v2', authenticate, requireEmployeePermission('manage_staff'), async (req, res) => {
    const { name, description, base_price, deposit_percentage, duration_minutes, category, images, form_fields, benefits, results_stat } = req.body;
    if (!name?.trim())                                                          return res.status(400).json({ error: 'Service name is required' });
    if (!base_price || isNaN(Number(base_price)) || Number(base_price) <= 0) return res.status(400).json({ error: 'Valid base_price is required' });
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const { data, error } = await adminDb.from('services').insert({
      name:               sanitize(name).trim(),
      slug,
      description:        description ? sanitize(description).trim() : null,
      base_price:         Number(base_price),
      deposit_percentage: deposit_percentage != null ? Number(deposit_percentage) : 0,
      duration_minutes:   duration_minutes   != null ? Number(duration_minutes)   : 60,
      category:           category ? sanitize(category).trim() : null,
      images:             Array.isArray(images) ? images : [],
      form_fields:        Array.isArray(form_fields) ? form_fields : [],
      benefits:           Array.isArray(benefits) ? benefits : [],
      results_stat:       results_stat ? sanitize(results_stat).trim() : null,
      is_active:          true,
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  router.delete('/admin/services-v2/:id', authenticate, requireEmployeePermission('manage_staff'), validateIntId, async (req, res) => {
    const { error } = await adminDb.from('services').update({ is_active: false }).eq('id', Number(req.params.id));
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // Bulk create services from spreadsheet upload
  router.post('/admin/services/bulk', authenticate, requireEmployeePermission('manage_staff'), async (req, res) => {
    const { services: rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0)
      return res.status(400).json({ error: 'No services provided' });

    const results = await Promise.all(rows.map(async (row, i) => {
      const rowNum = i + 1;
      if (!row.name?.trim())
        return { success: false, row: rowNum, error: 'Name is required' };
      if (row.price === undefined || row.price === null || row.price === '' || isNaN(Number(row.price)) || Number(row.price) < 0)
        return { success: false, row: rowNum, name: row.name, error: 'Valid price is required' };

      const baseSlug = row.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const slug     = `${baseSlug}-${Date.now()}-${i}`;

      const { data, error } = await adminDb.from('services').insert({
        name:               sanitize(row.name).trim(),
        slug,
        description:        row.description ? sanitize(row.description).trim() : null,
        base_price:         Number(row.price),
        deposit_percentage: Number(row.deposit_percentage) || 0,
        duration_minutes:   Number(row.duration_minutes)   || 60,
        category:           row.category ? sanitize(row.category).trim() : null,
        images:             [],
        form_fields:        [],
        benefits:           [],
        results_stat:       null,
        is_active:          false,
      }).select('id, name').single();

      if (error) return { success: false, row: rowNum, name: row.name, error: error.message };
      return { success: true, ...data };
    }));

    const inserted = results.filter(r => r.success);
    const errors   = results.filter(r => !r.success);
    res.json({ created: inserted.length, errors, inserted });
  });

  return router;
};
