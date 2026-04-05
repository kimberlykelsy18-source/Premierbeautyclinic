const axios = require('axios');

const BASE_URL = 'https://api.flutterwave.com/v3';

// Token cache — exchange client credentials for a Bearer token, reuse until it expires
let _cachedToken = null;
let _tokenExpiry  = 0;

async function getToken() {
  if (_cachedToken && Date.now() < _tokenExpiry) return _cachedToken;

  const clientId     = process.env.FLW_PUBLIC_KEY;
  const clientSecret = process.env.FLW_SECRET_KEY;

  console.log('[Flutterwave] Fetching access token for client_id:', clientId?.slice(0, 8), '...');

  const { data } = await axios.post(`${BASE_URL}/oauth/token`, {
    grant_type:    'client_credentials',
    client_id:     clientId,
    client_secret: clientSecret,
  }, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!data.data?.access_token) {
    throw new Error('Flutterwave auth failed: ' + JSON.stringify(data));
  }

  _cachedToken = data.data.access_token;
  // Expire 60 seconds before the token's actual expiry to avoid edge cases
  const expiresIn = (data.data.expires_in || 3600) - 60;
  _tokenExpiry  = Date.now() + expiresIn * 1000;

  console.log('[Flutterwave] Access token obtained, expires in', expiresIn, 's');
  return _cachedToken;
}

async function authHeaders() {
  const token = await getToken();
  return {
    Authorization:  `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Initialize a Flutterwave Standard hosted payment.
 * payment_options: 'card' ensures ONLY card payment is shown (no M-Pesa on Flutterwave's page).
 * Returns { link } — redirect the customer to this URL.
 */
async function initializePayment({ txRef, amount, currency = 'KES', redirectUrl, customerEmail, customerName, customerPhone, description }) {
  const headers = await authHeaders();

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

  const { data } = await axios.post(`${BASE_URL}/payments`, payload, { headers });

  if (data.status !== 'success') {
    throw new Error('Flutterwave payment init failed: ' + JSON.stringify(data));
  }

  return data.data; // { link: "https://checkout.flutterwave.com/v3/hosted/pay/..." }
}

/**
 * Verify a completed transaction by its numeric ID.
 * Returns the transaction object: { status, amount, currency, tx_ref, flw_ref, payment_type, ... }
 */
async function verifyTransaction(transactionId) {
  const headers = await authHeaders();

  console.log('[Flutterwave] Verifying transaction:', transactionId);
  const { data } = await axios.get(
    `${BASE_URL}/transactions/${transactionId}/verify`,
    { headers }
  );

  if (!data.data) throw new Error('Flutterwave verification failed: ' + JSON.stringify(data));
  return data.data;
}

module.exports = { initializePayment, verifyTransaction };
