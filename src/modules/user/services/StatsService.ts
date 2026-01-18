import { supabase } from '../../../shared/api/supabase';
// IMPORTANT: We need QuestionStore to get the "local view" count if we still want that hybrid logic.
import { QuestionStore } from '../../../services/QuestionStore';
import type { PlatformStats, TrendsData, ExamResult } from '../../../shared/types';

export const StatsService = {
    async getPlatformStats(): Promise<PlatformStats> {
        const stats: PlatformStats = {
            totalUsers: 0,
            totalQuestions: 0,
            totalTime: 0,
            totalTests: 0
        };

        try {
            // 1. Fetch Total Users
            const { count: userCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });
            stats.totalUsers = userCount || 0;

            // 2. Fetch Total Questions
            // Ensure store is initialized? It handles its own init check usually, but let's be safe.
            await QuestionStore.initialize();
            stats.totalQuestions = QuestionStore.getAllQuestions.value.length;

            // 3. Fetch Aggregate Exam Stats
            // Used for totalTests and totalTime approximation
            const { count: testsCount, data: testsData } = await supabase
                .from('exam_results')
                .select('time_taken', { count: 'exact' })
                .limit(2000); // Sample limit

            stats.totalTests = testsCount || 0;

            if (testsData) {
                const sumTime = testsData.reduce((acc, curr) => acc + (curr.time_taken || 0), 0);
                stats.totalTime = sumTime;
            }

        } catch (e) {
            console.error('Error loading platform stats', e);
        }

        return stats;
    },

    async getTrends(): Promise<TrendsData> {
        try {
            const { data: testsData } = await supabase
                .from('exam_results')
                .select('time_taken, title, score')
                .limit(2000);

            if (!testsData) return { popular: [], hardest: [] };

            const results = testsData as unknown as Partial<ExamResult>[];

            const topicStats: Record<string, { count: number, totalScore: number }> = {};

            results.forEach(r => {
                const t = r.title || 'Unknown';
                if (!topicStats[t]) topicStats[t] = { count: 0, totalScore: 0 };
                topicStats[t].count++;
                topicStats[t].totalScore += (r.score || 0);
            });

            const analyzed = Object.entries(topicStats).map(([title, stat]) => ({
                title,
                count: stat.count,
                avgScore: Math.round(stat.totalScore / stat.count)
            }));

            // Most Popular
            const popular = [...analyzed].sort((a, b) => b.count - a.count).slice(0, 5);

            // Hardest (Low Avg Score, min 3 attempts to reduce noise)
            const hardest = [...analyzed]
                .filter(a => a.count >= 1) // Lower threshold for testing, maybe increase for prod
                .sort((a, b) => a.avgScore - b.avgScore)
                .slice(0, 5);

            return { popular, hardest };
        } catch (e) {
            console.error('Error calculating trends', e);
            return { popular: [], hardest: [] };
        }
    }
};
