<script setup lang="ts">
import { useRouter } from 'vue-router';
import MainLayout from '../shared/layout/MainLayout.vue';
import PageHeader from '../components/common/PageHeader.vue';
import BaseCard from '../shared/ui/BaseCard.vue';
import BaseButton from '../shared/ui/BaseButton.vue';

const router = useRouter();
const version = __APP_VERSION__;
const year = new Date().getFullYear();
</script>

<template>
    <MainLayout fixed-height>
        <template #header>
            <PageHeader title="О приложении" show-back />
        </template>

        <template #content>
            <div class="about-container">
                <BaseCard class="about-card" padding="lg">
                    <div class="logo-section">
                        <div class="logo-placeholder">🚀</div>
                        <h1>TS Prep</h1>
                        <div class="version-badge">v{{ version }}</div>
                    </div>

                    <div class="info-section">
                        <p>
                            Приложение для подготовки к собеседованиям по TypeScript.
                            Изучайте вопросы, проходите квизы и отслеживайте свой прогресс.
                        </p>
                    </div>

                    <div class="footer-section">
                        <p class="copyright">© {{ year }} TS Interview Prep</p>
                        <p class="build-info">Build: {{ version }}</p>
                    </div>

                    <div class="actions">
                        <BaseButton variant="secondary" @click="router.back()">
                            Назад
                        </BaseButton>
                    </div>
                </BaseCard>
            </div>
        </template>
    </MainLayout>
</template>

<style scoped lang="scss">
.about-container {
    max-width: 600px;
    margin: 0 auto;
    padding: var(--spacing-lg) 0;
}

.about-card {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.logo-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    .logo-placeholder {
        font-size: 4rem;
        margin-bottom: 8px;
    }

    h1 {
        margin: 0;
        font-size: 2rem;
        background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .version-badge {
        background: rgba(255, 255, 255, 0.1);
        padding: 4px 12px;
        border-radius: 12px;
        font-family: 'Fira Code', monospace;
        font-size: 0.9rem;
        color: var(--text-secondary);
    }
}

.info-section {
    color: var(--text-secondary);
    line-height: 1.6;
}

.footer-section {
    margin-top: auto;

    p {
        margin: 4px 0;
        font-size: 0.8rem;
        color: var(--text-muted);
    }
}
</style>
