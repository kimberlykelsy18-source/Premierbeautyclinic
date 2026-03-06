require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan('dev'));

// Build shared middlewares
const { authenticate, authenticateOptional, requireEmployeePermission } = createAuthMiddleware(supabase);

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
