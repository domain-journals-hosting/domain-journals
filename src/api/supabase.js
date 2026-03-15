import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://oliltgstxwsglhirrjmp.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9saWx0Z3N0eHdzZ2xoaXJyam1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MTIzNDMsImV4cCI6MjA4OTE4ODM0M30.h9oxqT8teOKrPdIy6JpjfebWWATpZVnnqqnNtAquLLE";
export const supabase = createClient(supabaseUrl, supabaseKey);
