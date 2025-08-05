// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pjtmptuhkyxqyuklxddi.supabase.co'  // kendi URL’in
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqdG1wdHVoa3l4cXl1a2x4ZGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MTc1MzMsImV4cCI6MjA2OTk5MzUzM30.MoVO9bIlxWh73efQv7BqtlYYE4riz2LWJIUWbKQpjlE'                    // kendi anon key’in

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
