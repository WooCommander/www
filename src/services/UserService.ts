import { supabase, type UserProfile } from './supabase';
import type { Session, User } from '@supabase/supabase-js';

export const UserService = {
    async getSession(): Promise<Session | null> {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    async getUser(): Promise<User | null> {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    async getProfile(userId: string): Promise<UserProfile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
        return data;
    },

    async updateProfile(updates: Partial<UserProfile> & { id: string }): Promise<{ error: any }> {
        const { error } = await supabase.from('profiles').upsert(updates);
        return { error };
    },

    async signOut(): Promise<{ error: any }> {
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    async getLeaderboard(limit: number = 5): Promise<any[]> {
        const { data: leaderboardData, error } = await supabase
            .from('exam_results')
            .select('*');

        if (error || !leaderboardData) {
            console.error('Error fetching leaderboard:', error);
            return [];
        }

        // Process for "Best Unique Scores" aggregation (Arcade Mode logic)
        const userIds = [...new Set(leaderboardData.map(r => r.user_id))];
        
        let userMap: Record<string, string> = {};
        if (userIds.length > 0) {
            const { data: profiles } = await supabase.from('profiles').select('id, username').in('id', userIds);
             userMap = profiles?.reduce((acc, p) => ({ ...acc, [p.id]: p.username }), {}) || {};
        }

        const users: Record<string, any> = {};
        leaderboardData.forEach(r => {
            const uId = r.user_id;
            if (!users[uId]) users[uId] = { username: userMap[uId] || 'User', bestRuns: {} };

            const currentBest = users[uId].bestRuns[r.title];
            if (!currentBest || r.score > currentBest.score || (r.score === currentBest.score && r.time_taken < currentBest.timeTaken)) {
                users[uId].bestRuns[r.title] = { score: r.correct || 0, timeTaken: r.time_taken || 0 };
            }
        });

        const ranked = Object.values(users).map((u: any) => {
            let totalScore = 0;
            Object.values(u.bestRuns).forEach((run: any) => totalScore += run.score);
            return { username: u.username, totalScore };
        }).sort((a, b) => b.totalScore - a.totalScore).slice(0, limit);

        return ranked;
    }
};
