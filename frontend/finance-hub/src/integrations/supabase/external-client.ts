import { createClient } from '@supabase/supabase-js';

const EXTERNAL_SUPABASE_URL = "https://yuddpeadtlfwtceoaqpm.supabase.co";
const EXTERNAL_SUPABASE_KEY = "sb_publishable_EI5wiBQMToMEDY-lnbkMow_xxUrIrbI";

export const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_KEY);

// Projeto Sólides — dados de RH (colaboradores, perfis DISC, mapa de talentos)
const SOLIDES_SUPABASE_URL = "https://qshfjfgkqawjlpqlceuf.supabase.co";
const SOLIDES_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzaGZqZmdrcWF3amxwcWxjZXVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTEzOTYsImV4cCI6MjA5MTY4NzM5Nn0.BXxsSCrIvXQcfFi_CoeZPr5AwCqjGR_aSiykqMvVvd0";

export const solidesSupabase = createClient(SOLIDES_SUPABASE_URL, SOLIDES_SUPABASE_KEY);
