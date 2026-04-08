import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmkyqmtbrjqhkuqpoojm.supabase.co';
const supabaseKey = 'sb_publishable_NGck7uZwFTYgtvD11-T1jQ_qmyT9OOT';

export const supabase = createClient(supabaseUrl, supabaseKey);
