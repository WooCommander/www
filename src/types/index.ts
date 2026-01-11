export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Question {
    id: string;
    title: string;
    answer: string;
    category: string;
    difficulty: Difficulty;
    slug: string;
    code?: string;
}
