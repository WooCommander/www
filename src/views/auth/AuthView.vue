<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../../services/supabase';

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
        <div class="auth-card">
            <h2>{{ isLogin ? 'Вход' : 'Регистрация' }}</h2>
            <p class="subtitle">Синхронизация прогресса и таблица лидеров</p>

            <form @submit.prevent="handleAuth" class="auth-form">
                <div class="form-group">
                    <label>Email</label>
                    <input v-model="email" type="email" required placeholder="example@mail.com" />
                </div>

                <div class="form-group">
                    <label>Пароль</label>
                    <input v-model="password" type="password" required placeholder="••••••" minlength="6" />
                </div>

                <div v-if="errorMsg" class="error-msg">
                    {{ errorMsg }}
                </div>

                <button type="submit" class="auth-btn" :disabled="loading">
                    {{ loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Создать аккаунт') }}
                </button>
            </form>

            <div class="toggle-mode">
                <span v-if="isLogin">Нет аккаунта? <a @click="isLogin = false">Регистрация</a></span>
                <span v-else>Есть аккаунт? <a @click="isLogin = true">Войти</a></span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.auth-container {
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-lg);
}

.auth-card {
    background: var(--bg-card);
    padding: var(--spacing-xl);
    border-radius: 24px;
    border: 1px solid var(--border-color);
    width: 100%;
    max-width: 400px;
    box-shadow: var(--shadow-lg);
}

h2 {
    text-align: center;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.subtitle {
    text-align: center;
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xl);
    font-size: 0.95rem;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;
}

input {
    padding: 12px;
    border-radius: 12px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    font-size: 1rem;
    transition: all 0.2s;
}

input:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
}

.auth-btn {
    margin-top: var(--spacing-sm);
    padding: 14px;
    background: var(--accent-primary);
    color: white;
    border-radius: 12px;
    font-weight: 600;
    font-size: 1rem;
    transition: opacity 0.2s;
}

.auth-btn:disabled {
    opacity: 0.7;
    cursor: wait;
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
    margin-top: var(--spacing-lg);
    text-align: center;
    font-size: 0.95rem;
    color: var(--text-secondary);
}

a {
    color: var(--accent-primary);
    cursor: pointer;
    font-weight: 600;
}

a:hover {
    text-decoration: underline;
}
</style>
