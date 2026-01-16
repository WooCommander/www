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

// History Logic
const history = computed(() => {
    // Return all local history sorted by date desc
    return [...QuestionStore.state.examHistory].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
});

const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatTime = (seconds: number) => {
    const m = Math.floor((seconds || 0) / 60);
    const s = (seconds || 0) % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
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
            <div class="profile-container">
                <h1>👤 Личный кабинет</h1>

                <div v-if="loading" class="loading">Загрузка...</div>

                <div v-else class="profile-content">
                    <div class="profile-card">
                        <div class="field">
                            <label>Email</label>
                            <input :value="user.email" disabled class="disabled-input" />
                        </div>

                        <div class="field">
                            <label>Имя пользователя</label>
                            <input v-model="profile.username" placeholder="Придумайте никнейм" />
                        </div>

                        <div class="stats">
                            <div class="stat-item">
                                <span class="value">{{ profile.xp || 0 }}</span>
                                <span class="label">XP</span>
                            </div>
                        </div>

                        <div class="actions">
                            <button class="save-btn" @click="updateProfile" :disabled="saving">
                                {{ saving ? 'Сохранение...' : 'Сохранить изменения' }}
                            </button>

                            <button class="logout-btn" @click="signOut">
                                Выйти из аккаунта
                            </button>
                        </div>
                    </div>

                    <div class="history-section">
                        <div class="history-header">
                            <h2>📜 История прохождений</h2>
                            <button v-if="history.length > 0" class="clear-btn" @click="clearHistory">Очистить</button>
                        </div>

                        <div v-if="history.length === 0" class="empty-history">
                            <p>История пуста. Пройдите свой первый тест!</p>
                        </div>

                        <div v-else class="history-list">
                            <div v-for="item in history" :key="item.id || item.date" class="history-item">
                                <div class="item-header">
                                    <span class="quiz-title">{{ item.title }}</span>
                                    <span class="quiz-date">{{ formatDate(item.date) }}</span>
                                </div>
                                <div class="item-stats">
                                    <div class="stat-badge" :class="{
                                        'good': item.score >= 80,
                                        'avg': item.score >= 50 && item.score < 80,
                                        'bad': item.score < 50
                                    }">
                                        {{ item.score }}%
                                    </div>
                                    <span class="details">
                                        ✅ {{ item.correct }}/{{ item.total }}
                                    </span>
                                    <span class="details">
                                        ⏱️ {{ formatTime(item.timeTaken) }}
                                    </span>
                                    <span class="mode-badge">{{ item.mode === 'exam' ? 'Экзамен' : (item.mode ===
                                        'category' ? 'Категория' : 'Тема') }}</span>
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
.profile-container {
    max-width: 600px;
    margin: 0 auto;
    padding: var(--spacing-xl) 0;
}

h1 {
    text-align: center;
    margin-bottom: var(--spacing-xl);
}

.profile-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.profile-card {
    background: var(--bg-card);
    padding: var(--spacing-xl);
    border-radius: 24px;
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.field {
    display: flex;
    flex-direction: column;
    gap: 8px;

    label {
        color: var(--text-secondary);
        font-size: 0.9rem;
    }

    input {
        padding: 12px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        color: var(--text-primary);
        font-size: 1rem;

        &.disabled-input {
            opacity: 0.7;
            cursor: not-allowed;
        }
    }
}

.stats {
    display: flex;
    justify-content: center;
    padding: var(--spacing-lg);
    background: var(--bg-secondary);
    border-radius: 16px;

    .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;

        .value {
            font-size: 2rem;
            font-weight: 700;
            color: var(--accent-primary);
        }

        .label {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }
    }
}

.actions {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: var(--spacing-md);
}

.save-btn {
    padding: 14px;
    background: var(--accent-primary);
    color: white;
    border-radius: 12px;
    font-weight: 600;
    transition: opacity 0.2s;

    &:disabled {
        opacity: 0.7;
    }
}

.logout-btn {
    padding: 14px;
    background: transparent;
    border: 1px solid #ef4444;
    color: #ef4444;
    border-radius: 12px;
    font-weight: 600;
    transition: all 0.2s;

    &:hover {
        background: rgba(239, 68, 68, 0.1);
    }
}

/* History Section */
.history-section {
    background: var(--bg-card);
    border-radius: 24px;
    border: 1px solid var(--border-color);
    padding: var(--spacing-xl);
}

.history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
        font-size: 1.2rem;
        margin: 0;
    }
}

.clear-btn {
    padding: 4px 12px;
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;

    &:hover {
        background: rgba(239, 68, 68, 0.2);
    }
}

.empty-history {
    text-align: center;
    padding: 20px;
    color: var(--text-secondary);
    font-style: italic;
}

.history-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.history-item {
    background: var(--bg-secondary);
    padding: 12px;
    border-radius: 12px;
    border: 1px solid var(--border-color);
}

.item-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;

    .quiz-title {
        font-weight: 600;
        color: var(--text-primary);
    }

    .quiz-date {
        font-size: 0.8rem;
        color: var(--text-secondary);
    }
}

.item-stats {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    font-size: 0.9rem;

    .stat-badge {
        font-weight: bold;
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

    .details {
        color: var(--text-secondary);
    }

    .mode-badge {
        font-size: 0.75rem;
        padding: 2px 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        margin-left: auto;
    }
}
</style>
