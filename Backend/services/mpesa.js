const axios = require('axios');

// Build Daraja timestamp in the format YYYYMMDDHHMMSS
function getTimestamp() {
  const date = new Date();
  return (
    date.getFullYear() +
    ('0' + (date.getMonth() + 1)).slice(-2) +
    ('0' + date.getDate()).slice(-2) +
    ('0' + date.getHours()).slice(-2) +
    ('0' + date.getMinutes()).slice(-2) +
    ('0' + date.getSeconds()).slice(-2)
  );
}

const MPESA_BASE_URL = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke';

// Fetch OAuth access token from Safaricom
async function getAccessToken() {
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
  const res = await axios.get(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` }
  });
  return res.data.access_token;
}

// Initiate an STK push request
async function initiateSTKPush(phone, amount, reference) {
  const token = await getAccessToken();
  const timestamp = getTimestamp();
  const password = Buffer.from(process.env.MPESA_SHORTCODE + process.env.MPESA_PASSKEY + timestamp).toString('base64');

  // Daraja limits: AccountReference ≤ 12 chars, TransactionDesc ≤ 13 chars
  const safeRef  = String(reference || 'PremierBeaut').slice(0, 12);
  const safeDesc = 'Beauty Clinic'; // exactly 13 chars

  const payload = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(amount),
    PartyA: phone,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: process.env.MPESA_CALLBACK_URL,
    AccountReference: safeRef,
    TransactionDesc: safeDesc,
  };

  try {
    const res = await axios.post(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (err) {
    console.error('=== DARAJA ERROR ===');
    console.error('Status:', err.response?.status);
    console.error('Body:', err.response?.data);
    throw err;
  }
}

module.exports = { getTimestamp, getAccessToken, initiateSTKPush };
