import { QuestionStore } from '../../../services/QuestionStore';
import { ref, computed } from 'vue';
import type { QuizTopic } from '../../../data/quiz_data';
import { soundService } from '../../../services/SoundService';
import confetti from 'canvas-confetti';

export function useQuizSession() {
  const currentQuiz = ref<QuizTopic | null>(null);
  const currentQuestionIndex = ref(0);
  const userAnswers = ref<Record<string, any>>({}); // questionId -> answer
  const showResults = ref(false);
  const currentInputAnswer = ref('');
  const isShaking = ref(false);
  const timeRemaining = ref(0);
  const isFinishing = ref(false);
  let timerInterval: any = null;

  /* Storing original quiz to support re-shuffling on retry */
  const originalQuiz = ref<QuizTopic | null>(null);

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
        if (Array.isArray(userAnswer) &&
          userAnswer.length === correctOpts.length &&
          userAnswer.every((id: string) => correctOpts.includes(id))) {
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

  const resetState = () => {
    currentQuestionIndex.value = 0;
    userAnswers.value = {};
    showResults.value = false;
    isFinishing.value = false;
    currentInputAnswer.value = '';
    stopTimer();
  };

  const shuffleOptions = (quiz: QuizTopic): QuizTopic => {
    // Deep clone to avoid mutating store
    const cloned = JSON.parse(JSON.stringify(quiz));
    cloned.questions.forEach((q: any) => {
      if (q.options && q.options.length > 0) {
        // Fisher-Yates shuffle
        for (let i = q.options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [q.options[i], q.options[j]] = [q.options[j], q.options[i]];
        }
      }
    });
    return cloned;
  };

  const startQuiz = (quiz: QuizTopic) => {
    // Store original for resets
    originalQuiz.value = quiz;
    currentQuiz.value = shuffleOptions(quiz);
    resetState();
  };

  const startExamMode = (quiz: QuizTopic) => {
    // Already random, but options defined in quiz_data need shuffling
    startQuiz(quiz);
    timeRemaining.value = 45 * 60;
    startTimer();
  };

  const triggerShake = () => {
    isShaking.value = true;
    setTimeout(() => isShaking.value = false, 500);
  };

  const onSelectOption = (optionId: string) => {
    if (!activeQuestion.value || showResults.value) return;

    if (activeQuestion.value.type === 'single') {
      const isCorrect = activeQuestion.value.options?.find(o => o.id === optionId)?.isCorrect;
      if (isCorrect) {
        soundService.playSuccess();
      } else {
        soundService.playError();
        triggerShake();
      }
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

  const finishQuiz = async (modeName: string = 'Unknown') => {
    if (isFinishing.value || showResults.value) return;
    isFinishing.value = true;

    stopTimer();
    showResults.value = true;

    const result = calculateScore.value;
    if (result.score >= 80) {
      soundService.playFanfare();
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    if (currentQuiz.value) {
      let safeMode = 'topic';
      if (modeName === 'exam' || currentQuiz.value.id === 'exam-full') safeMode = 'exam';
      else if (modeName === 'category' || currentQuiz.value.id.startsWith('cat-')) safeMode = 'category';

      const record = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        score: result.score,
        correct: result.correct,
        total: result.total,
        timeTaken: currentQuiz.value.id === 'exam-full' ? (45 * 60 - timeRemaining.value) : 0,
        mode: safeMode,
        title: currentQuiz.value.title
      };

      await QuestionStore.saveExamResult(record);
    }
  };

  const nextQuestion = (modeName: string = 'Unknown') => {
    if (!activeQuestion.value || !currentQuiz.value) return;

    if (activeQuestion.value.type === 'input') {
      const ans = currentInputAnswer.value.trim();
      userAnswers.value[activeQuestion.value.id] = ans;

      const correctStr = (activeQuestion.value.correctAnswer as string).toLowerCase().trim();
      const userStr = ans.toLowerCase().trim();
      if (correctStr === userStr) {
        soundService.playSuccess();
      } else {
        soundService.playError();
        triggerShake();
      }
      currentInputAnswer.value = '';
    }

    if (currentQuestionIndex.value < currentQuiz.value.questions.length - 1) {
      currentQuestionIndex.value++;
    } else {
      finishQuiz(modeName);
    }
  };

  const resetQuiz = () => {
    if (originalQuiz.value) {
      // Re-shuffle from original
      currentQuiz.value = shuffleOptions(originalQuiz.value);
      resetState();

      if (currentQuiz.value.id === 'exam-full') {
        timeRemaining.value = 45 * 60;
        startTimer();
      }
    } else if (currentQuiz.value) {
      // Fallback if original is missing for some reason
      resetState();
    }
  };

  return {
    currentQuiz,
    currentQuestionIndex,
    userAnswers,
    showResults,
    currentInputAnswer,
    isShaking,
    timeRemaining,
    formattedTime,
    activeQuestion,
    progress,
    calculateScore,
    startQuiz,
    startExamMode,
    stopTimer,
    onSelectOption,
    nextQuestion,
    resetQuiz,
    finishQuiz,
    triggerShake
  };
}
