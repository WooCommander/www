import { Preferences } from '@capacitor/preferences';
import { reactive, computed } from 'vue';
import type { Question } from '../types';
import { questions as staticQuestions } from '../data/questions';

const STORAGE_KEYS = {
  USER_QUESTIONS: 'user_questions',
  OVERRIDES: 'question_overrides',
  DELETED_IDS: 'deleted_question_ids'
};

interface QuestionStoreState {
  userQuestions: Question[];
  overrides: Record<string, Question>;
  deletedIds: Set<string>;
  isLoaded: boolean;
}

const state = reactive<QuestionStoreState>({
  userQuestions: [],
  overrides: {},
  deletedIds: new Set(),
  isLoaded: false
});

export const QuestionStore = {
  get state() {
    return state;
  },

  async initialize() {
    if (state.isLoaded) return;

    try {
      const [uQ, ov, del] = await Promise.all([
        Preferences.get({ key: STORAGE_KEYS.USER_QUESTIONS }),
        Preferences.get({ key: STORAGE_KEYS.OVERRIDES }),
        Preferences.get({ key: STORAGE_KEYS.DELETED_IDS })
      ]);

      if (uQ.value) state.userQuestions = JSON.parse(uQ.value);
      if (ov.value) state.overrides = JSON.parse(ov.value);
      if (del.value) state.deletedIds = new Set(JSON.parse(del.value));

      state.isLoaded = true;
    } catch (e) {
      console.error('Failed to load questions from storage', e);
    }
  },

  getAllQuestions: computed(() => {
    // 1. Start with static questions that aren't deleted
    const merged = staticQuestions
      .filter(q => !state.deletedIds.has(q.id))
      .map(q => {
        // 2. Apply overrides if they exist
        return state.overrides[q.id] || q;
      });

    // 3. Append user-created questions
    return [...merged, ...state.userQuestions];
  }),

  getQuizQuestions: computed(() => {
    // 1. Re-calculate merged list logic locally to avoid circular dependency
    const merged = staticQuestions
      .filter(q => !state.deletedIds.has(q.id))
      .map(q => state.overrides[q.id] || q);

    const all = [...merged, ...state.userQuestions];

    return all.map(q => ({
      id: q.id,
      text: q.title,
      type: 'input' as const,
      correctAnswer: q.answer,
      codeSnippet: q.code,
      explanation: 'Custom study question'
    }));
  }),

  async saveQuestion(question: Question) {
    // Check if it's a static question (ID exists in static data)
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

  async resetData() {
    await Preferences.clear();
    state.userQuestions = [];
    state.overrides = {};
    state.deletedIds = new Set();
    window.location.reload();
  }
};
