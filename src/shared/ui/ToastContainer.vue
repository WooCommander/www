<script setup lang="ts">
import { NotificationService } from '../services/NotificationService';

const notifications = NotificationService.state;

const remove = (id: number) => {
    NotificationService.remove(id);
};
</script>

<template>
    <div class="toast-container">
        <transition-group name="toast">
            <div v-for="note in notifications" :key="note.id" class="toast" :class="note.type" @click="remove(note.id)">
                <div class="icon">
                    <span v-if="note.type === 'success'">✅</span>
                    <span v-else-if="note.type === 'error'">❌</span>
                    <span v-else-if="note.type === 'warning'">⚠️</span>
                    <span v-else>ℹ️</span>
                </div>
                <div class="message">{{ note.message }}</div>
            </div>
        </transition-group>
    </div>
</template>

<style scoped lang="scss">
.toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
    /* Let clicks pass through empty space */
}

.toast {
    pointer-events: auto;
    min-width: 300px;
    max-width: 400px;
    padding: 12px 16px;
    border-radius: 8px;
    background: var(--bg-card);
    color: var(--text-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
    border-left: 4px solid transparent;
    font-size: 0.95rem;

    &.success {
        border-left-color: #22c55e;
        background: #f0fdf4;
        color: #15803d;
    }

    &.error {
        border-left-color: #ef4444;
        background: #fef2f2;
        color: #b91c1c;
    }

    &.warning {
        border-left-color: #f59e0b;
        background: #fffbeb;
        color: #b45309;
    }

    &.info {
        border-left-color: #3b82f6;
        background: #eff6ff;
        color: #1d4ed8;
    }
}

/* Dark Mode Overrides (Assumes .light-theme usually, but checking standard vars) */
:global(body:not(.light-theme)) .toast {
    background: #1e293b;
    color: #e2e8f0;

    &.success {
        background: rgba(34, 197, 94, 0.1);
        color: #4ade80;
    }

    &.error {
        background: rgba(239, 68, 68, 0.1);
        color: #f87171;
    }

    &.warning {
        background: rgba(245, 158, 11, 0.1);
        color: #fbbf24;
    }

    &.info {
        background: rgba(59, 130, 246, 0.1);
        color: #60a5fa;
    }
}

/* Animations */
.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}

.toast-enter-from {
    opacity: 0;
    transform: translateX(30px);
}

.toast-leave-to {
    opacity: 0;
    transform: translateX(30px);
}
</style>
