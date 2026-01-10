export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Question {
    id: number;
    title: string;
    answer: string;
    category: string;
    difficulty: Difficulty;
    code?: string;
}
