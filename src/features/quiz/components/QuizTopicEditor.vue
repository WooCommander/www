<script setup lang="ts">
import type { QuizTopic, QuizQuestion } from '../../../data/quiz_data';

defineProps<{
    topic: QuizTopic;
}>();

const emit = defineEmits<{
    (e: 'back'): void;
    (e: 'add-question'): void;
    (e: 'edit-question', q: QuizQuestion): void;
    (e: 'delete-question', id: string): void;
}>();
</script>

<template>
    <div class="topic-editor">
        <div class="editor-header">
            <button class="back-link" @click="emit('back')">← Назад к темам</button>
            <h2>{{ topic.title }}</h2>
            <button class="btn-primary" @click="emit('add-question')">+ Добавить вопрос</button>
        </div>

        <div class="questions-list">
            <div v-for="q in topic.questions" :key="q.id" class="editor-question-card">
                <div class="q-content">
                    <span class="q-type-badge">{{ q.type === 'input' ? '📝' : (q.type === 'single' ? '🔘' : '☑️')
                    }}</span>
                    <span class="q-text">{{ q.text }}</span>
                </div>
                <div class="q-actions">
                    <button class="btn-icon edit" @click="emit('edit-question', q)">✎</button>
                    <button class="btn-icon delete" @click="emit('delete-question', q.id)">🗑</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.back-link {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.9rem;
}

.btn-primary {
    background: var(--accent-primary);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
}

.questions-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.editor-question-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    padding: 16px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.q-content {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
}

.q-type-badge {
    font-size: 1.2rem;
}

.q-text {
    font-weight: 500;
}

.q-actions {
    display: flex;
    gap: 8px;
}

.btn-icon {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 4px;
    opacity: 0.7;
    transition: opacity 0.2s;

    &:hover {
        opacity: 1;
    }

    &.edit:hover {
        color: var(--accent-primary);
    }

    &.delete:hover {
        color: #ef4444;
    }
}
</style>
