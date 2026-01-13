import { QuestionStore } from './QuestionStore';
import type { QuizTopic } from '../data/quiz_data';
import type { Question } from '../types';

interface ExamConfig {
    totalQuestions: number;
    timeLimitSeconds: number;
    distribution: {
        easy: number;   // percentage 0-1
        medium: number; // percentage 0-1
        hard: number;   // percentage 0-1
    };
}

const DEFAULT_CONFIG: ExamConfig = {
    totalQuestions: 50,
    timeLimitSeconds: 45 * 60,
    distribution: {
        easy: 0.3,   // 30%
        medium: 0.5, // 50%
        hard: 0.2    // 20%
    }
};

export const ExamService = {
    generateExam(config: Partial<ExamConfig> = {}): QuizTopic {
        const finalConfig = { ...DEFAULT_CONFIG, ...config };
        const allQuestions = QuestionStore.getAllQuestions.value;

        // Group by difficulty
        const ease = allQuestions.filter((q: Question) => q.difficulty === 'Easy');
        const medium = allQuestions.filter((q: Question) => q.difficulty === 'Medium');
        const hard = allQuestions.filter((q: Question) => q.difficulty === 'Hard');

        const counts = {
            easy: Math.round(finalConfig.totalQuestions * finalConfig.distribution.easy),
            medium: Math.round(finalConfig.totalQuestions * finalConfig.distribution.medium),
            hard: Math.round(finalConfig.totalQuestions * finalConfig.distribution.hard)
        };

        // Adjust counts to ensure sum equals total (simple adjustment on medium)
        const currentSum = counts.easy + counts.medium + counts.hard;
        const diff = finalConfig.totalQuestions - currentSum;
        counts.medium += diff;

        // Helper to pick random
        const pickRandom = (pool: Question[], count: number) => {
            const shuffled = [...pool].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        };

        // Keep selecting if we don't have enough difficulty-specific questions
        // Fallback strategy: fill with remaining questions from other buckets if needed
        let selected: Question[] = [
            ...pickRandom(ease, counts.easy),
            ...pickRandom(medium, counts.medium),
            ...pickRandom(hard, counts.hard)
        ];

        // If we are short (e.g. not enough Hard questions), fill with ANY remaining unique questions
        if (selected.length < finalConfig.totalQuestions) {
            const selectedIds = new Set(selected.map((q: Question) => q.id));
            const remaining = allQuestions.filter((q: Question) => !selectedIds.has(q.id));
            const needed = finalConfig.totalQuestions - selected.length;
            selected = [...selected, ...pickRandom(remaining, needed)];
        }

        // Convert to QuizTopic format
        // Note: QuestionStore.getAllQuestions returns `Question` type.
        // QuizTopic expects `QuizQuestion`. We need to map them.
        // However, looking at useQuizSession, it seems to handle `Question` properties if we cast or if interfaces match close enough.
        // The previous refactor added `getQuizQuestions` adapter in QuestionStore precisely for this content.
        // Let's use the adapter logic here locally to be safe.

        const mappedQuestions = selected.map(q => ({
            id: q.id.toString(),
            text: q.title,
            type: (q.type || 'input') as any,
            options: q.options,
            correctAnswer: q.answer,
            explanation: q.answer
        }));

        return {
            id: 'exam-random-' + Date.now(),
            title: 'Финальный Экзамен',
            category: 'Exam',
            icon: '🎓',
            description: 'Случайная выборка из всех тем',
            questions: mappedQuestions
        };
    }
};
