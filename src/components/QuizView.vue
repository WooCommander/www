<script setup lang="ts">
import { ref, computed, onUnmounted, onMounted } from 'vue';
import { quizzes, type QuizTopic, type QuizQuestion } from '../data/quiz_data';
import { QuestionStore } from '../services/QuestionStore';

const currentQuiz = ref<QuizTopic | null>(null);
const currentQuestionIndex = ref(0);
const userAnswers = ref<Record<string, any>>({}); // questionId -> answer
const showResults = ref(false);
const currentInputAnswer = ref('');

// Modes: 'topic' (default list), 'category' (list of categories), 'exam' (start button)
const viewMode = ref<'topic' | 'category' | 'exam'>('topic');
const timeRemaining = ref(0); // seconds
let timerInterval: any = null;

onMounted(async () => {
    await QuestionStore.initialize();
});

// Merge static quizzes with user questions
const allQuizzes = computed(() => {
    const userQs = QuestionStore.getQuizQuestions.value;
    
    const merged = [...quizzes];
    
    if (userQs.length > 0) {
        merged.push({
            id: 'user-custom',
            title: 'Мои вопросы (Flashcards)',
            category: 'User Questions',
            questions: userQs
        });
    }
    
    return merged;
});

// Group quizzes by category
const quizzesByCategory = computed(() => {
  const groups: Record<string, QuizTopic[]> = {};
  allQuizzes.value.forEach(q => {
    if (!groups[q.category]) {
      groups[q.category] = [];
    }
    groups[q.category].push(q);
  });
  return groups;
});

const allCategories = computed(() => Object.keys(quizzesByCategory.value));

const activeQuestion = computed(() => {
  if (!currentQuiz.value || !currentQuiz.value.questions) return null;
  return currentQuiz.value.questions[currentQuestionIndex.value];
});

const progress = computed(() => {
  if (!currentQuiz.value) return 0;
  return ((currentQuestionIndex.value) / currentQuiz.value.questions.length) * 100;
});

const formattedTime = computed(() => {
    if (timeRemaining.value <= 0) return '00:00';
    const m = Math.floor(timeRemaining.value / 60).toString().padStart(2, '0');
    const s = (timeRemaining.value % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
});

// Helper: Shuffle Array
const shuffle = <T>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = arr[i]!;
        arr[i] = arr[j]!;
        arr[j] = temp;
    }
    return arr;
};

// Start Standard Topic Quiz
const startQuiz = (quiz: QuizTopic) => {
  currentQuiz.value = quiz;
  resetState();
};

// Start Category Mode (Random 20)
const startCategoryMode = (category: string) => {
    const topics = quizzesByCategory.value[category] || [];
    const allQuestions = topics.flatMap(t => t.questions);
    const selectedQuestions = shuffle(allQuestions).slice(0, 20);
    
    currentQuiz.value = {
        id: `cat-${category}`,
        title: `Тест по теме: ${category}`,
        category: category,
        questions: selectedQuestions
    };
    resetState();
};

// Start Exam Mode (Random 50, 45 mins)
const startExamMode = () => {
    const allQuestions = allQuizzes.value.flatMap(q => q.questions);
    const selectedQuestions = shuffle(allQuestions).slice(0, 50);

    currentQuiz.value = {
        id: 'exam-full',
        title: 'Экзамен (50 вопросов)',
        category: 'Exam',
        questions: selectedQuestions
    };
    resetState();
    
    // Timer 45 mins
    timeRemaining.value = 45 * 60;
    startTimer();
};

const resetState = () => {
    currentQuestionIndex.value = 0;
    userAnswers.value = {};
    showResults.value = false;
    currentInputAnswer.value = '';
    stopTimer();
};

const startTimer = () => {
    stopTimer();
    timerInterval = setInterval(() => {
        timeRemaining.value--;
        if (timeRemaining.value <= 0) {
            finishQuiz();
        }
    }, 1000);
};

const stopTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
};

const finishQuiz = () => {
    stopTimer();
    showResults.value = true;

    // Save Result to History
    if (currentQuiz.value) {
        const result = calculateScore.value;
        const record = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            score: result.score,
            correct: result.correct,
            total: result.total,
            timeTaken: currentQuiz.value.id === 'exam-full' ? (45 * 60 - timeRemaining.value) : 0, // Approx time logic
            mode: viewMode.value,
            title: currentQuiz.value.title
        };

        const existing = localStorage.getItem('quiz_records');
        const history = existing ? JSON.parse(existing) : [];
        history.push(record);
        localStorage.setItem('quiz_records', JSON.stringify(history));
    }
};

const selectOption = (optionId: string) => {
  if (!activeQuestion.value || showResults.value) return;
  
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
    finishQuiz();
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
        // If it's a generated quiz (Exam/Category), we might want to re-generate or restart same?
        // For simplicity, restart the EXACT same questions for retry.
        // If user wants new questions, they go back and start again.
        
        // Use logic from start functions but keep current quiz object
        resetState();
        if (currentQuiz.value.id === 'exam-full') {
             timeRemaining.value = 45 * 60;
             startTimer();
        }
    }
};

const goBack = () => {
    stopTimer();
    currentQuiz.value = null;
    showResults.value = false;
};

onUnmounted(() => {
    stopTimer();
});
</script>

<template>
  <main class="container quiz-container">
    
    <!-- Mode Selection -->
    <div v-if="!currentQuiz" class="mode-selection">
        <div class="mode-tabs">
            <button 
                class="mode-tab" 
                :class="{ active: viewMode === 'topic' }" 
                @click="viewMode = 'topic'"
            >
                📚 По темам
            </button>
            <button 
                class="mode-tab" 
                :class="{ active: viewMode === 'category' }" 
                @click="viewMode = 'category'"
            >
                🔀 По категориям
            </button>
            <button 
                class="mode-tab" 
                :class="{ active: viewMode === 'exam' }" 
                @click="viewMode = 'exam'"
            >
                ⏱️ Экзамен
            </button>
        </div>

        <!-- Topic Mode (Classic) -->
        <div v-if="viewMode === 'topic'" class="quiz-selection">
            <div v-for="(topics, category) in quizzesByCategory" :key="category" class="category-block">
                <h3 class="category-title">{{ category }}</h3>
                <div class="quiz-grid">
                    <div 
                        v-for="quiz in topics" 
                        :key="quiz.id" 
                        class="quiz-card"
                        @click="startQuiz(quiz)"
                    >
                        <h3>{{ quiz.title }}</h3>
                        <p>{{ quiz.questions.length }} вопросов</p>
                        <button class="start-btn">Начать</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Category Mode (Random 20) -->
        <div v-if="viewMode === 'category'" class="category-list-view">
             <h2>Выберите категорию</h2>
             <p class="mode-desc">Вам будет предложено 20 случайных вопросов из выбранной категории.</p>
             
             <div class="quiz-grid">
                <div 
                    v-for="cat in allCategories" 
                    :key="cat" 
                    class="quiz-card category-card"
                    @click="startCategoryMode(cat)"
                >
                    <h3>{{ cat }}</h3>
                    <p>Случайные 20 вопросов</p>
                    <button class="start-btn">Начать тест</button>
                </div>
             </div>
        </div>

        <!-- Exam Mode -->
        <div v-if="viewMode === 'exam'" class="exam-view">
            <div class="exam-intro">
                <h2>Финальный Экзамен</h2>
                <div class="exam-info">
                    <div class="info-item">
                        <span class="emoji">❓</span>
                        <span>50 вопросов</span>
                    </div>
                     <div class="info-item">
                        <span class="emoji">⏱️</span>
                        <span>45 минут</span>
                    </div>
                     <div class="info-item">
                        <span class="emoji">🎲</span>
                        <span>Все темы</span>
                    </div>
                </div>
                <p>
                    Вопросы выбираются случайно из всей базы знаний. 
                    Таймер запустится автоматически. Результат будет сохранен только после завершения.
                </p>
                <button class="start-exam-btn" @click="startExamMode">Начать экзамен</button>
            </div>
        </div>
    </div>

    <!-- Active Quiz -->
    <div v-else-if="!showResults && activeQuestion" class="active-quiz">
      <div class="quiz-header">
        <div class="header-top">
             <button class="back-link" @click="goBack">← Выход</button>
             <div v-if="currentQuiz.id === 'exam-full'" class="exam-timer" :class="{ critical: timeRemaining < 300 }">
                ⏱️ {{ formattedTime }}
             </div>
        </div>
        
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <span class="progress-text">Вопрос {{ currentQuestionIndex + 1 }} из {{ currentQuiz.questions.length }}</span>
      </div>

      <div class="question-card-lg">
        <div class="question-text">{{ activeQuestion.text }}</div>
        
        <!-- Code Snippet -->
        <div v-if="activeQuestion.codeSnippet" class="code-snippet">
          <pre><code>{{ activeQuestion.codeSnippet }}</code></pre>
        </div>

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

.category-block {
  margin-bottom: var(--spacing-xl);
}

.category-title {
  color: var(--accent-primary);
  font-size: 1.2rem;
  margin-bottom: var(--spacing-md);
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.quiz-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--spacing-lg);
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
}

.code-snippet pre {
    margin: 0;
    font-family: 'Fira Code', monospace;
    color: #e2e8f0;
    font-size: 0.95rem;
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

/* Mode Selection Styles */
.mode-tabs {
    display: flex;
    justify-content: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xl);
}

.mode-tab {
    padding: 12px 24px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
}

.mode-tab:hover {
    border-color: var(--accent-primary);
    color: var(--text-primary);
}

.mode-tab.active {
    background: var(--accent-primary);
    color: white;
    border-color: var(--accent-primary);
}

.mode-desc {
    text-align: center;
    color: var(--text-secondary);
    margin-bottom: var(--spacing-lg);
}

.exam-view {
    display: flex;
    justify-content: center;
    padding: var(--spacing-xl) 0;
}

.exam-intro {
    background: var(--bg-card);
    padding: var(--spacing-xl);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    text-align: center;
    max-width: 500px;
}

.exam-info {
    display: flex;
    justify-content: center;
    gap: var(--spacing-lg);
    margin: var(--spacing-lg) 0;
}

.info-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    font-weight: 600;
}

.info-item .emoji {
    font-size: 2rem;
}

.start-exam-btn {
    margin-top: var(--spacing-xl);
    padding: 16px 48px;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
    border: none;
    border-radius: 30px;
    font-size: 1.2rem;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s;
    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
}

.start-exam-btn:hover {
    transform: scale(1.05);
}

.header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.exam-timer {
    font-family: 'Fira Code', monospace;
    font-size: 1.2rem;
    font-weight: 700;
    padding: 6px 12px;
    background: var(--bg-card);
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

.exam-timer.critical {
    color: #ef4444;
    border-color: #ef4444;
    animation: pulse 1s infinite;
}

@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
}
</style>
