import { reactive, computed } from 'vue';
import { Preferences } from '@capacitor/preferences';
import { quizzes as staticQuizzes, type QuizTopic } from '../data/quiz_data';
import { questions as staticQuestions } from '../data/questions';
import type { Question, CustomQuiz } from '../types';

const STORAGE_KEYS = {
  USER_QUESTIONS: 'user_questions',
  CUSTOM_QUIZZES: 'custom_quizzes',
  OVERRIDES: 'question_overrides',
  DELETED_IDS: 'deleted_questions'
};

interface QuestionState {
  userQuestions: Question[];
  customQuizzes: CustomQuiz[];
  overrides: Record<string, Question>;
  deletedIds: Set<string>;
  examHistory: any[]; // Using any[] for now to avoid circular dependencies or complex types, can be typed later
  isLoaded: boolean;
}

const state = reactive<QuestionState>({
  userQuestions: [],
  customQuizzes: [],
  overrides: {},
  deletedIds: new Set(),
  examHistory: [],
  isLoaded: false
});

const getQuizzes = computed(() => {
  // 1. Clone static topics structure and apply overrides
  const mergedTopics: QuizTopic[] = staticQuizzes.map(topic => ({
    ...topic,
    questions: topic.questions
      .filter(q => !state.deletedIds.has(q.id))
      .map(q => {
        const override = state.overrides[q.id];
        if (override) {
          return {
            id: override.id.toString(),
            text: override.title,
            type: (override.type || 'input') as any,
            options: override.options,
            correctAnswer: override.answer,
            explanation: override.answer
          };
        }
        return q;
      })
  }));

  // 2. Add user questions to their respective categories
  state.userQuestions.forEach(uq => {
    const topic = mergedTopics.find(t => t.category === uq.category);
    if (topic) {
      topic.questions.push({
        id: uq.id.toString(),
        text: uq.title,
        type: (uq.type || 'input') as any,
        options: uq.options,
        correctAnswer: uq.answer,
        explanation: uq.answer
      });
    }
  });

  return mergedTopics;
});

const getAllQuestions = computed(() => {
  // 1. Start with static questions that aren't deleted
  const merged = staticQuestions
    .filter(q => !state.deletedIds.has(q.id.toString()))
    .map(q => {
      return state.overrides[q.id] || q;
    });

  // 2. Append user-created questions
  return [...merged, ...state.userQuestions];
});

// Helper for Flashcard/Study modes using flat questions
const getQuizQuestions = computed(() => {
  const allQs = getAllQuestions.value;
  return allQs.map((q: Question) => ({
    id: q.id.toString(),
    text: q.title,
    type: (q.type || 'input') as any,
    options: q.options,
    correctAnswer: q.answer,
    explanation: q.answer
  }));
});

export const QuestionStore = {
  get state() {
    return state;
  },

  getQuizzes,
  getAllQuestions,
  getQuizQuestions,

  async initialize() {
    if (state.isLoaded) return;
    try {
      const [uQ, ov, del, cq, history] = await Promise.all([
        Preferences.get({ key: STORAGE_KEYS.USER_QUESTIONS }),
        Preferences.get({ key: STORAGE_KEYS.OVERRIDES }),
        Preferences.get({ key: STORAGE_KEYS.DELETED_IDS }),
        Preferences.get({ key: STORAGE_KEYS.CUSTOM_QUIZZES }),
        Preferences.get({ key: 'quiz_history' }) // Legacy key from LeaderboardView
      ]);

      if (uQ.value) state.userQuestions = JSON.parse(uQ.value);
      if (ov.value) state.overrides = JSON.parse(ov.value);
      if (del.value) state.deletedIds = new Set(JSON.parse(del.value));
      if (cq.value) state.customQuizzes = JSON.parse(cq.value);
      if (history.value) state.examHistory = JSON.parse(history.value);

      state.isLoaded = true;

      // Attempt background sync if online
      this.sync();
    } catch (e) {
      console.error('Failed to load questions from storage', e);
    }
  },

  async sync() {
    // Check for user
    const { data: { user } } = await import('./supabase').then(m => m.supabase.auth.getUser());
    if (!user) return;

    // 1. Sync User Questions
    try {
      const { data: remoteQuestions, error } = await import('./supabase').then(m => m.supabase
        .from('user_questions')
        .select('*')
      );

      if (remoteQuestions && !error) {
        // Simple strategy: Remote wins or Merge?
        // Let's merge: Add remote ones that don't exist locally
        const localIds = new Set(state.userQuestions.map(q => q.id));
        const newRemote = remoteQuestions.filter((rq: any) => !localIds.has(rq.id));

        if (newRemote.length > 0) {
          const mapped = newRemote.map((rq: any) => ({
            id: rq.id,
            title: rq.title,
            answer: rq.answer,
            category: rq.category,
            difficulty: 'Medium' as 'Medium', // Force type
            type: rq.type,
            options: rq.options
          }));
          state.userQuestions.push(...mapped);
          await Preferences.set({
            key: STORAGE_KEYS.USER_QUESTIONS,
            value: JSON.stringify(state.userQuestions)
          });
        }
      }
    } catch (e) { console.warn('Sync questions failed', e); }

    // 2. Sync Exam Results
    try {
      const { data: remoteResults, error } = await import('./supabase').then(m => m.supabase
        .from('exam_results')
        .select('*')
      );

      if (remoteResults && !error) {
        const localIds = new Set(state.examHistory.map(r => r.id));
        const newRemote = remoteResults.filter((r: any) => !localIds.has(r.id));

        if (newRemote.length > 0) {
          // Map snake_case to camelCase if needed, but our type aligns mostly?
          // DB: created_at, time_taken. Local: date, timeTaken.
          const mapped = newRemote.map((r: any) => ({
            id: r.id,
            date: r.created_at,
            mode: r.mode,
            title: r.title,
            score: r.score,
            total: r.total,
            correct: r.correct,
            timeTaken: r.time_taken
          }));
          state.examHistory.push(...mapped);
          // Sort
          state.examHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          await Preferences.set({
            key: 'quiz_history',
            value: JSON.stringify(state.examHistory)
          });
        }
      }
    } catch (e) { console.warn('Sync history failed', e); }
  },

  async saveQuestion(question: Question) {
    const isStatic = staticQuestions.some(q => q.id === question.id);

    if (isStatic) {
      state.overrides[question.id] = question;
      await Preferences.set({
        key: STORAGE_KEYS.OVERRIDES,
        value: JSON.stringify(state.overrides)
      });
    } else {
      const index = state.userQuestions.findIndex(q => q.id === question.id);
      if (index !== -1) {
        state.userQuestions[index] = question;
      } else {
        state.userQuestions.push(question);
      }
      await Preferences.set({
        key: STORAGE_KEYS.USER_QUESTIONS,
        value: JSON.stringify(state.userQuestions)
      });

      // Cloud Push
      const { data: { user } } = await import('./supabase').then(m => m.supabase.auth.getUser());
      if (user) {
        await import('./supabase').then(m => m.supabase.from('user_questions').upsert({
          id: question.id,
          user_id: user.id,
          title: question.title,
          answer: question.answer,
          category: question.category,
          type: question.type || 'input',
          options: question.options
        }));
      }
    }
  },

  async saveExamResult(result: any) {
    // Local Save
    state.examHistory.unshift(result);
    await Preferences.set({
      key: 'quiz_history',
      value: JSON.stringify(state.examHistory)
    });

    // Cloud Push
    const { data: { user } } = await import('./supabase').then(m => m.supabase.auth.getUser());
    if (user) {
      // Convert to DB format
      await import('./supabase').then(m => m.supabase.from('exam_results').insert({
        id: result.id, // Ensure UUID is used or let DB gen? Using local ID if UUID
        user_id: user.id,
        score: result.score,
        total: result.total,
        correct: result.correct,
        mode: result.mode,
        title: result.title,
        time_taken: result.timeTaken,
        created_at: result.date // Ensure ISO string
      }));
    }
  },

  async deleteQuestion(id: string) {
    const isStatic = staticQuestions.some(q => q.id === id);

    if (isStatic) {
      state.deletedIds.add(id);
      await Preferences.set({
        key: STORAGE_KEYS.DELETED_IDS,
        value: JSON.stringify(Array.from(state.deletedIds))
      });
    } else {
      state.userQuestions = state.userQuestions.filter(q => q.id !== id);
      await Preferences.set({
        key: STORAGE_KEYS.USER_QUESTIONS,
        value: JSON.stringify(state.userQuestions)
      });

      // Cloud Delete
      const { data: { user } } = await import('./supabase').then(m => m.supabase.auth.getUser());
      if (user) {
        await import('./supabase').then(m => m.supabase.from('user_questions').delete().eq('id', id));
      }
    }
  },

  async saveCustomQuiz(quiz: CustomQuiz) {
    const index = state.customQuizzes.findIndex(q => q.id === quiz.id);
    if (index !== -1) {
      state.customQuizzes[index] = quiz;
    } else {
      state.customQuizzes.push(quiz);
    }
    await Preferences.set({
      key: STORAGE_KEYS.CUSTOM_QUIZZES,
      value: JSON.stringify(state.customQuizzes)
    });
  },

  async deleteCustomQuiz(id: string) {
    state.customQuizzes = state.customQuizzes.filter(q => q.id !== id);
    await Preferences.set({
      key: STORAGE_KEYS.CUSTOM_QUIZZES,
      value: JSON.stringify(state.customQuizzes)
    });
  },

  async resetData() {
    await Preferences.clear();
    state.userQuestions = [];
    state.overrides = {};
    state.deletedIds = new Set();
    state.customQuizzes = [];
    state.examHistory = [];
    window.location.reload();
  }
};
