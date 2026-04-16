/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";

const isCypress =
  typeof window !== 'undefined' && typeof (window as any).Cypress !== 'undefined';

// Cypress E2E should be able to run without a real Supabase backend/session.
// This avoids relying on auth state + network calls when the user is just running `cypress open`.
let supabaseImpl: any;
console.log('Is Cypress:', isCypress);
if (isCypress) {
  const cypressSession = {
    user: {
      id: 'cypress-user',
      email: 'cypress@example.com',
      user_metadata: { full_name: 'Cypress User' },
    },
  };

  const mockSubscription = {
    unsubscribe: () => { },
  };

  const mockFrom = () => ({
    select: async () => ({ data: null, error: null }),
    insert: async () => ({ success: true }),
    update: () => ({
      eq: async () => ({ success: true }),
    }),
    delete: () => ({
      eq: async () => ({ success: true }),
    }),
  });

  supabaseImpl = {
    from: () => mockFrom(),
    auth: {
      getSession: async () => ({ data: { session: cypressSession } }),
      onAuthStateChange: (cb: any) => {
        cb?.('SIGNED_IN', cypressSession);
        return { data: { subscription: mockSubscription } };
      },
      signInWithOAuth: async () => ({}),
      signOut: async () => ({}),
    },
  };
} else {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    import.meta.env.VITE_SUPABASE_ANON_KEY;
  console.log("import.meta.env", import.meta.env)
  console.log("import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY", import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
  console.log("import.meta.env.VITE_SUPABASE_ANON_KEY", import.meta.env.VITE_SUPABASE_ANON_KEY)
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Anon Key:', supabaseAnonKey);
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Check your .env file.',
    );
  }

  supabaseImpl = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseImpl;
