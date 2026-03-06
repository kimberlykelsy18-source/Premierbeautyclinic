const express = require('express');
const path    = require('path');

// Converts a sequential number → short human-readable ID (A001…A999→B001…)
function toShortId(prefix, n) {
  if (!n) return `${prefix}-???`;
  const letterIndex = Math.floor((n - 1) / 999);
  const numPart     = ((n - 1) % 999) + 1;
  const letter      = String.fromCharCode(65 + letterIndex);
  return `${prefix}-${letter}${String(numPart).padStart(3, '0')}`;
}
const toShortOrderId = n => toShortId('ORD', n);
const toShortAptId   = n => toShortId('APT', n);

const LOGO_PATH = path.join(__dirname, '../../src/assets/logo.png');
const { createServiceClient } = require('../config/supabase');

// M-Pesa initiate + callback
module.exports = ({ supabase, initiateSTKPush, transporter }) => {
  const router = express.Router();
  // Service-role client — bypasses RLS for inventory updates triggered by webhook
  const adminDb = createServiceClient();

  const ensureMpesaInitiateAllowed = (req, res, next) => {
    const token = process.env.MPESA_INITIATE_TOKEN;
    const isProd = process.env.NODE_ENV === 'production';

    if (token) {
      if (req.headers['x-mpesa-token'] !== token) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      return next();
    }

    if (isProd) return res.status(403).json({ error: 'M-Pesa initiate disabled in production' });
    next();
  };

  const formatShippingAddress = address => {
    if (!address) return 'Address not provided';
    if (typeof address === 'string') return address;
    if (address.raw) return address.raw;

    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.line1) parts.push(address.line1);
    if (address.line2) parts.push(address.line2);
    if (address.city) parts.push(address.city);
    if (address.area) parts.push(address.area);

    if (parts.length) return parts.join(', ');
    return 'Address provided';
  };

  // Called from frontend checkout when user chooses M-Pesa
  router.post('/api/mpesa/initiate', ensureMpesaInitiateAllowed, async (req, res) => {
    const { phone, amount, orderId } = req.body;

    if (!phone || !amount) return res.status(400).json({ error: 'phone and amount required' });

    try {
      const result = await initiateSTKPush(phone, amount, orderId);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error(error.response?.data || error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Safaricom STK callback handler
  router.post('/mpesa/callback', async (req, res) => {
    console.log('M-Pesa Callback received');

    const callbackData = req.body?.Body?.stkCallback;
    if (!callbackData) {
      console.log('Invalid callback payload');
      return res.json({ success: true });
    }

    const resultCode = callbackData.ResultCode;
    const checkoutRequestId = callbackData.CheckoutRequestID;
    const items = callbackData.CallbackMetadata?.Item || [];
    const receipt = items.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
    const amount = items.find(i => i.Name === 'Amount')?.Value;

    if (resultCode !== 0) {
      // Payment failed — store status + reason from M-Pesa
      const failureReason = callbackData.ResultDesc || 'Payment declined by M-Pesa';
      console.log('Payment failed:', failureReason);
      if (checkoutRequestId) {
        await adminDb
          .from('payments')
          .update({ status: 'failed', failure_reason: failureReason })
          .eq('checkout_request_id', checkoutRequestId);

        // Update the linked order or appointment to reflect the failure
        const { data: failedPayment } = await adminDb
          .from('payments')
          .select('order_id, appointment_id, walk_in_id')
          .eq('checkout_request_id', checkoutRequestId)
          .single();
        if (failedPayment?.order_id) {
          await adminDb
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', failedPayment.order_id);
          console.log('Order cancelled due to failed payment:', failedPayment.order_id);
        }
        if (failedPayment?.appointment_id) {
          // Only mark the appointment 'failed' if it was awaiting an initial deposit (status='pending').
          // If it was already 'confirmed' (check-in / balance payment), leave it as 'confirmed'
          // so the receptionist can retry collecting payment without the booking being locked.
          const { data: apt } = await adminDb
            .from('appointments')
            .select('status')
            .eq('id', failedPayment.appointment_id)
            .single();
          if (apt?.status === 'pending') {
            await adminDb
              .from('appointments')
              .update({ status: 'failed' })
              .eq('id', failedPayment.appointment_id);
            console.log('Appointment marked failed (deposit declined):', failedPayment.appointment_id);
          } else {
            console.log('Check-in payment failed for appointment:', failedPayment.appointment_id, '— left as', apt?.status, 'for retry');
          }
        }
      }
      return res.json({ success: true });
    }

    // Payment succeeded — store receipt number and mark paid
    if (checkoutRequestId) {
      await adminDb
        .from('payments')
        .update({ status: 'paid', mpesa_receipt: receipt || null })
        .eq('checkout_request_id', checkoutRequestId);
    }

    const { data: payment } = await adminDb
      .from('payments')
      .select('order_id, appointment_id, walk_in_id')
      .eq('checkout_request_id', checkoutRequestId)
      .single();

    if (payment?.order_id) {
      const { data: order } = await adminDb
        .from('orders')
        .select('*, customer_email, order_number')
        .eq('id', payment.order_id)
        .single();

      await adminDb.from('orders').update({ status: 'paid' }).eq('id', payment.order_id);

      // Reduce inventory for each item — only runs on confirmed payment
      const { data: orderItems } = await adminDb
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', payment.order_id);

      if (orderItems && orderItems.length > 0) {
        const shortOrderId = toShortOrderId(order?.order_number);
        await Promise.all(orderItems.map(async (item) => {
          // Fetch current stock then decrement (service client bypasses RLS)
          const { data: prod } = await adminDb
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single();

          if (prod !== null) {
            await adminDb
              .from('products')
              .update({ stock: Math.max(0, (prod.stock || 0) - item.quantity) })
              .eq('id', item.product_id);
          }

          // Log it in inventory_logs (staff_id null = automated sale deduction)
          await adminDb.from('inventory_logs').insert({
            product_id: item.product_id,
            staff_id: null,
            quantity_change: -item.quantity,
            reason: `Sale — Order ${shortOrderId}`,
          });
        }));
        console.log(`Inventory reduced for order ${shortOrderId} (${orderItems.length} line items)`);
      }

      if (order?.customer_email) {
        const shortId = toShortOrderId(order.order_number);
        await transporter.sendMail({
          from: `"Premier Beauty Clinic" <${process.env.GMAIL_EMAIL}>`,
          to: order.customer_email,
          subject: `Order Confirmed — ${shortId} · Premier Beauty Clinic`,
          attachments: [{
            filename: 'logo.png',
            path: LOGO_PATH,
            cid: 'premier_logo',
          }],
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee">
              <!-- Header -->
              <div style="background:#1A1A1A;padding:28px 32px;text-align:center">
                <img src="cid:premier_logo" alt="Premier Beauty Clinic" style="height:48px;object-fit:contain" />
              </div>

              <!-- Hero -->
              <div style="background:#6D4C91;padding:24px 32px;text-align:center">
                <p style="color:rgba(255,255,255,0.7);font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px">Order Confirmed</p>
                <h2 style="color:#fff;margin:0;font-size:22px">${shortId}</h2>
              </div>

              <!-- Body -->
              <div style="padding:36px 32px">
                <p style="color:#555;margin:0 0 24px;font-size:15px">
                  Thank you for your purchase! Your order has been received and payment confirmed via M-Pesa.
                </p>

                <table style="background:#FDFBF7;border-radius:10px;padding:20px;width:100%;border-collapse:collapse">
                  <tr>
                    <td style="padding:8px 12px;color:#888;font-size:13px;width:140px">Order ID</td>
                    <td style="padding:8px 12px;font-weight:bold;font-size:14px;color:#6D4C91">${shortId}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 12px;color:#888;font-size:13px">M-Pesa Receipt</td>
                    <td style="padding:8px 12px;font-weight:bold;font-size:14px">${receipt}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 12px;color:#888;font-size:13px">Amount Paid</td>
                    <td style="padding:8px 12px;font-weight:bold;font-size:14px">KES ${amount?.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 12px;color:#888;font-size:13px">Ship To</td>
                    <td style="padding:8px 12px;font-size:14px">${formatShippingAddress(order.shipping_address)}</td>
                  </tr>
                </table>

                <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:4px;margin:24px 0 0;font-size:13px;color:#166534">
                  <strong>What's next?</strong> Your order will be packed and dispatched within 1–2 business days. You'll receive a shipping update by email.
                </div>
              </div>

              <!-- Footer -->
              <div style="background:#FDFBF7;padding:20px 32px;text-align:center;border-top:1px solid #eee">
                <p style="color:#aaa;font-size:12px;margin:0">© ${new Date().getFullYear()} Premier Beauty Clinic · Nairobi, Kenya</p>
                <p style="color:#aaa;font-size:12px;margin:6px 0 0">Questions? Email us at ${process.env.SUPPORT_EMAIL || 'support@premierbeauty.com'}</p>
              </div>
            </div>
          `,
        });
        console.log(`Order confirmation email sent to ${order.customer_email}`);
      }
    }

    if (payment?.appointment_id) {
      const { data: appointment } = await adminDb
        .from('appointments')
        .select('*, appointment_number, services(name), profiles(email)')
        .eq('id', payment.appointment_id)
        .single();

      // Status transition rules:
      // pending    → confirmed : initial deposit/full payment paid online
      // confirmed  → confirmed : balance or clinic payment collected — stays confirmed until
      //                          receptionist manually clicks "Check In" to mark completed
      // isBalancePayment: appointment was already 'confirmed' when this payment arrived
      // → it's a balance / clinic payment. Initial deposit payments come in while status='pending'.
      const isBalancePayment = appointment?.status === 'confirmed';

      const newAptStatus = appointment?.status === 'pending' ? 'confirmed' : appointment?.status;
      await adminDb.from('appointments').update({ status: newAptStatus }).eq('id', payment.appointment_id);
      console.log(`Appointment ${payment.appointment_id} → ${newAptStatus} (balance: ${isBalancePayment})`);

      const profileEmail = appointment?.profiles?.email;
      if (profileEmail) {
        const shortAptId = toShortAptId(appointment.appointment_number);
        const aptDate = new Date(appointment.appointment_time).toLocaleDateString('en-KE', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        });
        const aptTime = new Date(appointment.appointment_time).toLocaleTimeString('en-KE', {
          hour: '2-digit', minute: '2-digit',
        });

        if (isBalancePayment) {
          // ── Fully Paid email (balance collected at clinic) ──
          await transporter.sendMail({
            from: `"Premier Beauty Clinic" <${process.env.GMAIL_EMAIL}>`,
            to: profileEmail,
            subject: `Payment Complete — ${appointment.services?.name} · Premier Beauty Clinic`,
            attachments: [{ filename: 'logo.png', path: LOGO_PATH, cid: 'premier_logo' }],
            html: `
              <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee">
                <div style="background:#1A1A1A;padding:28px 32px;text-align:center">
                  <img src="cid:premier_logo" alt="Premier Beauty Clinic" style="height:48px;object-fit:contain" />
                </div>
                <div style="background:#22c55e;padding:24px 32px;text-align:center">
                  <p style="color:rgba(255,255,255,0.85);font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px">Fully Paid</p>
                  <h2 style="color:#fff;margin:0;font-size:22px">${appointment.services?.name || 'Your Service'}</h2>
                </div>
                <div style="padding:36px 32px">
                  <p style="color:#555;margin:0 0 24px;font-size:15px">
                    Thank you! Your service has been completed and full payment received.
                  </p>
                  <table style="background:#FDFBF7;border-radius:10px;padding:20px;width:100%;border-collapse:collapse">
                    <tr><td style="padding:8px 12px;color:#888;font-size:13px;width:140px">Booking Ref</td><td style="padding:8px 12px;font-weight:bold;font-size:14px;color:#6D4C91">${shortAptId}</td></tr>
                    <tr><td style="padding:8px 12px;color:#888;font-size:13px">Service</td><td style="padding:8px 12px;font-weight:bold;font-size:14px">${appointment.services?.name || '—'}</td></tr>
                    <tr><td style="padding:8px 12px;color:#888;font-size:13px">Date</td><td style="padding:8px 12px;font-size:14px">${aptDate}</td></tr>
                    <tr><td style="padding:8px 12px;color:#888;font-size:13px">Time</td><td style="padding:8px 12px;font-size:14px">${aptTime}</td></tr>
                    <tr><td style="padding:8px 12px;color:#888;font-size:13px">Amount Paid</td><td style="padding:8px 12px;font-weight:bold;font-size:14px;color:#22c55e">KES ${Number(amount).toLocaleString()}</td></tr>
                    <tr><td style="padding:8px 12px;color:#888;font-size:13px">M-Pesa Receipt</td><td style="padding:8px 12px;font-size:14px">${receipt}</td></tr>
                    <tr><td style="padding:8px 12px;color:#888;font-size:13px">Balance Due</td><td style="padding:8px 12px;font-weight:bold;font-size:14px;color:#22c55e">KES 0 — Fully Settled</td></tr>
                  </table>
                </div>
                <div style="background:#FDFBF7;padding:20px 32px;text-align:center;border-top:1px solid #eee">
                  <p style="color:#aaa;font-size:12px;margin:0">© ${new Date().getFullYear()} Premier Beauty Clinic · Nairobi, Kenya</p>
                  <p style="color:#aaa;font-size:12px;margin:6px 0 0">Thank you for choosing us! See you next time.</p>
                </div>
              </div>
            `,
          });
          console.log('Balance payment email sent to', profileEmail);
        } else {
          // ── Deposit / initial booking confirmation email ──
          const remaining = (appointment.total_amount || 0) - (amount || 0);
          await transporter.sendMail({
            from: `"Premier Beauty Clinic" <${process.env.GMAIL_EMAIL}>`,
            to: profileEmail,
            subject: `Appointment Confirmed — ${appointment.services?.name} · Premier Beauty Clinic`,
            attachments: [{ filename: 'logo.png', path: LOGO_PATH, cid: 'premier_logo' }],
            html: `
              <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee">
                <div style="background:#1A1A1A;padding:28px 32px;text-align:center">
                  <img src="cid:premier_logo" alt="Premier Beauty Clinic" style="height:48px;object-fit:contain" />
                </div>
                <div style="background:#6D4C91;padding:24px 32px;text-align:center">
                  <p style="color:rgba(255,255,255,0.7);font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px">Appointment Confirmed</p>
                  <h2 style="color:#fff;margin:0;font-size:22px">${appointment.services?.name || 'Your Service'}</h2>
                </div>
                <div style="padding:36px 32px">
                  <p style="color:#555;margin:0 0 24px;font-size:15px">
                    Your appointment has been confirmed and your deposit received. We look forward to seeing you!
                  </p>
                  <table style="background:#FDFBF7;border-radius:10px;padding:20px;width:100%;border-collapse:collapse">
                    <tr><td style="padding:8px 12px;color:#888;font-size:13px;width:140px">Booking Ref</td><td style="padding:8px 12px;font-weight:bold;font-size:14px;color:#6D4C91">${shortAptId}</td></tr>
                    <tr><td style="padding:8px 12px;color:#888;font-size:13px">Service</td><td style="padding:8px 12px;font-weight:bold;font-size:14px">${appointment.services?.name || '—'}</td></tr>
                    <tr><td style="padding:8px 12px;color:#888;font-size:13px">Date</td><td style="padding:8px 12px;font-size:14px">${aptDate}</td></tr>
                    <tr><td style="padding:8px 12px;color:#888;font-size:13px">Time</td><td style="padding:8px 12px;font-size:14px">${aptTime}</td></tr>
                    <tr><td style="padding:8px 12px;color:#888;font-size:13px">Deposit Paid</td><td style="padding:8px 12px;font-weight:bold;font-size:14px;color:#22c55e">KES ${Number(amount).toLocaleString()}</td></tr>
                    ${remaining > 0 ? `<tr><td style="padding:8px 12px;color:#888;font-size:13px">Balance Due</td><td style="padding:8px 12px;font-size:14px">KES ${remaining.toLocaleString()} (payable at clinic)</td></tr>` : ''}
                    <tr><td style="padding:8px 12px;color:#888;font-size:13px">M-Pesa Receipt</td><td style="padding:8px 12px;font-size:14px">${receipt}</td></tr>
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
          });
          console.log('Appointment confirmation email sent to', profileEmail);
        }
      }
    }

    // Walk-in payment confirmed — mark the walk-in as paid and email the customer
    if (payment?.walk_in_id) {
      await adminDb
        .from('walk_ins')
        .update({ status: 'paid', deposit_paid: amount || 0 })
        .eq('id', payment.walk_in_id);
      console.log(`Walk-in ${payment.walk_in_id} → paid (KES ${amount}, receipt: ${receipt})`);

      // Fetch walk-in details for email
      const { data: walkinData } = await adminDb
        .from('walk_ins')
        .select('*, services(name, base_price), email')
        .eq('id', payment.walk_in_id)
        .single();

      if (walkinData?.email) {
        const wkDate = walkinData.appointment_time
          ? new Date(walkinData.appointment_time).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
          : new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        const wkTime = walkinData.appointment_time
          ? new Date(walkinData.appointment_time).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
          : 'Today';
        const basePrice  = Number(walkinData.services?.base_price) || 0;
        const paid       = Number(amount) || 0;
        const balance    = Math.max(0, basePrice - paid);

        transporter.sendMail({
          from: `"Premier Beauty Clinic" <${process.env.GMAIL_EMAIL}>`,
          to: walkinData.email,
          subject: `Walk-in Booking Confirmed — ${walkinData.services?.name || 'Your Service'} · Premier Beauty Clinic`,
          attachments: [{ filename: 'logo.png', path: LOGO_PATH, cid: 'premier_logo' }],
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee">
              <div style="background:#1A1A1A;padding:28px 32px;text-align:center">
                <img src="cid:premier_logo" alt="Premier Beauty Clinic" style="height:48px;object-fit:contain" />
              </div>
              <div style="background:#0f766e;padding:24px 32px;text-align:center">
                <p style="color:rgba(255,255,255,0.8);font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px">Payment Confirmed</p>
                <h2 style="color:#fff;margin:0;font-size:22px">${walkinData.services?.name || 'Your Service'}</h2>
              </div>
              <div style="padding:36px 32px">
                <p style="color:#555;margin:0 0 24px;font-size:15px">
                  Hi <strong>${walkinData.customer_name}</strong>, your payment has been received and your walk-in appointment is confirmed!
                </p>
                <table style="background:#FDFBF7;border-radius:10px;padding:20px;width:100%;border-collapse:collapse">
                  <tr><td style="padding:8px 12px;color:#888;font-size:13px;width:140px">Service</td><td style="padding:8px 12px;font-weight:bold;font-size:14px">${walkinData.services?.name || '—'}</td></tr>
                  <tr><td style="padding:8px 12px;color:#888;font-size:13px">Date</td><td style="padding:8px 12px;font-size:14px">${wkDate}</td></tr>
                  <tr><td style="padding:8px 12px;color:#888;font-size:13px">Time</td><td style="padding:8px 12px;font-size:14px">${wkTime}</td></tr>
                  <tr><td style="padding:8px 12px;color:#888;font-size:13px">Amount Paid</td><td style="padding:8px 12px;font-weight:bold;font-size:14px;color:#22c55e">KES ${paid.toLocaleString()}</td></tr>
                  <tr><td style="padding:8px 12px;color:#888;font-size:13px">M-Pesa Receipt</td><td style="padding:8px 12px;font-size:14px">${receipt}</td></tr>
                  ${balance > 0 ? `<tr><td style="padding:8px 12px;color:#888;font-size:13px">Balance Due</td><td style="padding:8px 12px;font-size:14px">KES ${balance.toLocaleString()} (payable at clinic)</td></tr>` : `<tr><td style="padding:8px 12px;color:#888;font-size:13px">Balance Due</td><td style="padding:8px 12px;font-weight:bold;font-size:14px;color:#22c55e">Fully Settled</td></tr>`}
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
        }).catch(err => console.error('[Walk-in payment email]', err.message));
      }
    }

    res.json({ success: true });
  });

  return router;
};
