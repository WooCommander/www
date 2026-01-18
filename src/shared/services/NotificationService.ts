import { ref } from 'vue';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
    id: number;
    message: string;
    type: NotificationType;
    duration?: number;
}

const notifications = ref<Notification[]>([]);
let nextId = 1;

export const NotificationService = {
    state: notifications,

    show(message: string, type: NotificationType = 'info', duration: number = 3000) {
        const id = nextId++;
        notifications.value.push({ id, message, type, duration });

        if (duration > 0) {
            setTimeout(() => {
                this.remove(id);
            }, duration);
        }
    },

    success(message: string, duration?: number) {
        this.show(message, 'success', duration);
    },

    error(message: string, duration: number = 5000) {
        this.show(message, 'error', duration);
    },

    info(message: string, duration?: number) {
        this.show(message, 'info', duration);
    },

    warning(message: string, duration?: number) {
        this.show(message, 'warning', duration);
    },

    remove(id: number) {
        const index = notifications.value.findIndex(n => n.id === id);
        if (index !== -1) {
            notifications.value.splice(index, 1);
        }
    }
};
