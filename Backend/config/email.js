const nodemailer = require('nodemailer');

// Gmail via OAuth2 — more secure than password auth (which Google has deprecated)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type:         'OAuth2',
    user:         process.env.GMAIL_EMAIL,
    clientId:     process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
  },
});

module.exports = { transporter };
