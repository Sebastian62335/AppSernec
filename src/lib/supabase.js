
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gynwvldnqstktqoqokes.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5bnd2bGRucXN0a3Rxb3Fva2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNDc4NDcsImV4cCI6MjA1OTcyMzg0N30.OsqQChWmXhW5tk0ws9J3pGHxRLR8SNK6q5Vio-Vz5KI';

export const supabase = createClient(supabaseUrl, supabaseKey);
