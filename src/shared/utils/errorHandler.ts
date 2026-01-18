import { NotificationService } from '../services/NotificationService';
import { supabase } from '../api/supabase';

export const handleApiError = (error: any, fallbackMessage: string = 'Произошла ошибка') => {
    console.error('API Error:', error);

    // 1. Check for specific Supabase/HTTP codes
    const status = error?.status || error?.code;
    const msg = error?.message || error?.error_description || fallbackMessage;

    // 401: Unauthorized -> Likely session expired
    if (status === 401 || msg.includes('JWT')) {
        NotificationService.error('Сессия истекла. Пожалуйста, войдите снова.');
        supabase.auth.signOut();
        // Optionally redirect to /auth
        // window.location.href = '/auth'; 
        return;
    }

    // 500: Server Errors
    if (status >= 500) {
        NotificationService.error('Ошибка сервера. Попробуйте позже.');
        return;
    }

    // Network Errors
    if (msg.includes('network') || msg.includes('fetch')) {
        NotificationService.error('Нет соединения с интернетом.');
        return;
    }

    // Generic display
    NotificationService.error(msg);
};
