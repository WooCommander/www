import { supabase } from '../../../shared/api/supabase';
import type { Session, User } from '@supabase/supabase-js';

export const AuthService = {
    async getSession(): Promise<Session | null> {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    async getUser(): Promise<User | null> {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    async signIn(email: string, password: string): Promise<{ error: any }> {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        return { error };
    },

    async signUp(email: string, password: string): Promise<{ error: any }> {
        const { error } = await supabase.auth.signUp({
            email,
            password
        });
        return { error };
    },

    async signOut(): Promise<{ error: any }> {
        const { error } = await supabase.auth.signOut();
        return { error };
    }
};
