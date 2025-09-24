import { createClient } from '@supabase/supabase-js';

let supabase = null;

export function initializeSupabase() {
    if (!supabase) {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase configuration:');
            console.error('SUPABASE_URL:', supabaseUrl);
            console.error('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '[HIDDEN]' : 'undefined');
            console.error('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '[HIDDEN]' : 'undefined');
            throw new Error('Supabase configuration is incomplete');
        }

        supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'hackathon' }
        });
        console.log('✅ Supabase client initialized successfully with hackathon schema');
    }
    return supabase;
}

export function getSupabase() {
    if (!supabase) {
        throw new Error('Supabase client not initialized. Call initializeSupabase() first.');
    }
    return supabase;
}