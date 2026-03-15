const axios = require('axios');

const BASE_URL = process.env.PESAPAL_ENV === 'live'
  ? 'https://pay.pesapal.com/v3'
  : 'https://cybqa.pesapal.com/pesapalv3';

// Token cache — PesaPal tokens are valid for 5 min; refresh at 4 min
let _cachedToken = null;
let _tokenExpiry  = 0;

async function getToken() {
  if (_cachedToken && Date.now() < _tokenExpiry) return _cachedToken;

  const { data } = await axios.post(`${BASE_URL}/api/Auth/RequestToken`, {
    consumer_key:    process.env.PESAPAL_CONSUMER_KEY,
    consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
  }, {
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  });

  if (!data.token) throw new Error('PesaPal auth failed: ' + JSON.stringify(data));

  _cachedToken = data.token;
  _tokenExpiry  = Date.now() + 4 * 60 * 1000; // 4 minutes
  return _cachedToken;
}

async function authHeaders() {
  const token = await getToken();
  return {
    Accept:         'application/json',
    'Content-Type': 'application/json',
    Authorization:  `Bearer ${token}`,
  };
}

// Fetch existing active IPN for ipnUrl, or register a new one. Returns ipn_id.
async function getOrRegisterIPN(ipnUrl) {
  const headers = await authHeaders();

  try {
    const { data: list } = await axios.get(`${BASE_URL}/api/URLSetup/GetIpnList`, { headers });
    if (Array.isArray(list)) {
      const found = list.find(ipn => ipn.url === ipnUrl && ipn.ipn_status === 1);
      if (found) return found.ipn_id;
    }
  } catch (_) {
    // If listing fails just try to register
  }

  const { data } = await axios.post(`${BASE_URL}/api/URLSetup/RegisterIPN`, {
    url:                   ipnUrl,
    ipn_notification_type: 'GET',
  }, { headers });

  if (!data.ipn_id) throw new Error('PesaPal IPN registration failed: ' + JSON.stringify(data));
  return data.ipn_id;
}

// Submit an order to PesaPal and get back { redirect_url, order_tracking_id, merchant_reference }
async function submitOrder({ merchantReference, amount, currency = 'KES', description, callbackUrl, cancellationUrl, ipnId, billingAddress }) {
  const headers = await authHeaders();

  const { data } = await axios.post(`${BASE_URL}/api/Transactions/SubmitOrderRequest`, {
    id:               merchantReference,
    currency,
    amount,
    description,
    callback_url:     callbackUrl,
    cancellation_url: cancellationUrl,
    notification_id:  ipnId,
    branch:           'Premier Beauty Clinic - Nairobi',
    billing_address:  billingAddress,
  }, { headers });

  if (!data.redirect_url) throw new Error('PesaPal order submission failed: ' + JSON.stringify(data));
  return data;
}

// Check the status of a transaction. Returns status_code: 1=COMPLETED, 2=FAILED, 3=REVERSED
async function getTransactionStatus(orderTrackingId) {
  const headers = await authHeaders();
  const { data } = await axios.get(
    `${BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
    { headers }
  );
  return data;
}

module.exports = { getOrRegisterIPN, submitOrder, getTransactionStatus };
