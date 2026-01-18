<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import MainLayout from '../../../shared/layout/MainLayout.vue';
import { StatsService } from '../../user/services/StatsService';
import { QuestionStore } from '../../../services/QuestionStore';
import type { Question } from '../../../shared/types';

const router = useRouter();
const loading = ref(true);
const questions = ref<Question[]>([]);
const currentIndex = ref(0);
const isFlipped = ref(false);

const activeQuestion = computed(() => questions.value[currentIndex.value]);

onMounted(async () => {
    loading.value = true;
    try {
        // 1. Try to get trends
        const trends = await StatsService.getTrends();

        if (trends.popular && trends.popular.length >= 10) {
            // Map trend titles back to real questions
            // This is slightly inefficient but ensures we have full question data
            const allQs = QuestionStore.getAllQuestions.value;
            questions.value = trends.popular
                .map(t => allQs.find(q => q.title === t.title))
                .filter(q => !!q) as Question[];
        }

        // 2. Fallback if not enough trends: Random Mix
        if (questions.value.length < 20) {
            const allQs = QuestionStore.getAllQuestions.value;
            const needed = 20 - questions.value.length;
            const shuffled = [...allQs].sort(() => 0.5 - Math.random());

            // Avoid duplicates
            const existingIds = new Set(questions.value.map(q => q.id));
            const extra = shuffled.filter(q => !existingIds.has(q.id)).slice(0, needed);

            questions.value = [...questions.value, ...extra];
        }

        // Shuffle the final mix for variety
        questions.value = questions.value.sort(() => 0.5 - Math.random());

    } catch (e) {
        console.error('Error loading panic questions', e);
    } finally {
        loading.value = false;
    }
});

const flipCard = () => {
    isFlipped.value = !isFlipped.value;
};

const nextCard = () => {
    if (currentIndex.value < questions.value.length - 1) {
        isFlipped.value = false;
        setTimeout(() => {
            currentIndex.value++;
        }, 150); // Small delay for animation if needed
    } else {
        router.push('/');
    }
};

const prevCard = () => {
    if (currentIndex.value > 0) {
        isFlipped.value = false;
        setTimeout(() => {
            currentIndex.value--;
        }, 150);
    }
};

const progressWidth = computed(() => {
    return ((currentIndex.value + 1) / questions.value.length) * 100 + '%';
});
</script>

<template>
    <MainLayout fixed-height>
        <template #header>
            <div class="panic-header">
                <button class="close-btn" @click="router.push('/')">✕ Выход</button>
                <div class="header-title">
                    <span class="fire">🔥</span>
                    <span>Panic Mode</span>
                </div>
                <div class="counter">{{ currentIndex + 1 }} / {{ questions.length }}</div>
            </div>
            <div class="progress-bar">
                <div class="fill" :style="{ width: progressWidth }"></div>
            </div>
        </template>

        <template #content>
            <div class="panic-container">
                <div v-if="loading" class="loading">
                    <div class="spinner"></div>
                    <p>Собираем самое важное...</p>
                </div>

                <div v-else-if="activeQuestion" class="card-scene">
                    <div class="flashcard" :class="{ flipped: isFlipped }" @click="flipCard">
                        <div class="card-face front">
                            <span class="hint">Нажми, чтобы увидеть ответ</span>
                            <div class="q-content">
                                <h3>{{ activeQuestion.title }}</h3>
                                <div class="tags">
                                    <span class="tag">{{ activeQuestion.category }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="card-face back">
                            <span class="hint">Ответ</span>
                            <div class="a-content">
                                <p>{{ activeQuestion.answer }}</p>
                                <div v-if="activeQuestion.options && activeQuestion.options.length"
                                    class="options-preview">
                                    <ul>
                                        <li v-for="opt in activeQuestion.options" :key="opt.id"
                                            :class="{ correct: opt.isCorrect }">
                                            {{ opt.text }}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="controls">
                        <button class="nav-btn prev" :disabled="currentIndex === 0" @click.stop="prevCard">←</button>
                        <button class="flip-btn-mobile" @click.stop="flipCard">Показать ответ</button>
                        <button class="nav-btn next" @click.stop="nextCard">
                            {{ currentIndex === questions.length - 1 ? 'Финиш' : '→' }}
                        </button>
                    </div>
                </div>
            </div>
        </template>
    </MainLayout>
</template>

<style scoped lang="scss">
.panic-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
}

.header-title {
    font-weight: 800;
    font-size: 1.2rem;
    color: #ef4444;
    /* Panic Red */
    display: flex;
    align-items: center;
    gap: 8px;

    .fire {
        font-size: 1.5rem;
        animation: pulse 1.5s infinite;
    }
}

.close-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-weight: 600;
}

.counter {
    font-family: 'Fira Code', monospace;
    font-weight: 700;
    color: var(--text-primary);
}

.progress-bar {
    height: 4px;
    background: var(--bg-secondary);
    width: 100%;
    margin-top: 10px;
    border-radius: 2px;
}

.fill {
    height: 100%;
    background: #ef4444;
    transition: width 0.3s ease;
}

.panic-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    perspective: 1000px;
    padding: 20px;
}

.card-scene {
    width: 100%;
    max-width: 600px;
    height: 400px;
    /* Base height */
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 30px;

    @media(max-height: 700px) {
        height: 300px;
    }
}

.flashcard {
    width: 100%;
    flex: 1;
    position: relative;
    transition: transform 0.6s;
    transform-style: preserve-3d;
    cursor: pointer;

    &.flipped {
        transform: rotateY(180deg);
    }
}

.card-face {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 24px;
    padding: 30px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    box-shadow: var(--shadow-lg);

    &.front {
        border-bottom: 6px solid var(--accent-primary);
    }

    &.back {
        transform: rotateY(180deg);
        background: #1e293b;
        /* Slightly darker for contrast */
        border-bottom: 6px solid #22c55e;
        color: #fff;
    }

    .hint {
        position: absolute;
        top: 20px;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        opacity: 0.5;
    }
}

.q-content h3 {
    font-size: 1.8rem;
    line-height: 1.3;
    margin-bottom: 20px;

    @media(max-width: 600px) {
        font-size: 1.4rem;
    }
}

.a-content p {
    font-size: 1.2rem;
    line-height: 1.5;
    white-space: pre-wrap;
}

.tags {
    margin-top: 10px;
}

.tag {
    background: var(--bg-secondary);
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.options-preview {
    margin-top: 20px;
    text-align: left;
    width: 100%;
    font-size: 0.9rem;

    ul {
        list-style: none;
        padding: 0;
    }

    li {
        padding: 4px 0;
        opacity: 0.7;

        &.correct {
            color: #4ade80;
            font-weight: bold;
            opacity: 1;
        }
    }
}

.controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
}

.nav-btn {
    background: var(--bg-secondary);
    border: none;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-primary);
    transition: transform 0.2s;

    &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }

    &:not(:disabled):hover {
        transform: scale(1.1);
        background: var(--accent-primary);
        color: white;
    }

    &.next {
        background: #ef4444;
        /* Panic Next */
        color: white;
    }
}

.flip-btn-mobile {
    display: none;
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    padding: 10px 20px;
    border-radius: 20px;

    @media(max-width: 768px) {
        display: block;
    }
}

@keyframes pulse {
    0% {
        transform: scale(1);
        opacity: 1;
    }

    50% {
        transform: scale(1.2);
        opacity: 0.8;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    color: var(--text-secondary);
}
</style>
