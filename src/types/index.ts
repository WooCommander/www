export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface QuestionOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface Question {
    id: number | string;
    title: string;
    answer: string;
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    code?: string;
    slug?: string;
    type?: 'input' | 'single' | 'multiple';
    options?: QuestionOption[];
}

export interface CustomQuiz {
    id: string;
    title: string;
    description?: string;
    questionIds: string[];
    createdAt: number;
}
