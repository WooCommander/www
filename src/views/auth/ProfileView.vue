<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase } from '../../services/supabase';
import { useRouter } from 'vue-router';
import MainLayout from '../../components/layout/MainLayout.vue';

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
    const { data, error } = await supabase
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
</script>

<template>
    <MainLayout>
        <template #content>
            <div class="profile-container">
                <h1>👤 Личный кабинет</h1>

                <div v-if="loading" class="loading">Загрузка...</div>

                <div v-else class="profile-card">
                    <div class="field">
                        <label>Email</label>
                        <input :value="user.email" disabled class="disabled-input" />
                    </div>

                    <div class="field">
                        <label>Имя пользователя</label>
                        <input v-model="profile.username" placeholder="Придумайте никнейм" />
                    </div>

                    <!-- Future: Avatar Upload -->
                    <!-- <div class="field">
                <label>Ссылка на аватар</label>
                <input v-model="profile.avatar_url" placeholder="https://..." />
            </div> -->

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
</style>
