import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Debug logs
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key length:', supabaseAnonKey?.length || 0);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Validate URL format
if (!supabaseUrl.includes('supabase.co')) {
  throw new Error('Invalid Supabase URL format');
}

// Validate anon key format
if (!supabaseAnonKey.startsWith('eyJ')) {
  throw new Error('Invalid Supabase anon key format');
}

// Create the Supabase client with additional options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: 'supabase.auth.token',
    storage: {
      getItem: (key) => {
        const value = localStorage.getItem(key);
        console.log('Getting auth token:', key, value ? 'Found' : 'Not found');
        return value;
      },
      setItem: (key, value) => {
        console.log('Setting auth token:', key, value ? 'Set' : 'Not set');
        localStorage.setItem(key, value);
      },
      removeItem: (key) => {
        console.log('Removing auth token:', key);
        localStorage.removeItem(key);
      },
    },
  },
  global: {
    headers: {
      'x-application-name': 'your-app-name'
    }
  }
});

// Verify client initialization
console.log('Supabase client initialized successfully'); 