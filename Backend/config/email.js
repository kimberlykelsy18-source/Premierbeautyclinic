const nodemailer = require('nodemailer');

// cPanel SMTP — uses the email account created in HostPinnacle cPanel.
// Set these in Railway environment variables:
//   SMTP_HOST=mail.premierbeautyclinic.com
//   SMTP_PORT=465
//   SMTP_USER=noreply@premierbeautyclinic.com
//   SMTP_PASS=<password set in cPanel Email Accounts>
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST || 'mail.premierbeautyclinic.com',
  port:   Number(process.env.SMTP_PORT) || 465,
  secure: true, // true for port 465 (SSL), false for 587 (TLS/STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

module.exports = { transporter };
