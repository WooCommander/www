import { supabase } from '../../../shared/api/supabase';
import { questions as staticQuestions } from '../../../data/questions';
import { handleApiError } from '../../../shared/utils/errorHandler';
import { NotificationService } from '../../../shared/services/NotificationService';

export const AdminService = {
    /**
     * Reads questions from questions.ts and inserts them into Supabase.
     */
    async migrateQuestionsFromCode() {
        try {
            const payload = staticQuestions.map(q => ({
                // We let Supabase generate a new UUID for 'id' if needed, OR we use the existing number id cast to string if we want to keep them.
                // Better to use the existing ID to avoid duplicates if we run this twice, STRICTLY IF the column allows it.
                // However, likely the DB expects UUID. Let's assume we map 'id' -> 'legacy_id' or just ignore it and let DB create UUID.
                // For this MVP, let's try to pass the rest of the fields.

                title: q.title,
                answer: q.answer,
                category: q.category,
                difficulty: q.difficulty,
                // Ensure options are JSON
                options: q.options ? JSON.stringify(q.options) : null,
                type: q.type || 'input',
                code: q.code || null
            }));

            // Batch insert
            const { error, count } = await supabase.from('questions').insert(payload).select();

            if (error) throw error;

            NotificationService.success(`Успешно мигрировано ${payload.length} вопросов!`);
            return count;
        } catch (e) {
            handleApiError(e, 'Ошибка миграции вопросов');
            throw e;
        }
    },

    async getAllQuestions() {
        const { data, error } = await supabase.from('questions').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async createQuestion(question: any) {
        const { error } = await supabase.from('questions').insert(question);
        if (error) throw error;
    },

    async updateQuestion(id: string, updates: any) {
        const { error } = await supabase.from('questions').update(updates).eq('id', id);
        if (error) throw error;
    },

    async deleteQuestion(id: string) {
        const { error } = await supabase.from('questions').delete().eq('id', id);
        if (error) throw error;
    },

    async deleteAllQuestions() {
        // Dangerous! For testing only.
        const { error } = await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) throw error;
    },

    async getUsers() {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) throw error;
        return data;
    },

    async toggleBan(userId: string, isBanned: boolean) {
        const { error } = await supabase.from('profiles').update({ is_banned: isBanned }).eq('id', userId);
        if (error) throw error;
    }
};
