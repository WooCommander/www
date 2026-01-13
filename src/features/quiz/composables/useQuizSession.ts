import { ref, computed, type Ref } from 'vue';
import type { QuizTopic, QuizQuestion } from '../../../data/quiz_data';
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
  let timerInterval: any = null;

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
    currentInputAnswer.value = '';
    stopTimer();
  };

  const startQuiz = (quiz: QuizTopic) => {
    currentQuiz.value = quiz;
    resetState();
  };

  const startExamMode = (quiz: QuizTopic) => {
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
        // For multiple choice, we don't play sound immediately on selection? 
        // Or maybe just click sound? Let's keep it silent or impartial click.
        // User requested sound triggers in QuizView, so keeping logic here is fine.
        // But logic for "correctness" on multiple choice is only known when submitting or finishing?
        // Usually implementation is: click updates selection. Validation touches separate.
        // Current implementation tries to be interactive.
        // Let's stick to update selection.
        const current = userAnswers.value[activeQuestion.value.id] || [];
        if (current.includes(optionId)) {
            userAnswers.value[activeQuestion.value.id] = current.filter((id: string) => id !== optionId);
        } else {
            userAnswers.value[activeQuestion.value.id] = [...current, optionId];
        }
    }
  };

  const finishQuiz = (modeName: string = 'Unknown') => {
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
      const record = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        score: result.score,
        correct: result.correct,
        total: result.total,
        timeTaken: currentQuiz.value.id === 'exam-full' ? (45 * 60 - timeRemaining.value) : 0,
        mode: modeName, 
        title: currentQuiz.value.title
      };

      const existing = localStorage.getItem('quiz_records');
      const history = existing ? JSON.parse(existing) : [];
      history.push(record);
      localStorage.setItem('quiz_records', JSON.stringify(history));
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
      if (currentQuiz.value) {
          resetState();
          if (currentQuiz.value.id === 'exam-full') {
              timeRemaining.value = 45 * 60;
              startTimer();
          }
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
    triggerShake // exposed if needed
  };
}
