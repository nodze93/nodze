import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Anon ključ za javni sajt. U bot kontekstu (GitHub Actions) anon ključ
// nije postavljen — tad koristi service role samo da import ne pukne
// (bot ionako radi preko createServerClient, ne preko ovog klijenta).
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "";

// Client-side Supabase (anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase (service role — samo u Server Actions / Route Handlers)
export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
