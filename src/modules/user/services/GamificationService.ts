import { supabase } from '../../../shared/api/supabase';
import { NotificationService } from '../../../shared/services/NotificationService';
import { UserService } from '../../../services/UserService';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    xp_reward: number;
}

export const GamificationService = {
    async getAchievements(): Promise<Achievement[]> {
        const { data } = await supabase.from('achievements').select('*');
        return data || [];
    },

    async getUserUnlocks(userId: string): Promise<Set<string>> {
        const { data } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', userId);
        return new Set(data?.map(d => d.achievement_id) || []);
    },

    async awardXP(amount: number) {
        const user = await UserService.getUser();
        if (!user) return;

        // 1. Fetch current XP
        const { data: profile } = await supabase.from('profiles').select('xp').eq('id', user.id).single();
        const newXP = (profile?.xp || 0) + amount;

        // 2. Update XP
        const { error } = await supabase.from('profiles').update({ xp: newXP }).eq('id', user.id);

        if (!error) {
            // Optional: Check for level up? (e.g. every 1000 XP)
            const oldLevel = Math.floor((profile?.xp || 0) / 1000) + 1;
            const newLevel = Math.floor(newXP / 1000) + 1;

            if (newLevel > oldLevel) {
                NotificationService.success(`🎉 НОВЫЙ УРОВЕНЬ: ${newLevel}!`);
            }
        }
    },

    async checkAchievements(stats: { score: number, total: number, timeTaken: number }) {
        const user = await UserService.getUser();
        if (!user) return;

        const unlocks = await this.getUserUnlocks(user.id);
        const allAchievements = await this.getAchievements();

        const newUnlocks: string[] = [];

        // Condition Checkers
        const check = (id: string, condition: boolean) => {
            if (condition && !unlocks.has(id)) {
                newUnlocks.push(id);
            }
        };

        // 1. First Blood (Always true if they finished a test)
        check('first_blood', true);

        // 2. Sniper (100% Correct, min 5 questions)
        check('sniper', stats.total >= 5 && stats.score === stats.total);

        // 3. Night Owl (After 00:00 and before 06:00)
        const hour = new Date().getHours();
        check('night_owl', hour >= 0 && hour < 6);

        // 4. Grinder (Check XP - requires fetching)
        if (!unlocks.has('grinder')) {
            const { data } = await supabase.from('profiles').select('xp').eq('id', user.id).single();
            if (data && data.xp >= 1000) {
                newUnlocks.push('grinder');
            }
        }

        // Process Unlocks
        for (const id of newUnlocks) {
            await this.unlock(user.id, id, allAchievements.find(a => a.id === id));
        }

        return newUnlocks;
    },

    async unlock(userId: string, achievementId: string, info?: Achievement) {
        // Optimistic check to avoid duplicate DB calls handled by checkAchievements

        const { error } = await supabase.from('user_achievements').insert({
            user_id: userId,
            achievement_id: achievementId
        });

        if (!error) {
            if (info) {
                NotificationService.success(`🏆 Достижение: ${info.title} (+${info.xp_reward} XP)`);
                await this.awardXP(info.xp_reward);
            }
        }
    }
};
