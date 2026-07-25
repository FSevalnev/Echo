import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client — used inside "use client" components
// (AuthContext, login form, TryEcho, history page) to read/write the
// current session and query the `attempts` table on behalf of the
// signed-in user. Safe to call repeatedly; each call is cheap.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
