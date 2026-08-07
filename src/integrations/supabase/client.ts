import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const conditionalStorage = {
  getItem: (key: string) => {
    return sessionStorage.getItem(key) ?? localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    try {
      const parsed = JSON.parse(value);
      const isAnon = parsed?.user?.is_anonymous;
      if (isAnon) {
        sessionStorage.setItem(key, value);
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
        sessionStorage.removeItem(key);
      }
    } catch {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: conditionalStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
