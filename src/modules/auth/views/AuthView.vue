<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { AuthService } from '../services/AuthService';
import BaseButton from '../../../shared/ui/BaseButton.vue';
import BaseInput from '../../../shared/ui/BaseInput.vue';
import BaseCard from '../../../shared/ui/BaseCard.vue';

const router = useRouter();
const route = useRoute();
type AuthMode = 'login' | 'signup' | 'forgot';
const mode = ref<AuthMode>('login');

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

const isLogin = computed(() => mode.value === 'login');
const isSignup = computed(() => mode.value === 'signup');
const isForgot = computed(() => mode.value === 'forgot');

const title = computed(() => {
    if (isLogin.value) return 'Вход';
    if (isSignup.value) return 'Регистрация';
    return 'Восстановление пароля';
});

const subtitle = computed(() => {
    if (isLogin.value) return 'С возвращением! Продолжим обучение?';
    if (isSignup.value) return 'Создайте аккаунт для сохранения прогресса';
    return 'Введите email для сброса пароля';
});

const handleAuth = async () => {
    loading.value = true;
    errorMsg.value = '';
    successMsg.value = '';

    try {
        if (isLogin.value) {
            const { error } = await AuthService.signIn(email.value, password.value);
            if (error) throw error;
            const redirectPath = (route.query.redirect as string) || '/';
            router.push(redirectPath);
        } else if (isSignup.value) {
            if (password.value !== confirmPassword.value) {
                throw new Error('Пароли не совпадают');
            }
            const { error } = await AuthService.signUp(email.value, password.value);
            if (error) throw error;
            successMsg.value = 'Аккаунт создан! Проверьте почту для подтверждения.';
        } else if (isForgot.value) {
            const { error } = await AuthService.resetPasswordForEmail(email.value);
            if (error) throw error;
            successMsg.value = 'Ссылка для сброса пароля отправлена на email.';
        }
    } catch (e: any) {
        errorMsg.value = e.message;
    } finally {
        loading.value = false;
    }
};



const switchMode = (newMode: AuthMode) => {
    mode.value = newMode;
    errorMsg.value = '';
    successMsg.value = '';
};
</script>

<template>
    <div class="auth-container">
        <BaseCard class="auth-card-custom" padding="lg">
            <template #header>
                <div class="header-content">
                    <h2>{{ title }}</h2>
                    <p class="subtitle">{{ subtitle }}</p>
                </div>
            </template>

            <form @submit.prevent="handleAuth" class="auth-form">
                <BaseInput v-model="email" label="Email" type="email" placeholder="example@mail.com" required />

                <template v-if="!isForgot">
                    <BaseInput v-model="password" label="Пароль" type="password" placeholder="••••••" :minlength="6"
                        required />

                    <div v-if="isLogin" class="forgot-link">
                        <a @click="switchMode('forgot')">Забыли пароль?</a>
                    </div>
                </template>

                <template v-if="isSignup">
                    <BaseInput v-model="confirmPassword" label="Подтвердите пароль" type="password" placeholder="••••••"
                        :minlength="6" required />
                </template>

                <div v-if="errorMsg" class="error-msg">
                    {{ errorMsg }}
                </div>

                <div v-if="successMsg" class="success-msg">
                    {{ successMsg }}
                </div>

                <BaseButton type="submit" variant="primary" block :loading="loading">
                    {{ isLogin ? 'Войти' : isSignup ? 'Создать аккаунт' : 'Отправить ссылку' }}
                </BaseButton>
            </form>

            <template #footer>
                <div class="toggle-mode">
                    <template v-if="isLogin">
                        Нет аккаунта? <a @click="switchMode('signup')">Регистрация</a>
                    </template>
                    <template v-else-if="isSignup">
                        Есть аккаунт? <a @click="switchMode('login')">Войти</a>
                    </template>
                    <template v-else>
                        <a @click="switchMode('login')">Вернуться ко входу</a>
                    </template>
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
    background: var(--surface-card);
    /* Ensure card background */
    border: 1px solid var(--border-color);
    /* Subtle border */
    box-shadow: var(--shadow-lg);
    /* Nice shadow */
}

.header-content {
    text-align: center;
    width: 100%;

    h2 {
        color: var(--text-primary);
        margin-bottom: 8px;
        font-size: 1.75rem;
        font-weight: 700;
    }

    .subtitle {
        color: var(--text-secondary);
        font-size: 0.95rem;
        margin: 0;
        line-height: 1.5;
    }
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    margin-top: var(--spacing-md);
}

.forgot-link {
    text-align: right;
    font-size: 0.85rem;

    a {
        color: var(--text-secondary);
        cursor: pointer;
        transition: color 0.2s;

        &:hover {
            color: var(--accent-primary);
        }
    }
}

.error-msg {
    color: #ef4444;
    font-size: 0.9rem;
    text-align: center;
    padding: 10px;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(239, 68, 68, 0.2);
}

.success-msg {
    color: #10b981;
    font-size: 0.9rem;
    text-align: center;
    padding: 10px;
    background: rgba(16, 185, 129, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(16, 185, 129, 0.2);
}

.divider {
    display: flex;
    align-items: center;
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.85rem;
    margin: 4px 0;

    &::before,
    &::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid var(--border-color);
    }

    span {
        padding: 0 10px;
    }
}

.google-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--surface-0);
    color: var(--text-primary);
    font-weight: 500;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: var(--surface-hover);
        border-color: var(--text-secondary);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
}

.toggle-mode {
    text-align: center;
    font-size: 0.95rem;
    color: var(--text-secondary);
    width: 100%;
    margin-top: var(--spacing-sm);

    a {
        color: var(--accent-primary);
        cursor: pointer;
        font-weight: 600;
        margin-left: 4px;

        &:hover {
            text-decoration: underline;
        }
    }
}
</style>
