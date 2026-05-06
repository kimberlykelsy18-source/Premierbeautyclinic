require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { supabase, createServiceClient } = require('./config/supabase');
const { transporter } = require('./config/email');
const { initiateSTKPush } = require('./services/mpesa');
const { startPaymentCleanup } = require('./services/paymentCleanup');
const createAuthMiddleware = require('./middleware/auth');

const createEmployeeRoutes = require('./routes/employee');
const createAdminRoutes = require('./routes/admin');
const createCustomerRoutes = require('./routes/customer');
const createPaymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1); // trust first proxy so req.ip is the real client IP

const allowedOrigins = [
  process.env.FRONTEND_URL,                          // production frontend URL
  process.env.DASHBOARD_URL,                         // production dashboard URL (if separate)
  'https://premierbeautyclinic.com',                 // custom domain
  'https://www.premierbeautyclinic.com',             // www variant
  'http://localhost:5173',                            // local dev (store)
  'http://localhost:5174',                            // local dev (dashboard)
].filter(Boolean);

// Allow all Vercel preview deployments for this project
const vercelPreviewRe = /^https:\/\/premier[\w-]*\.vercel\.app$/;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // server-to-server (no origin header)
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (vercelPreviewRe.test(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
// Save raw body buffer for Paystack webhook HMAC-SHA512 signature verification
app.use(express.json({
  verify: (req, _res, buf) => { req.rawBody = buf; },
  limit: '20mb',
}));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "'unsafe-inline'", "https://vercel.live", "https://www.googletagmanager.com"],
      styleSrc:    ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:     ["'self'", "https://fonts.gstatic.com"],
      imgSrc:      ["'self'", "data:", "https:", "blob:"],
      connectSrc:  ["'self'", process.env.BACKEND_URL, process.env.VITE_SUPABASE_URL, "https://maps.googleapis.com"],
      frameSrc:    ["'self'", "https://standard.paystack.co"],
      objectSrc:   ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(morgan('combined', {
  stream: { write: msg => process.stdout.write(msg) },
}));

// ── Rate limiters ────────────────────────────────────────────────────────────

// Global: 500 req / 15 min per IP — catches raw DDoS floods on any endpoint.
// Specific limiters below override this with stricter limits for sensitive routes.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again shortly.' },
});
app.use(globalLimiter);

// Auth endpoints: max 10 attempts per 15 minutes per IP (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
});

// STK Push endpoints: max 5 per minute per IP (prevents M-Pesa spam = financial abuse)
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many payment requests. Please wait a moment.' },
});

// Review submissions: max 10 per hour per IP (prevents fake-review floods)
const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many review submissions. Please try again later.' },
});

// Auth routes
app.use('/auth/login',            authLimiter);
app.use('/auth/signup',           authLimiter);
app.use('/auth/forgot-password',  authLimiter);
app.use('/employee/login',        authLimiter);
app.use('/developer/',            authLimiter);

// Payment / STK Push routes — ALL routes that trigger M-Pesa
app.use('/checkout/mpesa',                paymentLimiter);
app.use('/checkout/card',                 paymentLimiter);
app.use('/checkout/card/submit_pin',      paymentLimiter);
app.use('/checkout/card/submit_otp',      paymentLimiter);
app.use('/api/mpesa/initiate',            paymentLimiter);
app.use('/appointments/book-mpesa',       paymentLimiter); // customer appointment booking
app.use('/admin/walkin',                  paymentLimiter); // walk-in creation (may trigger STK)
app.use('/admin/walkins',                 paymentLimiter); // walk-in pay/complete actions

// Review submissions
app.use('/reviews',                       reviewLimiter);

// ── Build shared middlewares ──────────────────────────────────────────────────
const { authenticate, authenticateOptional, requireEmployeePermission } = createAuthMiddleware(supabase, createServiceClient());

// Register route modules
app.use(createEmployeeRoutes({ supabase, authenticate, requireEmployeePermission, transporter }));
app.use(createAdminRoutes({ supabase, serviceSupabase: createServiceClient(), authenticate, requireEmployeePermission, initiateSTKPush, transporter }));
app.use(createCustomerRoutes({ supabase, serviceSupabase: createServiceClient(), authenticate, authenticateOptional, initiateSTKPush, transporter }));
app.use(createPaymentRoutes({ supabase, initiateSTKPush, transporter }));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Backend Stable ✅' });
});

// ── Critical env-var guard (runs before server starts) ───────────────────────
// If any of these are missing the deployment is broken — crash immediately so
// Railway marks the deploy as failed instead of silently serving broken APIs.
const REQUIRED_VARS = [
  'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
  'PAYSTACK_SECRET_KEY', 'PAYSTACK_PUBLIC_KEY',
  'MPESA_CONSUMER_KEY', 'MPESA_SHORTCODE',
  'SMTP_HOST', 'SMTP_USER',
  'FRONTEND_URL', 'BACKEND_URL',
];
const missing = REQUIRED_VARS.filter(k => !process.env[k]?.trim());
if (missing.length) {
  console.error(`[startup] ❌ MISSING required env vars: ${missing.join(', ')}`);
  console.error('[startup] Refusing to start — fix env vars in Railway dashboard then redeploy.');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);

  // Startup env-var check — trims values to catch whitespace-only entries
  const envCheck = [
    'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
    'MPESA_CONSUMER_KEY', 'MPESA_SHORTCODE',
    'PAYSTACK_SECRET_KEY', 'PAYSTACK_PUBLIC_KEY',
    'SMTP_HOST', 'SMTP_USER',
    'FRONTEND_URL', 'BACKEND_URL',
  ];
  envCheck.forEach(k => {
    const val = process.env[k]?.trim();
    console.log(`[env] ${k}: ${val ? '✅ set (' + val.slice(0, 6) + '...)' : '❌ MISSING'}`);
  });

  startPaymentCleanup();
});
