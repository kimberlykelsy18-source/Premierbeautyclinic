const { createServiceClient } = require('../config/supabase');

const MPESA_TIMEOUT_MINUTES = 3;   // M-Pesa STK push expires in ~3 min
const CARD_TIMEOUT_MINUTES  = 15;  // PesaPal hosted page needs more time
const CHECK_INTERVAL_MS = 2 * 60 * 1000; // run every 2 minutes

async function runCleanup() {
  const db = createServiceClient();

  const mpesaCutoff = new Date(Date.now() - MPESA_TIMEOUT_MINUTES * 60 * 1000).toISOString();
  const cardCutoff  = new Date(Date.now() - CARD_TIMEOUT_MINUTES  * 60 * 1000).toISOString();

  // Fetch all pending payments with their method so we can apply the right timeout
  const { data: pendingPayments, error } = await db
    .from('payments')
    .select('id, order_id, appointment_id, payment_method, created_at')
    .eq('status', 'pending');

  if (error) {
    console.error('[PaymentCleanup] Query error:', error.message);
    return;
  }

  if (!pendingPayments || pendingPayments.length === 0) return;

  // Apply per-method timeout
  const stalePayments = pendingPayments.filter(p => {
    if (p.payment_method === 'card') return p.created_at < cardCutoff;
    return p.created_at < mpesaCutoff; // mpesa + anything else
  });

  if (stalePayments.length === 0) return;

  console.log(`[PaymentCleanup] ${stalePayments.length} timed-out payment(s) found — marking failed`);

  const staleIds = stalePayments.map(p => p.id);
  const orderIds = stalePayments.filter(p => p.order_id).map(p => p.order_id);

  // Mark payments as failed with the correct reason per method
  for (const p of stalePayments) {
    const failure_reason = p.payment_method === 'card'
      ? 'Card payment session expired — no confirmation received from PesaPal'
      : 'Network Timeout — no callback received from M-Pesa';
    await db.from('payments').update({ status: 'failed', failure_reason }).eq('id', p.id);
  }

  // Cancel every order whose payment timed out
  if (orderIds.length > 0) {
    await db
      .from('orders')
      .update({ status: 'cancelled' })
      .in('id', orderIds);

    console.log(`[PaymentCleanup] Cancelled ${orderIds.length} order(s):`, orderIds.map(id => id.slice(-6).toUpperCase()));
  }
}

function startPaymentCleanup() {
  console.log(`[PaymentCleanup] Started — M-Pesa timeout: ${MPESA_TIMEOUT_MINUTES} min | Card timeout: ${CARD_TIMEOUT_MINUTES} min`);

  // First run 30 s after server boot (lets the DB connection settle)
  setTimeout(runCleanup, 30 * 1000);

  // Then every 2 minutes
  setInterval(runCleanup, CHECK_INTERVAL_MS);
}

module.exports = { startPaymentCleanup };
