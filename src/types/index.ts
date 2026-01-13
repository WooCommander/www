export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Question {
    id: number | string;
    title: string;
    answer: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    code?: string;
    slug?: string;
}

export interface CustomQuiz {
    id: string;
    title: string;
    description?: string;
    questionIds: string[];
    createdAt: number;
}
