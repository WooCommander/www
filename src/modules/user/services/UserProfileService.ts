import { supabase } from '../../../shared/api/supabase';
import type { UserProfile, LeaderboardEntry, ExamResult } from '../../../shared/types';

export const UserProfileService = {
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
        return data as UserProfile;
    },

    async updateProfile(updates: Partial<UserProfile> & { id: string }): Promise<{ error: any }> {
        const { error } = await supabase.from('profiles').upsert(updates);
        return { error };
    },

    async getLeaderboard(limit: number = 5): Promise<LeaderboardEntry[]> {
        const { data: leaderboardData, error } = await supabase
            .from('exam_results')
            .select('*');

        if (error || !leaderboardData) {
            console.error('Error fetching leaderboard:', error);
            return [];
        }

        const results = leaderboardData as ExamResult[];

        // Process for "Best Unique Scores" aggregation (Arcade Mode logic)
        const userIds = [...new Set(results.map(r => r.user_id))];

        let userMap: Record<string, string> = {};
        if (userIds.length > 0) {
            const { data: profiles } = await supabase.from('profiles').select('id, username').in('id', userIds);
            userMap = profiles?.reduce((acc: any, p: any) => ({ ...acc, [p.id]: p.username }), {}) || {};
        }

        const users: Record<string, { username: string; bestRuns: Record<string, { score: number; timeTaken: number }> }> = {};

        results.forEach(r => {
            const uId = r.user_id;
            if (!users[uId]) users[uId] = { username: userMap[uId] || 'User', bestRuns: {} };

            const currentBest = users[uId].bestRuns[r.title];
            if (!currentBest || r.score > currentBest.score || (r.score === currentBest.score && r.time_taken < currentBest.timeTaken)) {
                users[uId].bestRuns[r.title] = { score: r.correct || 0, timeTaken: r.time_taken || 0 };
            }
        });

        return Object.values(users).map(u => {
            let totalScore = 0;
            Object.values(u.bestRuns).forEach(run => totalScore += run.score);
            return { username: u.username, totalScore };
        }).sort((a, b) => b.totalScore - a.totalScore).slice(0, limit);
    }
};
