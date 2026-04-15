const nodemailer = require('nodemailer');

// SMTP configuration — driven entirely by environment variables.
//
// Gmail (current setup — works without custom domain):
//   SMTP_HOST=smtp.gmail.com
//   SMTP_PORT=587
//   SMTP_USER=your-gmail@gmail.com
//   SMTP_PASS=<16-char Gmail App Password>
//
// cPanel / HostPinnacle (once domain DNS is live):
//   SMTP_HOST=mail.premierbeautyclinic.com
//   SMTP_PORT=465
//   SMTP_USER=noreply@premierbeautyclinic.com
//   SMTP_PASS=<cPanel email account password>

const port   = Number(process.env.SMTP_PORT) || 587;
const secure = port === 465; // true only for SSL/port-465; port 587 uses STARTTLS

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST || 'smtp.gmail.com',
  port,
  secure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

module.exports = { transporter };
