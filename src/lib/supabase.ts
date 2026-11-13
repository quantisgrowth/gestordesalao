import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;
export const supabaseConfigured = Boolean(
  import.meta.env["VITE_SUPABASE_URL"] &&
  (import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || import.meta.env["VITE_SUPABASE_ANON_KEY"]),
);

// Created only in the browser. Each request to the database uses the user's JWT and RLS.
export function getSupabase() {
  if (!supabaseConfigured) throw new Error("A conexão com o Supabase ainda não foi configurada.");
  if (typeof window === "undefined") throw new Error("O acesso à sessão ocorre no navegador.");
  return (client ??= createClient(
    import.meta.env["VITE_SUPABASE_URL"],
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || import.meta.env["VITE_SUPABASE_ANON_KEY"],
  ));
}
