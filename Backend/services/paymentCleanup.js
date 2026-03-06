const { createServiceClient } = require('../config/supabase');

const TIMEOUT_MINUTES = 10;
const CHECK_INTERVAL_MS = 2 * 60 * 1000; // run every 2 minutes

async function runCleanup() {
  const db = createServiceClient();

  // Any payment still 'pending' whose created_at is older than the timeout window
  const cutoff = new Date(Date.now() - TIMEOUT_MINUTES * 60 * 1000).toISOString();

  const { data: stalePayments, error } = await db
    .from('payments')
    .select('id, order_id, appointment_id')
    .eq('status', 'pending')
    .lt('created_at', cutoff);

  if (error) {
    console.error('[PaymentCleanup] Query error:', error.message);
    return;
  }

  if (!stalePayments || stalePayments.length === 0) return;

  console.log(`[PaymentCleanup] ${stalePayments.length} timed-out payment(s) found — marking failed`);

  const staleIds  = stalePayments.map(p => p.id);
  const orderIds  = stalePayments.filter(p => p.order_id).map(p => p.order_id);

  // Mark payments as failed with reason
  await db
    .from('payments')
    .update({ status: 'failed', failure_reason: 'Network Timeout — no callback received from M-Pesa' })
    .in('id', staleIds);

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
  console.log(`[PaymentCleanup] Started — checking every 2 min for payments pending > ${TIMEOUT_MINUTES} min`);

  // First run 30 s after server boot (lets the DB connection settle)
  setTimeout(runCleanup, 30 * 1000);

  // Then every 2 minutes
  setInterval(runCleanup, CHECK_INTERVAL_MS);
}

module.exports = { startPaymentCleanup };
