<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { AuthService } from '../services/AuthService';
import BaseButton from '../../../shared/ui/BaseButton.vue';
import BaseInput from '../../../shared/ui/BaseInput.vue';
import BaseCard from '../../../shared/ui/BaseCard.vue';

const router = useRouter();
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

const handleUpdatePassword = async () => {
    loading.value = true;
    errorMsg.value = '';

    try {
        if (password.value !== confirmPassword.value) {
            throw new Error('Пароли не совпадают');
        }

        const { error } = await AuthService.updateUserPassword(password.value);
        if (error) throw error;

        successMsg.value = 'Пароль успешно обновлен! Перенаправление...';
        setTimeout(() => {
            router.push('/');
        }, 2000);
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
                    <h2>Новый пароль</h2>
                    <p class="subtitle">Придумайте новый надежный пароль</p>
                </div>
            </template>

            <form @submit.prevent="handleUpdatePassword" class="auth-form">
                <BaseInput v-model="password" label="Новый пароль" type="password" placeholder="••••••" :minlength="6"
                    required />

                <BaseInput v-model="confirmPassword" label="Подтвердите пароль" type="password" placeholder="••••••"
                    :minlength="6" required />

                <div v-if="errorMsg" class="error-msg">
                    {{ errorMsg }}
                </div>

                <div v-if="successMsg" class="success-msg">
                    {{ successMsg }}
                </div>

                <BaseButton type="submit" variant="primary" block :loading="loading">
                    Обновить пароль
                </BaseButton>
            </form>
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
    margin-bottom: var(--spacing-md);

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

.success-msg {
    color: #10b981;
    font-size: 0.9rem;
    text-align: center;
    padding: 8px;
    background: rgba(16, 185, 129, 0.1);
    border-radius: 8px;
}
</style>
