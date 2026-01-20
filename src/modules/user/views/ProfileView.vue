<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { AuthService } from '../../auth/services/AuthService';
import { UserProfileService } from '../services/UserProfileService';
import type { UserProfile } from '../../../shared/types';
import { useRouter } from 'vue-router';
import MainLayout from '../../../shared/layout/MainLayout.vue';
import { QuestionStore } from '../../../services/QuestionStore';
import BaseButton from '../../../shared/ui/BaseButton.vue';
import BaseInput from '../../../shared/ui/BaseInput.vue';
import BaseCard from '../../../shared/ui/BaseCard.vue';

import { GamificationService, type Achievement } from '../services/GamificationService';

const router = useRouter();
const loading = ref(true);
const saving = ref(false);
const user = ref<any>(null);

const profile = ref<Partial<UserProfile>>({
    username: '',
    avatar_url: '',
    xp: 0,
    role: undefined
});

const achievements = ref<Achievement[]>([]);
const userUnlocks = ref<Set<string>>(new Set());

const level = computed(() => Math.floor((profile.value.xp || 0) / 1000) + 1);
const xpProgress = computed(() => ((profile.value.xp || 0) % 1000) / 1000 * 100);
const nextLevelXp = computed(() => level.value * 1000);

onMounted(async () => {
    const session = await AuthService.getSession();
    if (!session) {
        router.push('/auth');
        return;
    }
    user.value = session.user;

    // Fetch profile and gamification data parallel
    const [profileData, allAchievements, unlocks] = await Promise.all([
        UserProfileService.getProfile(session.user.id),
        GamificationService.getAchievements(),
        GamificationService.getUserUnlocks(session.user.id)
    ]);

    if (profileData) {
        profile.value = {
            username: profileData.username || '',
            avatar_url: profileData.avatar_url || '',
            xp: profileData.xp || 0,
            role: profileData.role
        };
    }

    achievements.value = allAchievements;
    userUnlocks.value = unlocks;

    loading.value = false;
});

const updateProfile = async () => {
    saving.value = true;
    try {
        const updates = {
            id: user.value.id,
            username: profile.value.username,
            avatar_url: profile.value.avatar_url,
            updated_at: new Date().toISOString()
        };

        const { error } = await UserProfileService.updateProfile(updates);
        if (error) throw error;
        alert('Профиль обновлен!');
    } catch (error: any) {
        alert(error.message);
    } finally {
        saving.value = false;
    }
};

const signOut = async () => {
    await AuthService.signOut();
    router.push('/auth');
};

// --- Statistics & Analysis ---

const history = computed(() => {
    return [...QuestionStore.state.examHistory].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
});

const totalScore = computed(() => {
    return history.value.reduce((acc, curr) => acc + (curr.correct || 0), 0);
});

const quizzesPassed = computed(() => {
    return history.value.length;
});

const totalTimeSpent = computed(() => {
    return history.value.reduce((acc, curr) => acc + (curr.timeTaken || 0), 0);
});

const topicInsights = computed(() => {
    if (history.value.length === 0) return null;

    const topics: Record<string, { totalScore: number; count: number; title: string }> = {};

    history.value.forEach(h => {
        if (!topics[h.title]) {
            topics[h.title] = { totalScore: 0, count: 0, title: h.title };
        }
        const topic = topics[h.title];
        if (topic) {
            topic.totalScore += h.score;
            topic.count += 1;
        }
    });

    const averages = Object.values(topics).map(t => ({
        title: t.title,
        avg: t.totalScore / t.count
    }));

    averages.sort((a, b) => b.avg - a.avg);

    return {
        strongest: averages[0],
        weakest: averages[averages.length - 1]
    };
});

const formatTime = (seconds: number) => {
    if (!seconds) return '0м';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}ч ${m}м`;
    return `${m}м`;
};

const formatDuration = (seconds: number) => {
    const m = Math.floor((seconds || 0) / 60);
    const s = (seconds || 0) % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short'
    });
};

const clearHistory = () => {
    if (confirm('Вы уверены, что хотите очистить всю историю прохождений?')) {
        QuestionStore.state.examHistory = [];
        localStorage.removeItem('quiz_history');
    }
};

</script>

<template>
    <MainLayout fixed-height>
        <template #header>
            <PageHeader title="Профиль" description="Управление аккаунтом" />
        </template>

        <template #content>
            <div class="dashboard-container">
                <div v-if="loading" class="loading-state">
                    Загрузка профиля...
                </div>

                <div v-else class="dashboard-content">

                    <!-- User Profile Card -->
                    <BaseCard class="profile-card" padding="lg">
                        <form @submit.prevent="updateProfile" class="profile-form">

                            <div class="avatar-section">
                                <div class="avatar-placeholder">
                                    {{ profile.username ? profile.username.charAt(0).toUpperCase() : 'U' }}
                                </div>
                                <div class="user-meta">
                                    <div class="level-badge">LEVEL {{ level }}</div>
                                    <div class="xp-bar-container" :title="`${profile.xp}/${nextLevelXp} XP`">
                                        <div class="xp-bar-fill" :style="{ width: xpProgress + '%' }"></div>
                                    </div>
                                    <p class="email-text">{{ user.email }}</p>
                                </div>
                            </div>

                            <!-- Achievements Grid -->
                            <div class="achievements-section">
                                <h3>Достижения ({{ userUnlocks.size }}/{{ achievements.length }})</h3>
                                <div class="achievements-grid">
                                    <div v-for="ach in achievements" :key="ach.id" class="achievement-item"
                                        :class="{ locked: !userUnlocks.has(ach.id) }"
                                        :title="!userUnlocks.has(ach.id) ? ach.description : 'Разблокировано!'">
                                        <div class="ach-icon">{{ ach.icon }}</div>
                                        <div class="ach-meta" v-if="userUnlocks.has(ach.id)">
                                            <span class="ach-title">{{ ach.title }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <BaseInput :modelValue="profile.username || ''"
                                @update:modelValue="val => profile.username = String(val)" label="Имя пользователя"
                                placeholder="Ваше имя" />

                            <div class="actions">
                                <BaseButton v-if="profile.role === 'admin'" type="button" variant="secondary"
                                    @click="router.push('/admin')">
                                    👑 Админка
                                </BaseButton>

                                <BaseButton type="submit" variant="primary" :loading="saving">
                                    Сохранить
                                </BaseButton>

                                <BaseButton type="button" variant="danger" @click="signOut">
                                    Выйти
                                </BaseButton>
                                <BaseButton type="button" variant="secondary" @click="router.push('/about')">
                                    ℹ️ О программе
                                </BaseButton>
                            </div>
                        </form>
                    </BaseCard>

                    <!-- Stat Cards -->
                    <div class="stats-grid">
                        <div class="stat-card blue">
                            <span class="stat-value">{{ totalScore }}</span>
                            <span class="stat-label">Всего баллов</span>
                        </div>
                        <div class="stat-card green">
                            <span class="stat-value">{{ quizzesPassed }}</span>
                            <span class="stat-label">Тестов пройдено</span>
                        </div>
                        <div class="stat-card purple">
                            <span class="stat-value">{{ formatTime(totalTimeSpent) }}</span>
                            <span class="stat-label">Время в учебе</span>
                        </div>
                    </div>

                    <!-- Topic Insights -->
                    <div class="insights-row" v-if="topicInsights">
                        <div class="insight-card good">
                            <span class="insight-icon">💪</span>
                            <div class="insight-info">
                                <span class="insight-label">Сильная тема</span>
                                <span class="insight-value">{{ topicInsights.strongest?.title || 'Нет данных' }}</span>
                                <span class="insight-score">{{ Math.round(topicInsights.strongest?.avg || 0) }}% ср.
                                    балл</span>
                            </div>
                        </div>
                        <div class="insight-card bad"
                            v-if="topicInsights.weakest && topicInsights.strongest && topicInsights.weakest.title !== topicInsights.strongest.title">
                            <span class="insight-icon">🎯</span>
                            <div class="insight-info">
                                <span class="insight-label">Нужна практика</span>
                                <span class="insight-value">{{ topicInsights.weakest?.title || 'Нет данных' }}</span>
                                <span class="insight-score">{{ Math.round(topicInsights.weakest?.avg || 0) }}% ср.
                                    балл</span>
                            </div>
                        </div>
                    </div>

                    <!-- History Section -->
                    <BaseCard class="history-section" padding="none">
                        <template #header>
                            <div class="history-header">
                                <h2>История активности</h2>
                                <BaseButton v-if="history.length > 0" variant="ghost" size="sm" @click="clearHistory">
                                    Очистить
                                </BaseButton>
                            </div>
                        </template>

                        <div v-if="history.length === 0" class="empty-history">
                            <p>Пока пусто. Начните проходить тесты!</p>
                        </div>

                        <div v-else class="history-list">
                            <div v-for="item in history" :key="item.id || item.date" class="history-item">
                                <div class="h-left">
                                    <span class="h-title">{{ item.title }}</span>
                                    <span class="h-date">{{ formatDate(item.date) }}</span>
                                </div>
                                <div class="h-right">
                                    <div class="h-score" :class="{
                                        'good': item.score >= 80,
                                        'avg': item.score >= 50 && item.score < 80,
                                        'bad': item.score < 50
                                    }">
                                        {{ item.score }}%
                                    </div>
                                    <span class="h-details">
                                        {{ item.correct }}/{{ item.total }} • {{ formatDuration(item.timeTaken) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </BaseCard>

                </div>
            </div>
        </template>
    </MainLayout>
</template>

<style scoped lang="scss">
.dashboard-container {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--spacing-lg) 0;
}

.dashboard-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* User Card Styles */
.profile-card {
    .profile-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .avatar-section {
        display: flex;
        align-items: center;
        gap: 16px;

        .avatar-placeholder {
            width: 60px;
            height: 60px;
            flex-shrink: 0;
            /* Prevent shrinking on mobile */
            border-radius: 50%;
            background: var(--accent-primary);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            font-weight: bold;
        }

        .user-meta {
            display: flex;
            flex-direction: column;
            width: 100%;

            .level-badge {
                font-weight: 800;
                color: var(--accent-primary);
                font-size: 0.9rem;
                letter-spacing: 1px;
            }

            .xp-bar-container {
                height: 6px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                margin: 6px 0;
                overflow: hidden;
                width: 100%;
                max-width: 200px;
            }

            .xp-bar-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--accent-primary), #a855f7);
                border-radius: 3px;
                transition: width 0.5s ease;
            }

            .email-text {
                color: var(--text-secondary);
                font-size: 0.85rem;
                margin: 0;
            }
        }
    }

    .achievements-section {
        margin-top: 10px;

        h3 {
            font-size: 1rem;
            margin-bottom: 12px;
            color: var(--text-secondary);
        }

        .achievements-grid {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }

        .achievement-item {
            display: flex;
            align-items: center;
            gap: 8px;
            background: var(--bg-secondary);
            padding: 6px 10px;
            border-radius: 8px;
            border: 1px solid var(--accent-primary);
            transition: all 0.2s;
            cursor: help;

            &.locked {
                border-color: transparent;
                opacity: 0.5;
                filter: grayscale(100%);
                background: rgba(255, 255, 255, 0.05);
            }

            .ach-icon {
                font-size: 1.2rem;
            }

            .ach-title {
                font-size: 0.8rem;
                font-weight: 600;
            }
        }
    }

    .actions {
        display: flex;
        gap: 12px;
        margin-top: 8px;

        button {
            flex: 1;
        }

        @media (max-width: 600px) {
            flex-direction: column;
            gap: 8px;

            button {
                width: 100%;
                padding: 10px;
                /* Ensure touch target is good but not huge */
                font-size: var(--fs-body);
                /* Use standard body size */
            }
        }
    }
}

/* Stat Cards */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;

    @media (max-width: 600px) {
        grid-template-columns: 1fr;
    }

    .stat-card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 16px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow: hidden;

        &.blue {
            border-bottom: 4px solid #3b82f6;
        }

        &.green {
            border-bottom: 4px solid #22c55e;
        }

        &.purple {
            border-bottom: 4px solid #a855f7;
        }

        .stat-value {
            font-size: 1.8rem;
            font-weight: 800;
            color: var(--text-primary);
        }

        .stat-label {
            font-size: 0.85rem;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
    }
}

/* Topic Insights */
.insights-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;

    @media (max-width: 600px) {
        grid-template-columns: 1fr;
    }

    .insight-card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 16px;
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 12px;

        &.good {
            background: rgba(34, 197, 94, 0.05);
            border-color: rgba(34, 197, 94, 0.2);
        }

        &.bad {
            background: rgba(239, 68, 68, 0.05);
            border-color: rgba(239, 68, 68, 0.2);
        }

        .insight-icon {
            font-size: 2rem;
        }

        .insight-info {
            display: flex;
            flex-direction: column;

            .insight-label {
                font-size: 0.75rem;
                color: var(--text-secondary);
                text-transform: uppercase;
            }

            .insight-value {
                font-weight: 700;
                color: var(--text-primary);
            }

            .insight-score {
                font-size: 0.8rem;
                opacity: 0.8;
            }
        }
    }
}

/* History Section */
.history-section {
    max-height: 500px;
    display: flex;
    flex-direction: column;

    /* Ensure BaseCard content area scrolls */
    :deep(.card-body) {
        overflow-y: auto;
        padding: 0;
    }
}

.history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    h2 {
        margin: 0;
        font-size: 1.1rem;
    }
}

.history-list {
    display: flex;
    flex-direction: column;
}

.empty-history {
    padding: 40px;
    text-align: center;
    color: var(--text-secondary);
}

.history-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);

    &:last-child {
        border-bottom: none;
    }

    .h-left {
        display: flex;
        flex-direction: column;

        .h-title {
            font-weight: 600;
            color: var(--text-primary);
        }

        .h-date {
            font-size: 0.8rem;
            color: var(--text-secondary);
        }
    }

    .h-right {
        text-align: right;
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .h-score {
            font-weight: 800;
            font-family: 'Fira Code', monospace;

            &.good {
                color: #22c55e;
            }

            &.avg {
                color: #f59e0b;
            }

            &.bad {
                color: #ef4444;
            }
        }

        .h-details {
            font-size: 0.75rem;
            color: var(--text-secondary);
        }
    }
}
</style>
