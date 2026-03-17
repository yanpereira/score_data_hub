import { createClient } from '@supabase/supabase-js';

const EXTERNAL_SUPABASE_URL = "https://yuddpeadtlfwtceoaqpm.supabase.co";
const EXTERNAL_SUPABASE_KEY = "sb_publishable_EI5wiBQMToMEDY-lnbkMow_xxUrIrbI";

export const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_KEY);
