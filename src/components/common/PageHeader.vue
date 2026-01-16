<script setup lang="ts">
defineProps<{
    title: string;
    description?: string;
}>();
</script>

<template>
    <div class="page-header">
        <h2>{{ title }}</h2>
        <p v-if="description">{{ description }}</p>
    </div>
</template>

<style scoped>
.page-header {
    text-align: center;
    margin-bottom: var(--spacing-lg);
}

h2 {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
    line-height: 1.2;
}

p {
    color: var(--text-secondary);
    font-size: 1.1rem;
}

@media (max-width: 640px) {
    h2 {
        font-size: 1.8rem;
    }

    p {
        font-size: 1rem;
        padding: 0 var(--spacing-sm);
    }
}
</style>
