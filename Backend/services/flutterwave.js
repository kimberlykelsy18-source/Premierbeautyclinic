const axios = require('axios');

const BASE_URL = 'https://api.flutterwave.com/v3';

function headers() {
  return {
    Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Initialize a Flutterwave Standard hosted payment.
 * Returns { link } — redirect the customer to this URL.
 * payment_options: 'card' ensures ONLY card payment is shown (no M-Pesa on the Flutterwave page).
 */
async function initializePayment({ txRef, amount, currency = 'KES', redirectUrl, customerEmail, customerName, customerPhone, description }) {
  const payload = {
    tx_ref:          txRef,
    amount,
    currency,
    redirect_url:    redirectUrl,
    payment_options: 'card',
    customer: {
      email:       customerEmail   || '',
      phonenumber: customerPhone   || '',
      name:        customerName    || '',
    },
    customizations: {
      title:       'Premier Beauty Clinic',
      description: description || 'Order payment',
    },
  };

  console.log('[Flutterwave] Initiating payment for tx_ref:', txRef, '| amount:', amount);

  const { data } = await axios.post(`${BASE_URL}/payments`, payload, { headers: headers() });

  if (data.status !== 'success') {
    throw new Error('Flutterwave payment init failed: ' + JSON.stringify(data));
  }

  // data.data.link = "https://checkout.flutterwave.com/v3/hosted/pay/..."
  return data.data;
}

/**
 * Verify a completed transaction by its numeric ID.
 * Returns the transaction object: { status, amount, currency, tx_ref, flw_ref, payment_type, ... }
 */
async function verifyTransaction(transactionId) {
  console.log('[Flutterwave] Verifying transaction:', transactionId);
  const { data } = await axios.get(
    `${BASE_URL}/transactions/${transactionId}/verify`,
    { headers: headers() }
  );

  if (!data.data) throw new Error('Flutterwave verification failed: ' + JSON.stringify(data));
  return data.data;
}

module.exports = { initializePayment, verifyTransaction };
