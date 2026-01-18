import { supabase } from '../../../shared/api/supabase';
import { handleApiError } from '../../../shared/utils/errorHandler';

export interface Course {
    id: string;
    title: string;
    description: string | null;
    icon: string;
    created_at?: string;
}

export const CourseService = {
    async getAllCourses() {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .order('title');

            if (error) throw error;
            return data as Course[];
        } catch (e) {
            handleApiError(e, 'Ошибка загрузки курсов');
            return [];
        }
    },

    async getCourseById(id: string) {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data as Course;
        } catch (e) {
            handleApiError(e, 'Ошибка загрузки курса');
            return null;
        }
    },

    async createCourse(course: Omit<Course, 'id' | 'created_at'>) {
        try {
            const { data, error } = await supabase
                .from('courses')
                .insert(course)
                .select()
                .single();

            if (error) throw error;
            return data as Course;
        } catch (e) {
            handleApiError(e, 'Ошибка создания курса');
            throw e;
        }
    },

    async updateCourse(id: string, updates: Partial<Course>) {
        try {
            const { data, error } = await supabase
                .from('courses')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data as Course;
        } catch (e) {
            handleApiError(e, 'Ошибка обновления курса');
            throw e;
        }
    },

    async deleteCourse(id: string) {
        try {
            const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (e) {
            handleApiError(e, 'Ошибка удаления курса');
            throw e;
        }
    }
};
