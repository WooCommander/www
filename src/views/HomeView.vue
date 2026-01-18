<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { StatsService } from '../modules/user/services/StatsService';
import { UserService } from '../services/UserService';
import type { PlatformStats, TrendsData, LeaderboardEntry } from '../shared/types';
import MainLayout from '../shared/layout/MainLayout.vue';
import { useRouter } from 'vue-router';
import BaseButton from '../shared/ui/BaseButton.vue';
// ... rest of imports

import { CourseStore } from '../modules/course/services/CourseStore';

const router = useRouter();
const loading = ref(true);

// Use Store
const courses = computed(() => {
    if (!CourseStore) return [];
    return CourseStore.courses || [];
});

const selectedCourse = computed(() => {
    if (!CourseStore) return null;
    return CourseStore.currentCourse;
});

// Debug Log
console.log('HomeView Setup. CourseStore:', CourseStore);

const stats = ref<PlatformStats>({
    totalUsers: 0,
    totalQuestions: 0,
    totalTime: 0,
    totalTests: 0
});

const trends = ref<TrendsData>({ popular: [], hardest: [] });
const topPlayers = ref<LeaderboardEntry[]>([]);

const loadDashboard = async () => {
    loading.value = true;
    try {
        const [platformStats, trendData, leaderboard] = await Promise.all([
            StatsService.getPlatformStats(),
            StatsService.getTrends(),
            UserService.getLeaderboard(5)
        ]);

        stats.value = platformStats;
        trends.value = trendData;
        topPlayers.value = leaderboard;
    } catch (e) {
        console.error('Error loading stats', e);
    } finally {
        loading.value = false;
    }
};

const selectCourse = (course: Course) => {
    // Header will also reflect this
    CourseStore.setCourse(course);
    // Reload not strictly needed if we just want dashboard to update?
    // But for now sticking to reload to refresh all global stores (Questions)
    window.location.reload();
};

// No need for changeCourse local logic anymore, header handles it. 
// But hero button "change" can still exist, maybe just open dropdown? 
// Or simply resetting course.
const changeCourse = () => {
    CourseStore.setCourse(null);
    window.location.reload();
};

onMounted(async () => {
    // Init store which handles loading and LS restoration
    await CourseStore.initialize();

    // Always Load Global Dashboard
    await loadDashboard();
});

const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    return `${h} ч`;
};

const goToStudy = () => router.push('/study');
const goToQuiz = () => router.push('/quiz');
const goToPanic = () => router.push('/panic');

</script>

<template>
    <MainLayout>
        <template #content>
            <div class="home-container">
                <!-- Hero Section: Dynamic based on selection -->
                <section class="hero-section" :class="{ 'compact': selectedCourse }">
                    <div v-if="selectedCourse" class="course-badge" @click="changeCourse">
                        {{ selectedCourse.icon }} {{ selectedCourse.title }}
                        <span class="change-hint">(сменить)</span>
                    </div>

                    <h1>
                        <span v-if="selectedCourse">Твой прогресс</span>
                        <span v-else>Добро пожаловать</span>
                        в <span class="text-gradient">InterView</span>
                    </h1>

                    <p v-if="!selectedCourse" class="subtitle">Выберите курс для начала обучения, или изучите общую
                        статистику ниже.</p>

                    <div v-if="selectedCourse" class="action-buttons">
                        <BaseButton variant="primary" size="lg" class="pulse" @click="goToQuiz">🚀 Начать Тест
                        </BaseButton>
                        <BaseButton variant="secondary" size="lg" class="panic-btn" @click="goToPanic">🔥 Panic Mode
                        </BaseButton>
                        <BaseButton variant="secondary" size="lg" @click="goToStudy">📚 Учить Вопросы</BaseButton>
                    </div>
                </section>

                <!-- Course Selection: Prominent if none selected, otherwise hidden/modal (or just list below?) 
                     Let's make it visible if !selectedCourse. If selected, we hide it (user clicks 'change' to reset). 
                     Actually user wanted dashboard viewable "while course is undefined".
                -->
                <div v-if="!selectedCourse" class="courses-section">
                    <h2>📚 Доступные Курсы</h2>
                    <div class="courses-grid">
                        <div v-if="loading && courses.length === 0" class="loading-state">Загрузка курсов...</div>
                        <div v-else class="course-card-lg" v-for="course in courses" :key="course.id"
                            @click="selectCourse(course)">
                            <div class="course-icon">{{ course.icon }}</div>
                            <h3>{{ course.title }}</h3>
                            <p>{{ course.description }}</p>
                        </div>
                    </div>
                </div>

                <!-- Dashboard Stats: Always Visible -->
                <div class="dashboard-view">
                    <div v-if="loading && !stats.totalUsers" class="loading-state">
                        <div class="spinner"></div> Загрузка статистики...
                    </div>

                    <div v-else class="dashboard-grid">
                        <!-- Global/Course Stats -->
                        <section class="stats-section">
                            <h2 v-if="selectedCourse">📊 Статистика курса</h2>
                            <h2 v-else>🌐 Глобальная статистика</h2>

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

                        <!-- Trends Section -->
                        <section class="trends-section">
                            <!-- Popular: Heatmap Cards -->
                            <div class="trend-card popular-card">
                                <div class="card-header">
                                    <h2>🔥 В тренде</h2>
                                    <span class="subtitle">Самые популярные тесты</span>
                                </div>
                                <div class="heatmap-grid">
                                    <div v-for="(item, idx) in trends.popular" :key="'pop-' + idx" class="heat-item"
                                        :style="{ '--intensity': 1 - (idx * 0.15) }">
                                        <div class="heat-bg"></div>
                                        <div class="heat-content">
                                            <div class="heat-rank">#{{ idx + 1 }}</div>
                                            <div class="heat-title">{{ item.title }}</div>
                                            <div class="heat-count">{{ item.count }} раз</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Hardest: Danger Cloud -->
                            <div class="trend-card hardest-card">
                                <div class="card-header">
                                    <h2>💀 Хардкор</h2>
                                    <span class="subtitle">Сложнее всего пройти</span>
                                </div>
                                <div class="danger-cloud">
                                    <div v-for="(item, idx) in trends.hardest" :key="'hard-' + idx" class="danger-chip"
                                        :style="{ '--severity': (100 - item.avgScore) / 100 }">
                                        <span class="danger-score">{{ item.avgScore }}%</span>
                                        <span class="danger-title">{{ item.title }}</span>
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
            </div>
        </template>
    </MainLayout>
</template>

<style scoped lang="scss">
.home-container {
    width: 100%;
    margin: 0 auto;
    padding: var(--spacing-lg) 0;
}

/* Course Selection */
.courses-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    max-width: 1200px;
    margin: 0 auto;
}

.course-card-lg {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 32px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
        transform: translateY(-5px);
        border-color: var(--accent-primary);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }
}

.course-icon {
    font-size: 3rem;
    margin-bottom: 16px;
    background: var(--bg-secondary);
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;
    margin-right: auto;
}

/* Course Badge in Hero */
.course-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(var(--accent-primary-rgb), 0.1);
    color: var(--accent-primary);
    padding: 6px 16px;
    border-radius: 50px;
    margin-bottom: 24px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid rgba(var(--accent-primary-rgb), 0.2);
    transition: all 0.2s;

    &:hover {
        background: rgba(var(--accent-primary-rgb), 0.2);

        .change-hint {
            opacity: 1;
        }
    }
}

.change-hint {
    font-size: 0.8rem;
    opacity: 0.6;
    font-weight: 400;
}

.hero-section {
    text-align: center;
    margin-bottom: 60px;
    animation: fadeIn 0.8s ease-out;

    &.compact {
        margin-bottom: 40px;
    }

    h1 {
        font-size: 3rem;
        margin-bottom: 16px;
        line-height: 1.2;

        @media (max-width: 600px) {
            font-size: 2rem;
        }
    }

    .subtitle {
        font-size: 1.2rem;
        color: var(--text-secondary);
        margin-bottom: 32px;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
    }

    .action-buttons {
        display: flex;
        justify-content: center;
        gap: 16px;

        @media (max-width: 600px) {
            flex-direction: column;
        }

        .pulse {
            animation: pulse-animation 2s infinite;
        }
    }
}

.dashboard-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
    align-items: start;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
}

/* Global Stats */
.stats-section {
    grid-column: 1 / -1;

    .stats-cards {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;

        @media (max-width: 1024px) {
            grid-template-columns: 1fr 1fr;
        }

        @media (max-width: 600px) {
            grid-template-columns: 1fr;
        }
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
    }
}

/* Trends Section */
.trends-section {
    grid-column: 1 / -1;
    /* Full width now or change based on design? */
    /* Previous CSS had grid-column 1 but that assumes 2 columns. */
    /* The dashboard grid is 2fr 1fr. Trends usually matches stats? */
    /* Looking at template, trends-section is inside dashboard-grid alongside leaderboard-section? */
    /* Actually structure is:
       dashboard-grid
         stats-section (1/-1)
         trends-section
         leaderboard-section
    */
    /* So trends should probably be column 1 and leaderboard column 2 */

    grid-column: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-top: 10px;

    @media (max-width: 1024px) {
        grid-column: 1;
        grid-template-columns: 1fr;
        /* Stack cards on tablet */
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }

    .trend-card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 24px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        overflow: hidden;

        .card-header {
            h2 {
                margin: 0 0 4px 0;
                font-size: 1.5rem;
            }

            .subtitle {
                font-size: 0.9rem;
                color: var(--text-secondary);
            }
        }
    }
}

/* Leaderboard Section */
.leaderboard-section {
    grid-column: 2;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 24px;
    padding: 24px;
    height: 100%;

    @media (max-width: 1024px) {
        grid-column: 1;
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

            /* Rank colors */
            &.rank-1 .rank {
                color: #f59e0b;
            }

            &.rank-2 .rank {
                color: #94a3b8;
            }

            &.rank-3 .rank {
                color: #b45309;
            }
        }
    }
}

/* Heatmap Grid */
.heatmap-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;

    @media (max-width: 600px) {
        grid-template-columns: repeat(2, 1fr);
    }

    .heat-item {
        position: relative;
        border-radius: 16px;
        overflow: hidden;
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        transition: transform 0.2s;

        &:hover {
            transform: scale(1.05);
            z-index: 2;
        }

        .heat-bg {
            position: absolute;
            inset: 0;
            background: var(--accent-primary);
            opacity: calc(0.1 + (var(--intensity) * 0.4));
            z-index: 0;
        }

        .heat-content {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
            align-items: center;

            .heat-rank {
                font-size: 0.8rem;
                font-weight: 800;
                opacity: 0.7;
                text-transform: uppercase;
            }

            .heat-title {
                font-size: 1rem;
                font-weight: 700;
                line-height: 1.2;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }

            .heat-count {
                font-size: 0.8rem;
                opacity: 0.8;
            }
        }
    }
}

/* Danger Cloud */
.danger-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-content: flex-start;

    .danger-chip {
        /* Severity variable from 0 to 1 */
        --red-base: 239, 68, 68;
        background: rgba(var(--red-base), calc(0.1 + (var(--severity) * 0.3)));
        border: 1px solid rgba(var(--red-base), calc(0.2 + (var(--severity) * 0.5)));
        color: rgb(var(--red-base));
        padding: 10px 16px;
        border-radius: 50px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        transition: all 0.2s;

        &:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(var(--red-base), 0.2);
        }

        .danger-score {
            font-weight: 800;
            font-size: 1.1rem;
        }

        .danger-title {
            font-size: 0.9rem;
            opacity: 0.9;
        }
    }
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

.courses-section {
    margin-bottom: 40px;
    text-align: center;

    h2 {
        margin-bottom: 24px;
        font-size: 1.8rem;
    }
}

/* ... existing styles ... */
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
</style>
