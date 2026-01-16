<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../../services/supabase';
import { useRouter } from 'vue-router';
import MainLayout from '../../components/layout/MainLayout.vue';
import { QuestionStore } from '../../services/QuestionStore';

const router = useRouter();
const loading = ref(true);
const saving = ref(false);
const user = ref<any>(null);

const profile = ref({
    username: '',
    avatar_url: '',
    xp: 0
});

onMounted(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        router.push('/auth');
        return;
    }
    user.value = session.user;

    // Fetch profile
    const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (data) {
        profile.value = data;
    }
    loading.value = false;
});

const updateProfile = async () => {
    saving.value = true;
    try {
        const updates = {
            id: user.value.id,
            username: profile.value.username,
            avatar_url: profile.value.avatar_url,
            updated_at: new Date()
        };

        const { error } = await supabase.from('profiles').upsert(updates);
        if (error) throw error;
        alert('Профиль обновлен!');
    } catch (error: any) {
        alert(error.message);
    } finally {
        saving.value = false;
    }
};

const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
};

// --- Statistics & Analysis ---

const history = computed(() => {
    return [...QuestionStore.state.examHistory].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
});

const totalScore = computed(() => {
    // Score is percentage 0-100.
    // If we want "Total XP", we might sum correct answers?
    // Let's sum correct answers for "Points".
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
        topics[h.title].totalScore += h.score; // Using percentage score for "Strength"
        topics[h.title].count += 1;
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
    <MainLayout>
        <template #content>
            <div class="dashboard-container">
                <div class="header-row">
                    <h1>Личный кабинет</h1>
                    <button class="logout-btn-text" @click="signOut">Выйти</button>
                </div>

                <div v-if="loading" class="loading">Загрузка...</div>

                <div v-else class="dashboard-content">

                    <!-- Profile Edit Card (Collapsed or Compact) -->
                    <div class="section-card profile-edit">
                        <div class="user-header">
                            <div class="avatar-placeholder">{{ profile.username?.charAt(0)?.toUpperCase() || 'U' }}
                            </div>
                            <div class="user-fields">
                                <input v-model="profile.username" placeholder="Ваше имя" class="username-input" />
                                <span class="email-display">{{ user.email }}</span>
                            </div>
                            <button class="save-icon-btn" @click="updateProfile" :disabled="saving" title="Сохранить">
                                💾
                            </button>
                        </div>
                    </div>

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
                    <div class="section-card history-section">
                        <div class="section-header">
                            <h2>История активности</h2>
                            <button v-if="history.length > 0" class="mini-btn" @click="clearHistory">Очистить</button>
                        </div>

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
                    </div>

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

.header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 0 8px;

    h1 {
        margin: 0;
        font-size: 1.5rem;
    }

    .logout-btn-text {
        background: none;
        border: none;
        color: #ef4444;
        font-weight: 600;
        cursor: pointer;
    }
}

.dashboard-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* User Card */
.profile-edit {
    padding: 16px;

    .user-header {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .avatar-placeholder {
        width: 50px;
        height: 50px;
        flex-shrink: 0;
        /* Prevent squishing */
        background: var(--accent-primary);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        font-weight: bold;
    }

    .user-fields {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
        /* Allow text truncate if needed */
    }

    .username-input {
        background: transparent;
        border: none;
        font-size: 1.2rem;
        font-weight: bold;
        color: var(--text-primary);
        padding: 0;
        border-bottom: 1px dashed var(--border-color);
        width: 100%;

        &:focus {
            outline: none;
            border-bottom: 1px solid var(--accent-primary);
        }
    }

    .email-display {
        color: var(--text-secondary);
        font-size: 0.9rem;
        word-break: break-all;
        /* Ensure long emails don't overflow */
    }

    .save-icon-btn {
        background: transparent;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        width: 40px;
        height: 40px;
        flex-shrink: 0;
        /* Prevent squishing */
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        &:disabled {
            opacity: 0.5;
        }

        &:hover {
            background: var(--bg-secondary);
        }
    }
}

/* Stat Cards */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}

@media (max-width: 600px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }
}

.stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
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

/* Topic Insights */
.insights-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

@media (max-width: 600px) {
    .insights-row {
        grid-template-columns: 1fr;
    }
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
    }

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

/* History Section */
.section-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    overflow: hidden;
}

.history-section {
    display: flex;
    flex-direction: column;
    max-height: 500px;
    /* limits height */
}

.section-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-secondary);

    h2 {
        margin: 0;
        font-size: 1.1rem;
    }
}

.mini-btn {
    padding: 4px 8px;
    font-size: 0.75rem;
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    color: var(--text-secondary);
    cursor: pointer;

    &:hover {
        background: var(--bg-card);
        color: #ef4444;
        border-color: #ef4444;
    }
}

.history-list {
    overflow-y: auto;
    padding: 10px;
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
    }

    .h-title {
        font-weight: 600;
        color: var(--text-primary);
    }

    .h-date {
        font-size: 0.8rem;
        color: var(--text-secondary);
    }

    .h-right {
        text-align: right;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
    }

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
</style>
