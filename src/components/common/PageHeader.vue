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
    .page-header {
        margin-bottom: var(--spacing-md);
        text-align: left;
        /* Often looks better on mobile than center */
    }

    h2 {
        font-size: 1.5rem;
        margin-bottom: 4px;
    }

    p {
        font-size: 0.9rem;
        padding: 0;
        line-height: 1.4;
        display: none;
        /* aggressive space saving: hide description on mobile? Or just make small */
    }
}
</style>
