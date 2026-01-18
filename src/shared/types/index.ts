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
    difficulty: Difficulty;
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

export interface UserProfile {
    id: string; // uuid
    username?: string;
    xp: number;
    avatar_url?: string;
    updated_at?: string;
    email?: string;
    full_name?: string;
}

export interface ExamResult {
    id: string;
    user_id: string;
    score: number;
    total: number;
    correct: number;
    mode: string;
    title: string;
    time_taken: number;
    created_at: string;
}

export interface HistoryItem {
    id: string;
    date: string;
    mode: string;
    title: string;
    score: number;
    total: number;
    correct: number;
    timeTaken: number;
    username?: string;
}

export interface LeaderboardEntry {
    username: string;
    totalScore: number;
    rank?: number;
}

export interface PlatformStats {
    totalUsers: number;
    totalQuestions: number;
    totalTime: number;
    totalTests: number;
}

export interface TrendItem {
    title: string;
    count: number;
    avgScore: number;
}

export interface TrendsData {
    popular: TrendItem[];
    hardest: TrendItem[];
}
