const { createClient } = require('@supabase/supabase-js');

// Shared Supabase client for the app
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to create a service-role client when admin privileges are required
const createServiceClient = () => createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = { supabase, createServiceClient };
