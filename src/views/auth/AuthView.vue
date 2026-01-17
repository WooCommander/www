<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../../services/supabase';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseInput from '../../components/ui/BaseInput.vue';
import BaseCard from '../../components/ui/BaseCard.vue';

const router = useRouter();
const isLogin = ref(true);
const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMsg = ref('');

const handleAuth = async () => {
    loading.value = true;
    errorMsg.value = '';

    try {
        if (isLogin.value) {
            const { error } = await supabase.auth.signInWithPassword({
                email: email.value,
                password: password.value
            });
            if (error) throw error;
        } else {
            const { error } = await supabase.auth.signUp({
                email: email.value,
                password: password.value
            });
            if (error) throw error;
            // Optionally auto-login or show "Check email" message
        }

        // Success
        router.push('/');
    } catch (e: any) {
        errorMsg.value = e.message;
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="auth-container">
        <BaseCard class="auth-card-custom" padding="lg">
            <template #header>
                <div class="header-content">
                    <h2>{{ isLogin ? 'Вход' : 'Регистрация' }}</h2>
                    <p class="subtitle">Синхронизация прогресса и таблица лидеров</p>
                </div>
            </template>

            <form @submit.prevent="handleAuth" class="auth-form">
                <BaseInput v-model="email" label="Email" type="email" placeholder="example@mail.com" required />

                <BaseInput v-model="password" label="Пароль" type="password" placeholder="••••••" :minlength="6"
                    required />

                <div v-if="errorMsg" class="error-msg">
                    {{ errorMsg }}
                </div>

                <BaseButton type="submit" variant="primary" block :loading="loading">
                    {{ isLogin ? 'Войти' : 'Создать аккаунт' }}
                </BaseButton>
            </form>

            <template #footer>
                <div class="toggle-mode">
                    <span v-if="isLogin">Нет аккаунта? <a @click="isLogin = false">Регистрация</a></span>
                    <span v-else>Есть аккаунт? <a @click="isLogin = true">Войти</a></span>
                </div>
            </template>
        </BaseCard>
    </div>
</template>

<style scoped lang="scss">
.auth-container {
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-lg);
}

.auth-card-custom {
    width: 100%;
    max-width: 440px;
}

.header-content {
    text-align: center;
    width: 100%;

    h2 {
        color: var(--text-primary);
        margin-bottom: 4px;
    }

    .subtitle {
        color: var(--text-secondary);
        font-size: 0.9rem;
        margin: 0;
    }
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.error-msg {
    color: #ef4444;
    font-size: 0.9rem;
    text-align: center;
    padding: 8px;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 8px;
}

.toggle-mode {
    text-align: center;
    font-size: 0.9rem;
    color: var(--text-secondary);
    width: 100%;

    a {
        color: var(--accent-primary);
        cursor: pointer;
        font-weight: 600;

        &:hover {
            text-decoration: underline;
        }
    }
}
</style>
