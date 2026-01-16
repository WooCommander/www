<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase } from '../services/supabase';
import { QuestionStore } from '../services/QuestionStore';
import MainLayout from '../components/layout/MainLayout.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(true);

const stats = ref({
    totalUsers: 0,
    totalQuestions: 0,
    totalTime: 0,
    totalTests: 0
});

const topPlayers = ref<any[]>([]);

onMounted(async () => {
    loading.value = true;
    try {
        // 1. Fetch Total Users
        const { count: userCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });
        stats.value.totalUsers = userCount || 0;

        // 2. Fetch Total Questions (Static + Dynamic) - Approximation
        // For accurate count, we'd need to query DB 'user_questions' + static count.
        // Let's use QuestionStore for a "local view" of questions or just a hardcoded static + DB count.
        // Let's just default to QuestionStore.getAllQuestions.length (which merges both)
        // Ensure store is initialized? It might be empty if we just landed.
        await QuestionStore.initialize();
        stats.value.totalQuestions = QuestionStore.getAllQuestions.value.length;

        // 3. Fetch Aggregate Exam Stats (Time & Tests)
        // We can't easily sum column in Supabase without a stored procedure or fetch all.
        // FETCHING ALL MIGHT BE HEAVY if 1M records. But for now likely small.
        // Let's rely on a separate query or just fetch "recent 1000" to estimate? 
        // Or assume we have a 'platform_stats' table? We don't.
        // Let's fetch the `exam_results` count.
        const { count: testsCount, data: testsData } = await supabase
            .from('exam_results')
            .select('time_taken', { count: 'exact' })
            .limit(2000); // Limit to avoid massive load

        stats.value.totalTests = testsCount || 0;

        // Approx time from the fetched sample
        if (testsData) {
            const sumTime = testsData.reduce((acc, curr) => acc + (curr.time_taken || 0), 0);
            stats.value.totalTime = sumTime;
        }

        // 4. Fetch Top 5 Players (Hall of Fame)
        // This mirrors Leaderboard logic but simpler
        const { data: leaderboardData } = await supabase
            .from('exam_results')
            .select('*');

        if (leaderboardData) {
            // Process for "Best Unique Scores" aggregation (Arcade Mode logic)
            // We need usernames.
            const userIds = [...new Set(leaderboardData.map(r => r.user_id))];
            const { data: profiles } = await supabase.from('profiles').select('id, username').in('id', userIds);
            const userMap = profiles?.reduce((acc, p) => ({ ...acc, [p.id]: p.username }), {}) || {};

            const users: Record<string, any> = {};
            leaderboardData.forEach(r => {
                const uId = r.user_id;
                if (!users[uId]) users[uId] = { username: userMap[uId] || 'User', bestRuns: {} };

                const currentBest = users[uId].bestRuns[r.title];
                if (!currentBest || r.score > currentBest.score || (r.score === currentBest.score && r.time_taken < currentBest.timeTaken)) {
                    users[uId].bestRuns[r.title] = { score: r.correct || 0, timeTaken: r.time_taken || 0 };
                }
            });

            const ranked = Object.values(users).map((u: any) => {
                let totalScore = 0;
                Object.values(u.bestRuns).forEach((run: any) => totalScore += run.score);
                return { username: u.username, totalScore };
            }).sort((a, b) => b.totalScore - a.totalScore).slice(0, 5); // Top 5

            topPlayers.value = ranked;
        }

    } catch (e) {
        console.error('Error loading global stats', e);
    } finally {
        loading.value = false;
    }
});

const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    return `${h} ч`;
};

const goToStudy = () => router.push('/study');
const goToQuiz = () => router.push('/quiz');

</script>

<template>
    <MainLayout>
        <template #content>
            <div class="home-container">
                <!-- Hero Section -->
                <section class="hero-section">
                    <h1>Добро пожаловать в <span class="text-gradient">InterView</span></h1>
                    <p class="subtitle">Ваш персональный тренажер для подготовки к собеседованиям по Frontend
                        разработке.</p>

                    <div class="action-buttons">
                        <button class="primary-btn pulse" @click="goToQuiz">🚀 Начать Тест</button>
                        <button class="secondary-btn" @click="goToStudy">📚 Учить Вопросы</button>
                    </div>
                </section>

                <div v-if="loading" class="loading-state">
                    <div class="spinner"></div> Загрузка статистики...
                </div>

                <div v-else class="dashboard-grid">
                    <!-- Global Stats -->
                    <section class="stats-section">
                        <h2>🌐 Платформа в цифрах</h2>
                        <div class="stats-cards">
                            <div class="stat-card">
                                <span class="icon">👥</span>
                                <div class="stat-info">
                                    <span class="value">{{ stats.totalUsers }}</span>
                                    <span class="label">Пользователей</span>
                                </div>
                            </div>
                            <div class="stat-card">
                                <span class="icon">❓</span>
                                <div class="stat-info">
                                    <span class="value">{{ stats.totalQuestions }}</span>
                                    <span class="label">Вопросов</span>
                                </div>
                            </div>
                            <div class="stat-card">
                                <span class="icon">📝</span>
                                <div class="stat-info">
                                    <span class="value">{{ stats.totalTests }}</span>
                                    <span class="label">Тестов пройдено</span>
                                </div>
                            </div>
                            <div class="stat-card">
                                <span class="icon">⏳</span>
                                <div class="stat-info">
                                    <span class="value">{{ formatTime(stats.totalTime) }}</span>
                                    <span class="label">Время в учебе</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Hall of Fame -->
                    <section class="leaderboard-section">
                        <div class="section-header">
                            <h2>🏆 Зал Славы (Топ-5)</h2>
                            <router-link to="/leaderboard" class="view-all">Весь список &rarr;</router-link>
                        </div>

                        <div class="hof-list">
                            <div v-for="(player, index) in topPlayers" :key="index" class="hof-item"
                                :class="'rank-' + (index + 1)">
                                <div class="rank">#{{ index + 1 }}</div>
                                <div class="player-name">{{ player.username }}</div>
                                <div class="player-score">{{ player.totalScore }} <span>pts</span></div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </template>
    </MainLayout>
</template>

<style scoped lang="scss">
.home-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: var(--spacing-lg) 0;
}

.hero-section {
    text-align: center;
    margin-bottom: 60px;
    animation: fadeIn 0.8s ease-out;

    h1 {
        font-size: 3rem;
        margin-bottom: 16px;
        line-height: 1.2;
    }

    .subtitle {
        font-size: 1.2rem;
        color: var(--text-secondary);
        margin-bottom: 32px;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
    }
}

.action-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;

    button {
        padding: 16px 32px;
        border-radius: 12px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        &:active {
            transform: translateY(0);
        }
    }

    .primary-btn {
        background: var(--accent-primary);
        color: white;
        border: none;

        &.pulse {
            animation: pulse-animation 2s infinite;
        }
    }

    .secondary-btn {
        background: var(--bg-card);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
    }
}

.dashboard-grid {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 24px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
}

.stats-section,
.leaderboard-section {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 24px;
    padding: 24px;
}

h2 {
    font-size: 1.5rem;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.stats-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.stat-card {
    background: var(--bg-secondary);
    padding: 16px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: transform 0.2s;

    &:hover {
        transform: scale(1.02);
    }

    .icon {
        font-size: 2rem;
    }

    .stat-info {
        display: flex;
        flex-direction: column;
    }

    .value {
        font-size: 1.4rem;
        font-weight: 800;
        color: var(--text-primary);
    }

    .label {
        font-size: 0.8rem;
        color: var(--text-secondary);
    }
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
        margin: 0;
    }

    .view-all {
        font-size: 0.9rem;
        color: var(--accent-primary);
        text-decoration: none;
        font-weight: 600;

        &:hover {
            text-decoration: underline;
        }
    }
}

.hof-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.hof-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background: var(--bg-secondary);
    border-radius: 12px;

    .rank {
        font-size: 1.2rem;
        font-weight: 800;
        width: 40px;
        color: var(--text-secondary);
    }

    .player-name {
        flex: 1;
        font-weight: 600;
    }

    .player-score {
        font-weight: 700;
        color: var(--accent-primary);

        span {
            font-size: 0.8rem;
            font-weight: 400;
            opacity: 0.8;
        }
    }

    &.rank-1 .rank {
        color: #f59e0b;
    }

    /* Gold */
    &.rank-2 .rank {
        color: #94a3b8;
    }

    /* Silver */
    &.rank-3 .rank {
        color: #b45309;
    }

    /* Bronze */
}

@keyframes pulse-animation {
    0% {
        box-shadow: 0 0 0 0 rgba(var(--accent-primary-rgb), 0.4);
    }

    70% {
        box-shadow: 0 0 0 10px rgba(var(--accent-primary-rgb), 0);
    }

    100% {
        box-shadow: 0 0 0 0 rgba(var(--accent-primary-rgb), 0);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Mobile Tweaks */
@media (max-width: 600px) {
    .hero-section h1 {
        font-size: 2rem;
    }

    .action-buttons {
        flex-direction: column;
    }

    .stats-cards {
        grid-template-columns: 1fr;
    }
}
</style>
