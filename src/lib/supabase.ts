import { createClient } from "@supabase/supabase-js";

// Ambil URL dan Key dari file .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Cek keamanan: Pastikan kuncinya ada
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL atau Key belum disetting di file .env");
}

// Buat dan export koneksi agar bisa dipakai di halaman lain
export const supabase = createClient(supabaseUrl, supabaseKey);
