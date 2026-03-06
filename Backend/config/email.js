const nodemailer = require('nodemailer');

// Single Nodemailer transporter reused across routes
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD
  }
});

module.exports = { transporter };
