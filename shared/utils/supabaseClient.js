const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.SUPABASE_ANON_KEY || 'local-anon-key';

// Prefer service role key so server-side operations bypass RLS restrictions
const supabaseKey = SERVICE_ROLE_KEY || ANON_KEY;

module.exports = createClient(SUPABASE_URL, supabaseKey);
