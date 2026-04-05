const axios = require('axios');

// V4 uses Keycloak-based OAuth2 for authentication
const TOKEN_URL = 'https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token';

// API base differs between sandbox and production
function apiBase() {
  return process.env.FLW_ENV === 'production'
    ? 'https://api.flutterwave.com'
    : 'https://developersandbox-api.flutterwave.com';
}

// Token cache — reuse until close to expiry
let _cachedToken = null;
let _tokenExpiry  = 0;

async function getToken() {
  if (_cachedToken && Date.now() < _tokenExpiry) return _cachedToken;

  const clientId     = process.env.FLW_CLIENT_ID;
  const clientSecret = process.env.FLW_CLIENT_SECRET;

  console.log('[Flutterwave] Fetching access token, client_id:', clientId?.slice(0, 8), '...');

  // OAuth2 client_credentials — form-encoded (Keycloak standard)
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

  // Cache with a 60-second safety buffer
  _cachedToken = data.access_token;
  _tokenExpiry  = Date.now() + ((data.expires_in || 3600) - 60) * 1000;
  console.log('[Flutterwave] Token obtained, expires in', (data.expires_in || 3600) - 60, 's');
  return _cachedToken;
}

async function authHeaders(traceId) {
  const token = await getToken();
  const h = {
    Authorization:      `Bearer ${token}`,
    'Content-Type':     'application/json',
    'X-Trace-Id':       traceId || `pbc-${Date.now()}`,
    'X-Idempotency-Key': traceId || `pbc-${Date.now()}`,
  };
  return h;
}

/**
 * Create a customer in Flutterwave V4.
 * Returns the customer object (with customer.id = "cus_...").
 */
async function createCustomer({ email, name, phone }) {
  const headers = await authHeaders(`cus-${Date.now()}`);
  const { data } = await axios.post(`${apiBase()}/customers`, {
    email, name, phone_number: phone || '',
  }, { headers });

  if (!data.data?.id) throw new Error('[Flutterwave] Customer create failed: ' + JSON.stringify(data));
  console.log('[Flutterwave] Customer created:', data.data.id);
  return data.data;
}

/**
 * Initiate a card charge. For new customers (no saved card), Flutterwave
 * will redirect them to enter card details via the redirect_url flow.
 * Returns the charge object — look for data.authorization_url or data.redirect_url.
 */
async function initializePayment({ txRef, amount, currency = 'KES', redirectUrl, customerEmail, customerName, customerPhone, description }) {
  // Step 1: create (or get) a customer
  const customer = await createCustomer({ email: customerEmail, name: customerName, phone: customerPhone });

  // Step 2: initiate the charge
  const headers = await authHeaders(txRef);
  const payload = {
    reference:    txRef,
    currency,
    amount,
    customer_id:  customer.id,
    redirect_url: redirectUrl,
    meta: {
      description: description || 'Premier Beauty Clinic order',
    },
  };

  console.log('[Flutterwave] Initiating charge tx_ref:', txRef, '| amount:', amount, currency);

  const { data } = await axios.post(`${apiBase()}/charges`, payload, { headers });

  if (!data.data) throw new Error('[Flutterwave] Charge init failed: ' + JSON.stringify(data));

  // V4 may return the redirect link in different fields — handle both
  const link = data.data.authorization_url
    || data.data.redirect_url
    || data.data.link
    || data.data.payment_url;

  if (!link) throw new Error('[Flutterwave] No redirect URL in charge response: ' + JSON.stringify(data));

  console.log('[Flutterwave] Charge created, redirect link obtained');
  return { link };
}

/**
 * Verify a charge by its reference (our tx_ref / short order ID).
 * Returns the charge object: { status, amount, currency, reference, ... }
 */
async function verifyTransaction(reference) {
  const headers = await authHeaders(`verify-${reference}`);
  console.log('[Flutterwave] Verifying charge reference:', reference);

  const { data } = await axios.get(
    `${apiBase()}/charges/${encodeURIComponent(reference)}`,
    { headers }
  );

  if (!data.data) throw new Error('[Flutterwave] Verify failed: ' + JSON.stringify(data));
  return data.data;
}

module.exports = { initializePayment, verifyTransaction };
