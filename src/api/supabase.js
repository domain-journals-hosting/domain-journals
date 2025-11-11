import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://yjeathhhoivohtgudjxm.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqZWF0aGhob2l2b2h0Z3VkanhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4ODgyNDAsImV4cCI6MjA3ODQ2NDI0MH0.wS9eWY5m1Tom4SSIGKdbVqSBsV5iwkpOsP98QkIawDE";

export const supabase = createClient(supabaseUrl, supabaseKey);
