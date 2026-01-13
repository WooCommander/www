import { reactive, computed } from 'vue';
import { Preferences } from '@capacitor/preferences';
import { quizzes as staticQuizzes, type QuizTopic, type QuizQuestion } from '../data/quiz_data';
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
  isLoaded: boolean;
}

const state = reactive<QuestionState>({
  userQuestions: [],
  customQuizzes: [],
  overrides: {},
  deletedIds: new Set(),
  isLoaded: false
});

export const QuestionStore = {
  get state() {
    return state;
  },

  getQuizzes: computed(() => {
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
  }),

  getAllQuestions: computed(() => {
    // 1. Start with static questions that aren't deleted
    // Note: staticQuestions (from data/questions.ts) are a flat list of Question objects.
    // We filter them and apply overrides.
    const merged = staticQuestions
      .filter(q => !state.deletedIds.has(q.id))
      .map(q => {
        return state.overrides[q.id] || q;
      });

    // 2. Append user-created questions
    return [...merged, ...state.userQuestions];
  }),

  // Helper for Flashcard/Study modes using flat questions
  getQuizQuestions: computed(() => {
    // This matches the format needed for some legacy views if they use QuizQuestion interface
    // But primarily StudyView uses getAllQuestions (Question interface).
    // Keeping this for potential mapping utility.
    const allQs = QuestionStore.getAllQuestions.value;
    return allQs.map(q => ({
      id: q.id.toString(),
      text: q.title,
      type: (q.type || 'input') as any,
      options: q.options,
      correctAnswer: q.answer,
      explanation: q.answer
    }));
  }),

  async initialize() {
    if (state.isLoaded) return;
    try {
      const [uQ, ov, del, cq] = await Promise.all([
        Preferences.get({ key: STORAGE_KEYS.USER_QUESTIONS }),
        Preferences.get({ key: STORAGE_KEYS.OVERRIDES }),
        Preferences.get({ key: STORAGE_KEYS.DELETED_IDS }),
        Preferences.get({ key: STORAGE_KEYS.CUSTOM_QUIZZES })
      ]);

      if (uQ.value) state.userQuestions = JSON.parse(uQ.value);
      if (ov.value) state.overrides = JSON.parse(ov.value);
      if (del.value) state.deletedIds = new Set(JSON.parse(del.value));
      if (cq.value) state.customQuizzes = JSON.parse(cq.value);

      state.isLoaded = true;
    } catch (e) {
      console.error('Failed to load questions from storage', e);
    }
  },

  async saveQuestion(question: Question) {
    // Check if it's a static question (ID exists in static data)
    // We check against getAllQuestions excluding user questions to see if it's an override target
    // Or simpler: check if id exists in staticQuestions array
    const isStatic = staticQuestions.some(q => q.id === question.id);

    if (isStatic) {
      // It's an override of a static question
      state.overrides[question.id] = question;
      await Preferences.set({
        key: STORAGE_KEYS.OVERRIDES,
        value: JSON.stringify(state.overrides)
      });
    } else {
      // It's a user question (new or existing user question)
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
    window.location.reload();
  }
};
