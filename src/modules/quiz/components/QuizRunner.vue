<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import type { QuizTopic, QuizQuestion } from '../../../data/quiz_data';
import { QuestionStore } from '../../../services/QuestionStore';

const props = defineProps<{
    currentQuiz: QuizTopic;
    activeQuestion: QuizQuestion;
    currentQuestionIndex: number;
    progress: number;
    formattedTime: string;
    timeRemaining: number;
    isShaking: boolean;
    currentInputAnswer: string;
    userAnswers: Record<string, any>; // questionId -> answer
}>();

const emit = defineEmits<{
    (e: 'go-back'): void;
    (e: 'update:currentInputAnswer', value: string): void;
    (e: 'select-option', optionId: string): void;
    (e: 'next-question'): void;
    (e: 'prev-question'): void;
}>();

// --- Bookmarks ---
const isFav = computed(() => QuestionStore.isFavorite(props.activeQuestion.id.toString()));
const toggleFav = () => QuestionStore.toggleFavorite(props.activeQuestion.id.toString());

// --- Swipe & Navigation ---
const touchStartX = ref(0);
const touchEndX = ref(0);
const SWIPE_THRESHOLD = 50;
const transitionName = ref('slide-left');

// Watch index to determine direction (for non-swipe nav)
watch(() => props.currentQuestionIndex, (newVal, oldVal) => {
    transitionName.value = newVal > oldVal ? 'slide-left' : 'slide-right';
});

const handleTouchStart = (e: TouchEvent) => {
    const touch = e.changedTouches[0];
    if (touch) {
        touchStartX.value = touch.screenX;
    }
};

const handleTouchEnd = (e: TouchEvent) => {
    const touch = e.changedTouches[0];
    if (touch) {
        touchEndX.value = touch.screenX;
        handleSwipe();
    }
};

const handleSwipe = () => {
    const diff = touchStartX.value - touchEndX.value;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
        if (diff > 0) {
            // Swipe Left -> Next
            emit('next-question');
        } else {
            // Swipe Right -> Prev
            emit('prev-question');
        }
    }
};

const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') emit('next-question');
    if (e.key === 'ArrowLeft') emit('prev-question');
};

onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
});

const isOptionSelected = (questionId: string, optionId: string, userAnswers: any) => {
    const answer = userAnswers[questionId];
    if (Array.isArray(answer)) {
        return answer.includes(optionId);
    }
    return answer === optionId;
};
</script>

<template>
    <div class="active-quiz">
        <div class="quiz-header">
            <div class="header-top">
                <button class="back-link" @click="emit('go-back')">← Выход</button>
                <div class="header-actions">
                    <button class="fav-btn" :class="{ active: isFav }" @click="toggleFav">
                        {{ isFav ? '★' : '☆' }}
                    </button>
                    <div v-if="currentQuiz.id === 'exam-full'" class="exam-timer"
                        :class="{ critical: timeRemaining < 300 }">
                        ⏱️ {{ formattedTime }}
                    </div>
                </div>
            </div>

            <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
            <span class="progress-text">Вопрос {{ currentQuestionIndex + 1 }} из {{ currentQuiz.questions.length
                }}</span>
        </div>

        <Transition :name="transitionName" mode="out-in">
            <div class="question-card-lg" :class="{ shake: isShaking }" :key="activeQuestion.id"
                @touchstart="handleTouchStart" @touchend="handleTouchEnd">
                <div class="question-text">{{ activeQuestion.text }}</div>

                <!-- Code Snippet -->
                <div v-if="activeQuestion.codeSnippet" class="code-snippet">
                    <pre><code>{{ activeQuestion.codeSnippet }}</code></pre>
                </div>

                <div class="options-list">
                    <!-- Single Choice -->
                    <template v-if="activeQuestion.type === 'single'">
                        <div v-for="opt in activeQuestion.options" :key="opt.id" class="option-item"
                            :class="{ selected: isOptionSelected(activeQuestion.id, opt.id, userAnswers) }"
                            @click="emit('select-option', opt.id)">
                            <div class="radio-circle"></div>
                            <span>{{ opt.text }}</span>
                        </div>
                    </template>

                    <!-- Multiple Choice -->
                    <template v-if="activeQuestion.type === 'multiple'">
                        <div v-for="opt in activeQuestion.options" :key="opt.id" class="option-item"
                            :class="{ selected: isOptionSelected(activeQuestion.id, opt.id, userAnswers) }"
                            @click="emit('select-option', opt.id)">
                            <div class="checkbox-square"></div>
                            <span>{{ opt.text }}</span>
                        </div>
                    </template>

                    <!-- Input -->
                    <template v-if="activeQuestion.type === 'input'">
                        <input :value="currentInputAnswer"
                            @input="emit('update:currentInputAnswer', ($event.target as HTMLInputElement).value)"
                            type="text" placeholder="Введите ваш ответ..." class="quiz-input"
                            @keyup.enter="emit('next-question')">
                    </template>
                </div>

                <button class="next-btn"
                    :disabled="activeQuestion.type !== 'input' && !userAnswers[activeQuestion.id] && currentInputAnswer === ''"
                    @click="emit('next-question')">
                    {{ currentQuestionIndex === currentQuiz.questions.length - 1 ? 'Завершить' : 'Далее' }}
                </button>
            </div>
        </Transition>
    </div>
</template>

<style scoped lang="scss">
.quiz-header {
    margin-bottom: var(--spacing-xl);
}

.header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.fav-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
    color: var(--text-secondary);
    transition: all 0.2s;
    padding: 0 4px;
    line-height: 1;
}

.fav-btn:hover {
    transform: scale(1.1);
    color: #fbbf24;
}

.fav-btn.active {
    color: #fbbf24;
}

.back-link {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    /* margin-bottom: var(--spacing-md); removed margin, handled by header flex */
    font-size: 0.9rem;
}

.exam-timer {
    font-family: 'Fira Code', monospace;
    font-size: 1.2rem;
    color: var(--text-primary);

    &.critical {
        color: #ef4444;
        animation: pulse 1s infinite;
    }
}

.progress-bar {
    height: 8px;
    background: var(--bg-secondary);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
}

.progress-fill {
    height: 100%;
    background: var(--accent-primary);
    transition: width 0.3s ease;
}

.progress-text {
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.question-text {
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-md);
    white-space: pre-wrap;
}

.code-snippet {
    background: #1e293b;
    padding: var(--spacing-md);
    border-radius: 8px;
    margin-bottom: var(--spacing-lg);
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow-x: auto;

    pre {
        margin: 0;
        font-family: 'Fira Code', monospace;
        color: #e2e8f0;
        font-size: 0.95rem;
    }
}

.options-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.option-item {
    display: flex;
    align-items: center;
    padding: 16px;
    background: var(--bg-secondary);
    border: 2px solid transparent;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;

    &:hover {
        background: var(--bg-card);
        border-color: rgba(56, 189, 248, 0.3);
    }

    &.selected {
        border-color: var(--accent-primary);
        background: rgba(56, 189, 248, 0.1);

        .radio-circle::after {
            content: '';
            position: absolute;
            top: 3px;
            left: 3px;
            width: 10px;
            height: 10px;
            background: var(--accent-primary);
            border-radius: 50%;
        }

        .checkbox-square {
            background: var(--accent-primary);
            border-color: var(--accent-primary);
        }
    }
}

.radio-circle,
.checkbox-square {
    width: 20px;
    height: 20px;
    border: 2px solid var(--border-color);
    margin-right: 12px;
    position: relative;
    flex-shrink: 0;
}

.radio-circle {
    border-radius: 50%;
}

.checkbox-square {
    border-radius: 4px;
}

.quiz-input {
    width: 100%;
    padding: 16px;
    font-size: 1.1rem;
    background: var(--bg-secondary);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    color: var(--text-primary);

    &:focus {
        outline: none;
        border-color: var(--accent-primary);
    }
}

.next-btn {
    margin-top: var(--spacing-xl);
    padding: 16px 32px;
    background: var(--accent-primary);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    float: right;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

.shake {
    animation: shake 0.5s cubic-bezier(.36, .07, .19, .97) both;
}

@keyframes shake {

    10%,
    90% {
        transform: translate3d(-1px, 0, 0);
    }

    20%,
    80% {
        transform: translate3d(2px, 0, 0);
    }

    30%,
    50%,
    70% {
        transform: translate3d(-4px, 0, 0);
    }

    40%,
    60% {
        transform: translate3d(4px, 0, 0);
    }
}

@keyframes pulse {
    0% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }

    100% {
        opacity: 1;
    }
}

/* Transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
    transition: all 0.3s ease-out;
}

.slide-left-enter-from {
    opacity: 0;
    transform: translateX(30px);
}

.slide-left-leave-to {
    opacity: 0;
    transform: translateX(-30px);
}

.slide-right-enter-from {
    opacity: 0;
    transform: translateX(-30px);
}

.slide-right-leave-to {
    opacity: 0;
    transform: translateX(30px);
}
</style>
