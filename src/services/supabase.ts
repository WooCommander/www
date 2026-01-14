import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project details
// You can find these in Project Settings -> API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://piudpsetgfmdxpnavheu.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ypbZYnnAq0_Q9f9AY8czWw__pZ2fxG4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface UserProfile {
    id: string; // uuid
    username?: string;
    xp: number;
    avatar_url?: string;
}
