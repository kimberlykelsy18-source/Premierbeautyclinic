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
  process.env.FRONTEND_URL,                          // e.g. https://www.premierbeautyclinic.co.ke
  'http://localhost:5173',                            // local dev (store)
  'http://localhost:5174',                            // local dev (dashboard)
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests (no origin) and whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "'unsafe-inline'", "https://vercel.live", "https://www.googletagmanager.com"],
      styleSrc:    ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:     ["'self'", "https://fonts.gstatic.com"],
      imgSrc:      ["'self'", "data:", "https:", "blob:"],
      connectSrc:  ["'self'", process.env.BACKEND_URL, process.env.VITE_SUPABASE_URL, "https://maps.googleapis.com"],
      frameSrc:    ["'self'", "https://pay.pesapal.com"],
      objectSrc:   ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // needed for PesaPal iframe redirect
}));
app.use(morgan('dev'));

// ── Rate limiters ────────────────────────────────────────────────────────────
// Auth endpoints: max 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
});

// Payment endpoints: max 5 STK pushes per minute per IP (prevents spam)
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many payment requests. Please wait a moment.' },
});

app.use('/auth/login',            authLimiter);
app.use('/auth/signup',           authLimiter);
app.use('/auth/forgot-password',  authLimiter);
app.use('/employee/login',        authLimiter);
app.use('/developer/',            authLimiter);
app.use('/checkout/mpesa',        paymentLimiter);
app.use('/checkout/card',         paymentLimiter);
app.use('/api/mpesa/initiate',    paymentLimiter);

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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  startPaymentCleanup();
});
