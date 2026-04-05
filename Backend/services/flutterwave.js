const axios = require('axios');

// V4 developer sandbox uses Keycloak-based OAuth2 for authentication
const TOKEN_URL = 'https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token';

function apiBase() {
  return process.env.FLW_ENV === 'production'
    ? 'https://api.flutterwave.com/v3'
    : 'https://developersandbox-api.flutterwave.com/v3';
}

// Token cache — reuse until close to expiry
let _cachedToken = null;
let _tokenExpiry  = 0;

async function getToken() {
  if (_cachedToken && Date.now() < _tokenExpiry) return _cachedToken;

  const clientId     = process.env.FLW_CLIENT_ID;
  const clientSecret = process.env.FLW_CLIENT_SECRET;

  console.log('[Flutterwave] Fetching access token, client_id:', clientId?.slice(0, 8), '...');

  const params = new URLSearchParams();
  params.append('grant_type',    'client_credentials');
  params.append('client_id',     clientId);
  params.append('client_secret', clientSecret);

  const { data } = await axios.post(TOKEN_URL, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!data.access_token) {
    throw new Error('[Flutterwave] Token fetch failed: ' + JSON.stringify(data));
  }

  _cachedToken = data.access_token;
  _tokenExpiry  = Date.now() + ((data.expires_in || 3600) - 60) * 1000;
  console.log('[Flutterwave] Token obtained, expires in', (data.expires_in || 3600) - 60, 's');
  return _cachedToken;
}

/**
 * Initiate a hosted payment page (Standard checkout).
 * Flutterwave returns a redirect link — send the customer there to enter card details.
 */
async function initializePayment({ txRef, amount, currency = 'KES', redirectUrl, customerEmail, customerName, customerPhone, description }) {
  const token = await getToken();

  const payload = {
    tx_ref:       txRef,
    amount,
    currency,
    redirect_url: redirectUrl,
    customer: {
      email:        customerEmail || '',
      name:         customerName  || customerEmail || 'Customer',
      phone_number: customerPhone || '',
    },
    customizations: {
      title:       'Premier Beauty Clinic',
      description: description || 'Premier Beauty Clinic order',
    },
  };

  console.log('[Flutterwave] Initiating payment tx_ref:', txRef, '| amount:', amount, currency);

  const { data } = await axios.post(`${apiBase()}/payments`, payload, {
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!data.data) throw new Error('[Flutterwave] Payment init failed: ' + JSON.stringify(data));

  const link = data.data.link
    || data.data.authorization_url
    || data.data.redirect_url
    || data.data.payment_url;

  if (!link) throw new Error('[Flutterwave] No redirect URL in response: ' + JSON.stringify(data));

  console.log('[Flutterwave] Payment created, redirect link obtained');
  return { link };
}

/**
 * Verify a transaction by its tx_ref (our short order ID).
 * Returns the transaction object: { status, amount, currency, tx_ref, ... }
 */
async function verifyTransaction(reference) {
  const token = await getToken();
  console.log('[Flutterwave] Verifying transaction tx_ref:', reference);

  const { data } = await axios.get(
    `${apiBase()}/transactions?tx_ref=${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!data.data) throw new Error('[Flutterwave] Verify failed: ' + JSON.stringify(data));

  // Returns an array — grab the first match
  const tx = Array.isArray(data.data) ? data.data[0] : data.data;
  if (!tx) throw new Error('[Flutterwave] No transaction found for tx_ref: ' + reference);

  return tx;
}

module.exports = { initializePayment, verifyTransaction };
