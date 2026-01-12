<script setup lang="ts">
import { ref, computed } from 'vue';
import { quizzes, type QuizTopic, type QuizQuestion } from '../data/quiz_data';

const currentQuiz = ref<QuizTopic | null>(null);
const currentQuestionIndex = ref(0);
const userAnswers = ref<Record<string, any>>({}); // questionId -> answer
const showResults = ref(false);
const currentInputAnswer = ref('');

const activeQuestion = computed(() => {
  if (!currentQuiz.value) return null;
  return currentQuiz.value.questions[currentQuestionIndex.value];
});

const progress = computed(() => {
  if (!currentQuiz.value) return 0;
  return ((currentQuestionIndex.value) / currentQuiz.value.questions.length) * 100;
});

const startQuiz = (quiz: QuizTopic) => {
  currentQuiz.value = quiz;
  currentQuestionIndex.value = 0;
  userAnswers.value = {};
  showResults.value = false;
  currentInputAnswer.value = '';
};

const selectOption = (optionId: string) => {
  if (!activeQuestion.value) return;
  
  if (activeQuestion.value.type === 'single') {
    userAnswers.value[activeQuestion.value.id] = optionId;
  } else if (activeQuestion.value.type === 'multiple') {
    const current = userAnswers.value[activeQuestion.value.id] || [];
    if (current.includes(optionId)) {
      userAnswers.value[activeQuestion.value.id] = current.filter((id: string) => id !== optionId);
    } else {
      userAnswers.value[activeQuestion.value.id] = [...current, optionId];
    }
  }
};

const isOptionSelected = (optionId: string) => {
  if (!activeQuestion.value) return false;
  const answer = userAnswers.value[activeQuestion.value.id];
  if (Array.isArray(answer)) {
    return answer.includes(optionId);
  }
  return answer === optionId;
};

const nextQuestion = () => {
  if (!activeQuestion.value || !currentQuiz.value) return;

  // Save input answer if applicable
  if (activeQuestion.value.type === 'input') {
    userAnswers.value[activeQuestion.value.id] = currentInputAnswer.value.trim();
    currentInputAnswer.value = '';
  }

  if (currentQuestionIndex.value < currentQuiz.value.questions.length - 1) {
    currentQuestionIndex.value++;
  } else {
    showResults.value = true;
  }
};

const calculateScore = computed(() => {
  if (!currentQuiz.value) return { correct: 0, total: 0, score: 0 };
  
  let correct = 0;
  currentQuiz.value.questions.forEach(q => {
    const userAnswer = userAnswers.value[q.id];
    
    if (q.type === 'single') {
      const correctOpt = q.options?.find(o => o.isCorrect);
      if (correctOpt && userAnswer === correctOpt.id) correct++;
    } else if (q.type === 'multiple') {
        const correctOpts = q.options?.filter(o => o.isCorrect).map(o => o.id) || [];
        // Check if arrays have same elements
        if (Array.isArray(userAnswer) && 
            userAnswer.length === correctOpts.length && 
            userAnswer.every(id => correctOpts.includes(id))) {
          correct++;
        }
    } else if (q.type === 'input') {
      const correctStr = (q.correctAnswer as string).toLowerCase().trim();
      const userStr = (userAnswer as string || '').toLowerCase().trim();
      if (correctStr === userStr) correct++;
    }
  });

  return {
    correct,
    total: currentQuiz.value.questions.length,
    score: Math.round((correct / currentQuiz.value.questions.length) * 100)
  };
});

const isCorrect = (q: QuizQuestion) => {
  const userAnswer = userAnswers.value[q.id];
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

const resetQuiz = () => {
    if (currentQuiz.value) {
        startQuiz(currentQuiz.value);
    }
};

const goBack = () => {
    currentQuiz.value = null;
    showResults.value = false;
};
</script>

<template>
  <main class="container quiz-container">
    
    <!-- Quiz Selection -->
    <div v-if="!currentQuiz" class="quiz-selection">
      <h2>Выберите тему для проверки</h2>
      <div class="quiz-grid">
        <div 
          v-for="quiz in quizzes" 
          :key="quiz.id" 
          class="quiz-card"
          @click="startQuiz(quiz)"
        >
          <h3>{{ quiz.title }}</h3>
          <p>{{ quiz.questions.length }} вопросов</p>
          <button class="start-btn">Начать тест</button>
        </div>
      </div>
    </div>

    <!-- Active Quiz -->
    <div v-else-if="!showResults && activeQuestion" class="active-quiz">
      <div class="quiz-header">
        <button class="back-link" @click="goBack">← Назад</button>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <span class="progress-text">Вопрос {{ currentQuestionIndex + 1 }} из {{ currentQuiz.questions.length }}</span>
      </div>

      <div class="question-card-lg">
        <div class="question-text">{{ activeQuestion.text }}</div>

        <div class="options-list">
            <!-- Single Choice -->
            <template v-if="activeQuestion.type === 'single'">
                <div 
                    v-for="opt in activeQuestion.options" 
                    :key="opt.id"
                    class="option-item"
                    :class="{ selected: isOptionSelected(opt.id) }"
                    @click="selectOption(opt.id)"
                >
                    <div class="radio-circle"></div>
                    <span>{{ opt.text }}</span>
                </div>
            </template>

            <!-- Multiple Choice -->
             <template v-if="activeQuestion.type === 'multiple'">
                <div 
                    v-for="opt in activeQuestion.options" 
                    :key="opt.id"
                    class="option-item"
                    :class="{ selected: isOptionSelected(opt.id) }"
                    @click="selectOption(opt.id)"
                >
                    <div class="checkbox-square"></div>
                    <span>{{ opt.text }}</span>
                </div>
            </template>

            <!-- Input -->
            <template v-if="activeQuestion.type === 'input'">
                <input 
                    v-model="currentInputAnswer"
                    type="text" 
                    placeholder="Введите ваш ответ..."
                    class="quiz-input"
                    @keyup.enter="nextQuestion"
                >
            </template>
        </div>

        <button 
          class="next-btn" 
          :disabled="activeQuestion.type !== 'input' && !userAnswers[activeQuestion.id] && currentInputAnswer === ''" 
          @click="nextQuestion"
        >
          {{ currentQuestionIndex === currentQuiz.questions.length - 1 ? 'Завершить' : 'Далее' }}
        </button>
      </div>
    </div>

    <!-- Results -->
    <div v-else class="results-view">
        <div class="score-card">
            <h2>Результат</h2>
            <div class="score-circle" :class="{ 
                good: calculateScore.score >= 80, 
                avg: calculateScore.score >= 50 && calculateScore.score < 80,
                bad: calculateScore.score < 50 
            }">
                {{ calculateScore.score }}%
            </div>
            <p>{{ calculateScore.correct }} из {{ calculateScore.total }} верно</p>
            <div class="action-buttons">
                <button class="retry-btn" @click="resetQuiz">Попробовать снова</button>
                <button class="back-btn" @click="goBack">К списку тем</button>
            </div>
        </div>

        <div class="review-list">
            <div 
                v-for="q in currentQuiz?.questions" 
                :key="q.id" 
                class="review-item"
                :class="{ incorrect: !isCorrect(q) }"
            >
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

  </main>
</template>

<style scoped>
.quiz-container {
    padding-top: var(--spacing-xl);
    padding-bottom: var(--spacing-xl);
    max-width: 800px;
}

.quiz-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--spacing-lg);
    margin-top: var(--spacing-lg);
}

.quiz-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    padding: var(--spacing-lg);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
}

.quiz-card:hover {
    transform: translateY(-4px);
    border-color: var(--accent-primary);
    box-shadow: var(--shadow-md);
}

.start-btn {
    margin-top: var(--spacing-md);
    width: 100%;
    padding: 10px;
    background: var(--accent-primary);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
}

/* Active Quiz */
.quiz-header {
    margin-bottom: var(--spacing-xl);
}

.back-link {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    margin-bottom: var(--spacing-md);
    font-size: 0.9rem;
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
    margin-bottom: var(--spacing-xl);
    white-space: pre-wrap;
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
}

.option-item:hover {
    background: var(--bg-card);
    border-color: rgba(56, 189, 248, 0.3);
}

.option-item.selected {
    border-color: var(--accent-primary);
    background: rgba(56, 189, 248, 0.1);
}

.radio-circle, .checkbox-square {
    width: 20px;
    height: 20px;
    border: 2px solid var(--border-color);
    margin-right: 12px;
    position: relative;
    flex-shrink: 0;
}

.radio-circle { border-radius: 50%; }
.checkbox-square { border-radius: 4px; }

.option-item.selected .radio-circle::after {
    content: '';
    position: absolute;
    top: 3px; left: 3px;
    width: 10px; height: 10px;
    background: var(--accent-primary);
    border-radius: 50%;
}

.option-item.selected .checkbox-square {
    background: var(--accent-primary);
    border-color: var(--accent-primary);
}

.quiz-input {
    width: 100%;
    padding: 16px;
    font-size: 1.1rem;
    background: var(--bg-secondary);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    color: var(--text-primary);
}

.quiz-input:focus {
    outline: none;
    border-color: var(--accent-primary);
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
}

.next-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Results */
.score-card {
    text-align: center;
    background: var(--bg-card);
    padding: var(--spacing-xl);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    margin-bottom: var(--spacing-xl);
}

.score-circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    font-weight: 800;
    margin: var(--spacing-lg) auto;
    border: 8px solid;
}

.score-circle.good { border-color: #22c55e; color: #22c55e; }
.score-circle.avg { border-color: #f59e0b; color: #f59e0b; }
.score-circle.bad { border-color: #ef4444; color: #ef4444; }

.action-buttons {
    display: flex;
    justify-content: center;
    gap: var(--spacing-md);
    margin-top: var(--spacing-lg);
}

.retry-btn, .back-btn {
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    border: none;
}

.retry-btn { background: var(--accent-primary); color: white; }
.back-btn { background: var(--bg-secondary); color: var(--text-primary); }

.review-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.review-item {
    padding: var(--spacing-md);
    border-radius: 8px;
    background: var(--bg-card);
    border-left: 4px solid #22c55e;
}

.review-item.incorrect {
    border-left-color: #ef4444;
}

.review-header {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
}

.review-question {
    font-weight: 500;
}

.review-details {
    margin-top: var(--spacing-sm);
    margin-left: 28px;
    font-size: 0.95rem;
    color: var(--text-secondary);
}

.explanation {
    margin-top: 4px;
    font-style: italic;
    color: var(--accent-primary);
}
</style>
