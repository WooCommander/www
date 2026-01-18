<script setup lang="ts">
import type { QuizTopic, QuizQuestion } from '../../../data/quiz_data';
import MainLayout from '../../../shared/layout/MainLayout.vue';

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
    <MainLayout>
        <template #content>
            <div class="topic-editor-container">
                <div class="editor-header">
                    <button class="back-link" @click="emit('back')">← Назад к темам</button>
                    <!-- <h2>{{ topic.title }}</h2> -- Moved inside header for better alignment or keep? -->
                    <!-- Actually layout might need header slot? For now stick to content. -->
                    <div class="header-title">
                        <h2>{{ topic.title }}</h2>
                    </div>
                    <button class="btn-primary" @click="emit('add-question')">+ Добавить вопрос</button>
                </div>

                <div class="questions-list">
                    <div v-for="q in topic.questions" :key="q.id" class="editor-question-card">
                        <div class="q-content">
                            <span class="q-type-badge">{{ q.type === 'input' ? '📝' : (q.type === 'single' ? '🔘' :
                                '☑️') }}</span>
                            <span class="q-text">{{ q.text }}</span>
                        </div>
                        <div class="q-actions">
                            <button class="btn-icon edit" @click="emit('edit-question', q)">✎</button>
                            <button class="btn-icon delete" @click="emit('delete-question', q.id)">🗑</button>
                        </div>
                    </div>
                    <div v-if="topic.questions.length === 0" class="empty-state">
                        В этой теме пока нет вопросов.
                    </div>
                </div>
            </div>
        </template>
    </MainLayout>
</template>

<style scoped lang="scss">
.topic-editor-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 24px 16px;
    width: 100%;
}

.editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;

    h2 {
        margin: 0;
        font-size: 1.5rem;
    }
}

.header-title {
    flex: 1;
    text-align: center;

    @media (max-width: 600px) {
        order: -1;
        width: 100%;
        text-align: left;
    }
}

.back-link {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 8px 0;

    &:hover {
        color: var(--text-primary);
        text-decoration: underline;
    }
}

.btn-primary {
    background: var(--accent-primary);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, background 0.2s;

    &:hover {
        transform: translateY(-2px);
        filter: brightness(1.1);
    }
}

.questions-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.editor-question-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    padding: 20px;
    border-radius: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s;

    &:hover {
        border-color: var(--accent-primary);
        transform: translateX(4px);
    }
}

.q-content {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    overflow: hidden;
}

.q-type-badge {
    font-size: 1.5rem;
    background: var(--bg-secondary);
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
}

.q-text {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 1rem;
}

.q-actions {
    display: flex;
    gap: 8px;
    margin-left: 16px;
}

.btn-icon {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 1.1rem;
    padding: 8px;
    border-radius: 8px;
    opacity: 0.7;
    transition: all 0.2s;
    color: var(--text-secondary);

    &:hover {
        opacity: 1;
        background: var(--bg-secondary);
    }

    &.edit:hover {
        color: var(--accent-primary);
    }

    &.delete:hover {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
    }
}

.empty-state {
    text-align: center;
    padding: 40px;
    color: var(--text-secondary);
    background: var(--bg-secondary);
    border-radius: 16px;
    border: 1px dashed var(--border-color);
}
</style>
