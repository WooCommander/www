<script setup lang="ts">
import type { QuizTopic, QuizQuestion } from '../../../data/quiz_data';

const props = defineProps<{
    currentQuiz: QuizTopic;
    scoreData: { correct: number; total: number; score: number };
    userAnswers: Record<string, any>;
}>();

const emit = defineEmits<{
    (e: 'retry'): void;
    (e: 'go-back'): void;
}>();

const isCorrect = (q: QuizQuestion) => {
    const userAnswer = props.userAnswers[q.id];
    if (q.type === 'single') {
        const correctOpt = q.options?.find(o => o.isCorrect);
        return correctOpt && userAnswer === correctOpt.id;
    } else if (q.type === 'multiple') {
        const correctOpts = q.options?.filter(o => o.isCorrect).map(o => o.id) || [];
        return Array.isArray(userAnswer) &&
            userAnswer.length === correctOpts.length &&
            userAnswer.every(id => correctOpts.includes(id));
    } else if (q.type === 'input') {
        const correctStr = (q.correctAnswer as string).toLowerCase().trim();
        const userStr = (userAnswer as string || '').toLowerCase().trim();
        return correctStr === userStr;
    }
    return false;
};

const getCorrectAnswerText = (q: QuizQuestion) => {
    if (q.type === 'input') return q.correctAnswer;
    if (q.type === 'single') return q.options?.find(o => o.isCorrect)?.text;
    if (q.type === 'multiple') return q.options?.filter(o => o.isCorrect).map(o => o.text).join(', ');
    return '';
};
</script>

<template>
    <div class="results-view">
        <div class="score-card">
            <h2>Результат</h2>
            <div class="score-circle" :class="{
                good: scoreData.score >= 80,
                avg: scoreData.score >= 50 && scoreData.score < 80,
                bad: scoreData.score < 50
            }">
                {{ scoreData.score }}%
            </div>
            <p>{{ scoreData.correct }} из {{ scoreData.total }} верно</p>
            <div class="action-buttons">
                <button class="retry-btn" @click="emit('retry')">Попробовать снова</button>
                <button class="back-btn" @click="emit('go-back')">К списку тем</button>
            </div>
        </div>

        <div class="review-list">
            <div v-for="q in currentQuiz.questions" :key="q.id" class="review-item"
                :class="{ incorrect: !isCorrect(q) }">
                <div class="review-header">
                    <span class="status-icon">{{ isCorrect(q) ? '✅' : '❌' }}</span>
                    <span class="review-question">{{ q.text }}</span>
                </div>
                <div v-if="!isCorrect(q)" class="review-details">
                    <p class="correct-answer">Правильный ответ: <strong>{{ getCorrectAnswerText(q) }}</strong></p>
                    <p v-if="q.explanation" class="explanation">{{ q.explanation }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.score-card {
    text-align: center;
    background: var(--bg-card);
    padding: var(--spacing-xl);
    border-radius: 16px;
    margin-bottom: var(--spacing-xl);
    border: 1px solid var(--border-color);
}

.score-circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: var(--bg-secondary);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2.5rem;
    font-weight: 700;
    margin: 20px auto;
    border: 8px solid currentColor;

    &.good {
        color: var(--accent-success);
    }

    &.avg {
        color: var(--accent-warning);
    }

    &.bad {
        color: #ef4444;
    }
}

.action-buttons {
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
    margin-top: 20px;
}

.retry-btn {
    background: var(--accent-primary);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
}

.back-btn {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
}

.review-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.review-item {
    background: var(--bg-card);
    padding: 16px;
    border-radius: 8px;
    border: 1px solid var(--border-color);

    &.incorrect {
        border-color: rgba(239, 68, 68, 0.3);
        background: rgba(239, 68, 68, 0.05);
    }
}

.review-header {
    display: flex;
    gap: 12px;
    font-weight: 500;
}

.review-details {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    font-size: 0.95rem;
    color: var(--text-secondary);
}

.correct-answer {
    color: var(--accent-success);
    margin-bottom: 4px;
}

@media (max-width: 640px) {
    .score-card {
        padding: var(--spacing-md);
        margin-bottom: var(--spacing-lg);
    }

    .score-circle {
        width: 100px;
        height: 100px;
        font-size: 2rem;
        margin: 16px auto;
        border-width: 6px;
    }

    h2 {
        font-size: 1.5rem;
    }

    .action-buttons {
        flex-direction: column;
        width: 100%;
    }

    .retry-btn,
    .back-btn {
        width: 100%;
    }
}
</style>
