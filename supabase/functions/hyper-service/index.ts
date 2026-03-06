// Premier Beauty Clinic — M-Pesa Callback Handler
// Deployed as a Supabase Edge Function so Safaricom can reach it
// without needing ngrok or a publicly deployed Express server.
//
// Flow:
//   Safaricom → POST /hyper-service → update DB → send email via Gmail
//
// Supabase Secrets required (set in Dashboard → Project Settings → Edge Functions → Secrets):
//   GMAIL_EMAIL        — your Gmail address
//   GMAIL_PASSWORD     — your Gmail App Password (Settings → 2FA → App Passwords)
//   CLINIC_NAME        — displayed in emails (default: Premier Beauty Clinic)
//   CLINIC_ADDRESS     — displayed in emails (default: Ngong Road, Nairobi)
//   LOGO_URL           — optional logo image URL for emails

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import nodemailer from 'npm:nodemailer';

// ─── Short ID helpers ──────────────────────────────────────────────────────
// Converts a sequential number → human-readable ID (ORD-A001 … ORD-A999 → ORD-B001 …)
function toShortId(prefix: string, n: number | null | undefined): string {
  if (!n) return `${prefix}-???`;
  const letterIndex = Math.floor((n - 1) / 999);
  const numPart     = ((n - 1) % 999) + 1;
  const letter      = String.fromCharCode(65 + letterIndex);
  return `${prefix}-${letter}${String(numPart).padStart(3, '0')}`;
}
const toShortOrderId = (n: number | null | undefined) => toShortId('ORD', n);
const toShortAptId   = (n: number | null | undefined) => toShortId('APT', n);

// ─── Config ────────────────────────────────────────────────────────────────
const CLINIC_NAME    = Deno.env.get('CLINIC_NAME')    || 'Premier Beauty Clinic';
const CLINIC_ADDRESS = Deno.env.get('CLINIC_ADDRESS') || 'Ngong Road, Nairobi';
const LOGO_URL       = Deno.env.get('LOGO_URL')       || '';

// Supabase client (service role — needed to update any row)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Gmail transporter via Nodemailer
// Uses the same Gmail App Password you have in Backend/.env
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: Deno.env.get('GMAIL_EMAIL'),
    pass: Deno.env.get('GMAIL_PASSWORD'),
  },
});

// ─── Main Handler ──────────────────────────────────────────────────────────
serve(async (req) => {
  const body = await req.json();
  const callbackData = body.Body?.stkCallback;

  // Always respond 200 immediately — Safaricom retries if it doesn't get 200
  if (!callbackData) {
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  const resultCode       = callbackData.ResultCode;
  const checkoutRequestId = callbackData.CheckoutRequestID;
  const metaItems        = callbackData.CallbackMetadata?.Item || [];
  const receipt          = metaItems.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
  const amount           = metaItems.find((i: any) => i.Name === 'Amount')?.Value;

  // ── Step 1: Update payment status + receipt ──
  // This is what the frontend's polling endpoint (GET /payment/status/:id) checks.
  // CRITICAL — must happen for every callback (success AND failure).
  // mpesa_receipt must be stored here so the dashboard card can show it immediately after polling.
  await supabase
    .from('payments')
    .update(
      resultCode === 0
        ? { status: 'paid',   mpesa_receipt: receipt || null }
        : { status: 'failed', failure_reason: callbackData.ResultDesc || 'Payment declined by M-Pesa' }
    )
    .eq('checkout_request_id', checkoutRequestId);

  if (resultCode !== 0) {
    console.log('Payment failed/cancelled:', callbackData.ResultDesc);
    // Update the linked order or appointment to reflect the failure
    const { data: failedPayment } = await supabase
      .from('payments')
      .select('order_id, appointment_id')
      .eq('checkout_request_id', checkoutRequestId)
      .single();
    if (failedPayment?.order_id) {
      await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', failedPayment.order_id);
      console.log('Order cancelled due to failed payment:', failedPayment.order_id);
    }
    if (failedPayment?.appointment_id) {
      // Only mark 'failed' for initial deposit payments (appointment was 'pending').
      // For check-in / balance payments (appointment was 'confirmed'), leave as 'confirmed'
      // so the receptionist can retry — appointment is not lost.
      const { data: apt } = await supabase
        .from('appointments')
        .select('status')
        .eq('id', failedPayment.appointment_id)
        .single();
      if (apt?.status === 'pending') {
        await supabase
          .from('appointments')
          .update({ status: 'failed' })
          .eq('id', failedPayment.appointment_id);
        console.log('Appointment marked failed (deposit declined):', failedPayment.appointment_id);
      } else {
        console.log('Check-in payment failed for appointment:', failedPayment.appointment_id, '— left as', apt?.status, 'for retry');
      }
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  // ── Step 2: Find the payment row to get order_id / appointment_id ──
  const { data: payment } = await supabase
    .from('payments')
    .select('order_id, appointment_id')
    .eq('checkout_request_id', checkoutRequestId)
    .single();

  // ── Step 3a: Handle product order ──
  if (payment?.order_id) {
    const { data: order } = await supabase
      .from('orders')
      .select('*, order_number, order_items(*, products(name)), customer_email')
      .eq('id', payment.order_id)
      .single();

    // Mark order as paid
    await supabase.from('orders').update({ status: 'paid' }).eq('id', payment.order_id);

    // ── Reduce inventory for each purchased item ──
    const orderItems = order?.order_items || [];
    if (orderItems.length > 0) {
      const shortOrderId = toShortOrderId(order?.order_number);
      await Promise.all(orderItems.map(async (item: any) => {
        const { data: prod } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();

        if (prod !== null) {
          await supabase
            .from('products')
            .update({ stock: Math.max(0, (prod.stock || 0) - item.quantity) })
            .eq('id', item.product_id);
        }

        await supabase.from('inventory_logs').insert({
          product_id: item.product_id,
          staff_id: null,
          quantity_change: -item.quantity,
          reason: `Sale — Order ${shortOrderId}`,
        });
      }));
      console.log(`Inventory reduced for order ${shortOrderId} (${orderItems.length} line items)`);
    }

    if (order?.customer_email) {
      try {
        await sendOrderEmail(order, receipt, amount);
        console.log(`Order email sent to ${order.customer_email}`);
      } catch (err) {
        console.error('Failed to send order email:', err);
        // Don't let email failure affect the response to Safaricom
      }
    }
  }

  // ── Step 3b: Handle appointment booking ──
  if (payment?.appointment_id) {
    const { data: appointment } = await supabase
      .from('appointments')
      .select('*, appointment_number, services(name), profiles(email)')
      .eq('id', payment.appointment_id)
      .single();

    // Status transition rules:
    // pending    → confirmed : initial deposit/full payment paid online
    // confirmed  → confirmed : balance or clinic payment collected — stays confirmed until
    //                          receptionist manually clicks "Check In" to mark completed
    const isBalancePayment = appointment?.status === 'confirmed'; // used for email template selection
    const newAptStatus     = appointment?.status === 'pending' ? 'confirmed' : appointment?.status;
    await supabase.from('appointments').update({ status: newAptStatus }).eq('id', payment.appointment_id);
    console.log(`Appointment ${payment.appointment_id} → ${newAptStatus}`);

    const profileEmail = appointment?.profiles?.email;
    if (profileEmail) {
      try {
        await sendAppointmentEmail(appointment, receipt, amount, isBalancePayment);
        console.log(`Appointment email sent to ${profileEmail}`);
      } catch (err) {
        console.error('Failed to send appointment email:', err);
      }
    }
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});

// ─── Email: Order Confirmation ─────────────────────────────────────────────
async function sendOrderEmail(order: any, receipt: string, amount: number) {
  const logoHtml = LOGO_URL
    ? `<img src="${LOGO_URL}" alt="${CLINIC_NAME}" style="max-width:180px; margin-bottom:24px;">`
    : `<h2 style="color:#6D4C91;">${CLINIC_NAME}</h2>`;

  const rowsHtml = (order.order_items || []).map((item: any) => `
    <tr>
      <td style="padding:10px 14px; border-bottom:1px solid #eee;">${item.products?.name ?? 'Product'}</td>
      <td style="padding:10px 14px; border-bottom:1px solid #eee; text-align:center;">${item.quantity}</td>
      <td style="padding:10px 14px; border-bottom:1px solid #eee; text-align:right;">KSh ${item.price_at_time}</td>
      <td style="padding:10px 14px; border-bottom:1px solid #eee; text-align:right;">KSh ${item.quantity * item.price_at_time}</td>
    </tr>
  `).join('');

  const addr = order.shipping_address || {};
  const addrStr = [addr.street, addr.building, addr.city, addr.county]
    .filter(Boolean).join(', ');

  await transporter.sendMail({
    from: `"${CLINIC_NAME}" <${Deno.env.get('GMAIL_EMAIL')}>`,
    to: order.customer_email,
    subject: `Order Confirmed ${toShortOrderId(order.order_number)} — ${CLINIC_NAME}`,
    html: `
      <div style="font-family:Arial,sans-serif; max-width:600px; margin:0 auto; padding:32px; color:#1A1A1A;">
        ${logoHtml}
        <h1 style="font-size:24px; margin-bottom:8px;">Thank you for your purchase!</h1>
        <p style="color:#666;">Your payment has been confirmed and your order is being processed.</p>

        <div style="background:#f9f9f9; border-radius:12px; padding:20px; margin:24px 0;">
          <p style="margin:4px 0;"><strong>Order:</strong> ${toShortOrderId(order.order_number)}</p>
          <p style="margin:4px 0;"><strong>M-Pesa Receipt:</strong> ${receipt}</p>
          <p style="margin:4px 0;"><strong>Total Paid:</strong> KSh ${amount}</p>
        </div>

        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <thead style="background:#6D4C91; color:white;">
            <tr>
              <th style="padding:10px 14px; text-align:left;">Item</th>
              <th style="padding:10px 14px; text-align:center;">Qty</th>
              <th style="padding:10px 14px; text-align:right;">Unit Price</th>
              <th style="padding:10px 14px; text-align:right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>

        <p style="margin-top:20px;"><strong>Shipping to:</strong> ${addrStr}</p>
        <p style="color:#666; font-size:13px;">We will notify you when your order is out for delivery.</p>

        <hr style="border:none; border-top:1px solid #eee; margin:24px 0;">
        <p style="color:#999; font-size:12px;">
          ${CLINIC_NAME} · ${CLINIC_ADDRESS}<br>
          If you have questions, reply to this email.
        </p>
      </div>
    `,
  });
}

// ─── Email: Appointment Confirmation or Full Payment ──────────────────────
async function sendAppointmentEmail(appointment: any, receipt: string, amountPaid: number, isBalancePayment = false) {
  const profileEmail = appointment.profiles?.email;
  const shortRef     = toShortAptId(appointment.appointment_number);
  const dateTime     = new Date(appointment.appointment_time).toLocaleString('en-KE');
  const service      = appointment.services?.name || 'Your Service';

  const logoHtml = LOGO_URL
    ? `<img src="${LOGO_URL}" alt="${CLINIC_NAME}" style="max-width:180px; margin-bottom:24px;">`
    : `<h2 style="color:#6D4C91;">${CLINIC_NAME}</h2>`;

  let subject: string;
  let bodyHtml: string;

  if (isBalancePayment) {
    subject = `Payment Complete — ${service} · ${CLINIC_NAME}`;
    bodyHtml = `
      <div style="font-family:Arial,sans-serif; max-width:600px; margin:0 auto; padding:32px; color:#1A1A1A;">
        ${logoHtml}
        <h1 style="font-size:24px; margin-bottom:8px; color:#16a34a;">Service Fully Paid!</h1>
        <p style="color:#666;">Thank you for completing your payment at ${CLINIC_NAME}.</p>
        <div style="background:#f0fdf4; border-radius:12px; padding:20px; margin:24px 0; border:1px solid #bbf7d0;">
          <p style="margin:4px 0;"><strong>Booking Ref:</strong> ${shortRef}</p>
          <p style="margin:4px 0;"><strong>Service:</strong> ${service}</p>
          <p style="margin:4px 0;"><strong>Date & Time:</strong> ${dateTime}</p>
          <p style="margin:4px 0;"><strong>Amount Paid:</strong> KSh ${amountPaid}</p>
          <p style="margin:4px 0;"><strong>M-Pesa Receipt:</strong> ${receipt}</p>
          <p style="margin:4px 0; color:#16a34a;"><strong>Balance Due: KSh 0 — Fully Settled</strong></p>
        </div>
        <p style="color:#666; font-size:13px;">Thank you for choosing us. We hope to see you again!</p>
        <hr style="border:none; border-top:1px solid #eee; margin:24px 0;">
        <p style="color:#999; font-size:12px;">${CLINIC_NAME} · ${CLINIC_ADDRESS}</p>
      </div>
    `;
  } else {
    const remaining = appointment.total_amount - amountPaid;
    subject = `Appointment Confirmed ${shortRef} — ${CLINIC_NAME}`;
    bodyHtml = `
      <div style="font-family:Arial,sans-serif; max-width:600px; margin:0 auto; padding:32px; color:#1A1A1A;">
        ${logoHtml}
        <h1 style="font-size:24px; margin-bottom:8px;">Your Appointment is Confirmed!</h1>
        <p style="color:#666;">We look forward to seeing you at ${CLINIC_NAME}.</p>
        <div style="background:#f9f9f9; border-radius:12px; padding:20px; margin:24px 0;">
          <p style="margin:4px 0;"><strong>Booking Ref:</strong> ${shortRef}</p>
          <p style="margin:4px 0;"><strong>Service:</strong> ${service}</p>
          <p style="margin:4px 0;"><strong>Date & Time:</strong> ${dateTime}</p>
          <p style="margin:4px 0;"><strong>Deposit Paid:</strong> KSh ${amountPaid} (Receipt: ${receipt})</p>
          <p style="margin:4px 0;"><strong>Balance Due on the Day:</strong> KSh ${remaining}</p>
        </div>
        <p><strong>Location:</strong> ${CLINIC_ADDRESS}</p>
        <p style="color:#666; font-size:13px;">Please arrive 10 minutes early. To reschedule, contact us at least 24 hours before your appointment.</p>
        <hr style="border:none; border-top:1px solid #eee; margin:24px 0;">
        <p style="color:#999; font-size:12px;">${CLINIC_NAME} · ${CLINIC_ADDRESS}</p>
      </div>
    `;
  }

  await transporter.sendMail({
    from: `"${CLINIC_NAME}" <${Deno.env.get('GMAIL_EMAIL')}>`,
    to: profileEmail,
    subject,
    html: bodyHtml,
  });
}
