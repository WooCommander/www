import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import QuizView from './QuizView.vue';
import { ref } from 'vue';

// Mock Data
const mockQuiz = {
    id: 'test-quiz',
    title: 'Test Quiz',
    questions: [{ id: 'q1', text: 'Question 1' }]
};

// Mutable Refs for mocking state
const currentQuiz = ref(null);
const showResults = ref(false);
const activeQuestion = ref(null);

// Mocks
const mockStartQuiz = vi.fn();
const mockStartExamMode = vi.fn();
const mockStopTimer = vi.fn();
const mockNextQuestion = vi.fn();
const mockResetQuiz = vi.fn();

vi.mock('../composables/useQuizSession', () => ({
    useQuizSession: () => ({
        currentQuiz,
        currentQuestionIndex: ref(0),
        userAnswers: ref({}),
        showResults,
        currentInputAnswer: ref(''),
        isShaking: ref(false),
        timeRemaining: ref(0),
        formattedTime: ref('00:00'),
        activeQuestion,
        progress: ref(0),
        calculateScore: ref({ correct: 0, total: 1 }),
        startQuiz: mockStartQuiz,
        startExamMode: mockStartExamMode,
        stopTimer: mockStopTimer,
        onSelectOption: vi.fn(),
        nextQuestion: mockNextQuestion,
        resetQuiz: mockResetQuiz
    })
}));

vi.mock('../../../services/QuestionStore', () => ({
    QuestionStore: {
        initialize: vi.fn(),
        getQuizzes: {
            value: [ // Mocking a computed/ref
                { id: 't1', title: 'Topic 1', category: 'Cat A', questions: [] },
                { id: 't2', title: 'Topic 2', category: 'Cat B', questions: [] }
            ]
        },
        saveQuestion: vi.fn(),
        deleteQuestion: vi.fn(),
        saveCustomQuiz: vi.fn()
    }
}));

vi.mock('../services/ExamService', () => ({
    ExamService: {
        generateExam: vi.fn(() => mockQuiz)
    }
}));

// Mock Child Components to simplify testing (Integration style but shallow)
// We mostly care that they are rendered at the right time
vi.mock('../components/QuizMenu.vue', () => ({ default: { template: '<div data-testid="quiz-menu">Menu</div>' } }));
vi.mock('../components/QuizRunner.vue', () => ({ default: { template: '<div data-testid="quiz-runner">Runner</div>' } }));
vi.mock('../components/QuizResults.vue', () => ({ default: { template: '<div data-testid="quiz-results">Results</div>' } }));

describe('QuizView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset State
        currentQuiz.value = null;
        showResults.value = false;
        activeQuestion.value = null;
    });

    it('renders QuizMenu by default (no active quiz)', () => {
        const wrapper = mount(QuizView);
        expect(wrapper.find('[data-testid="quiz-menu"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="quiz-runner"]').exists()).toBe(false);
        expect(wrapper.find('[data-testid="quiz-results"]').exists()).toBe(false);
    });

    it('renders QuizRunner when quiz is active', async () => {
        // Simulate active quiz state
        currentQuiz.value = mockQuiz as any;
        activeQuestion.value = mockQuiz.questions[0] as any;

        const wrapper = mount(QuizView);

        expect(wrapper.find('[data-testid="quiz-runner"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="quiz-menu"]').exists()).toBe(false);
    });

    it('renders QuizResults when showResults is true', async () => {
        // Simulate results state
        currentQuiz.value = mockQuiz as any;
        showResults.value = true;

        const wrapper = mount(QuizView);

        expect(wrapper.find('[data-testid="quiz-results"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="quiz-runner"]').exists()).toBe(false);
    });

    it('calls startQuiz when triggered from Menu', async () => {
        const wrapper = mount(QuizView);

        // We need to trigger the custom event on the child component instance
        // Best strategy: find the first component that matches our mock template
        const menuComponent = wrapper.findAllComponents({ template: '<div data-testid="quiz-menu">Menu</div>' })[0]
            || wrapper.findComponent({ name: 'QuizMenu' }); // Fallback if name works

        if (menuComponent) {
            await menuComponent.vm.$emit('start-quiz', { id: 'quiz1' });
            expect(mockStartQuiz).toHaveBeenCalledWith({ id: 'quiz1' });
        } else {
            throw new Error('QuizMenu component not found');
        }
    });
});
