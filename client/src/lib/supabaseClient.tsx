"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log(supabaseUrl, "ini uspabaseUrl");
console.log(supabaseAnonKey, "ini supabaseAnonKey");

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing next public supabaseUrl or supabaseAnonKey");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
