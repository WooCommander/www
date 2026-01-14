<script setup lang="ts">
import { useSlots, computed } from 'vue';

const slots = useSlots();
const hasSidebar = computed(() => !!slots.sidebar);
</script>

<template>
    <div class="container-wide main-layout">
        <!-- Header Slot (PageHeader goes here) -->
        <div v-if="$slots.header" class="layout-header">
            <slot name="header"></slot>
        </div>

        <div class="content-grid" :class="{ 'has-sidebar': hasSidebar }">
            <!-- Sidebar / Left Panel -->
            <aside v-if="$slots.sidebar" class="layout-sidebar">
                <slot name="sidebar"></slot>
            </aside>

            <!-- Mobile Top Nav (Optional equivalent to sidebar for mobile) -->
            <div v-if="$slots['mobile-nav']" class="layout-mobile-nav">
                <slot name="mobile-nav"></slot>
            </div>

            <!-- Main Content -->
            <main class="layout-content">
                <slot name="content"></slot>
                <!-- Default slot fallback -->
                <slot></slot>
            </main>
        </div>
    </div>
</template>

<style scoped>
.container-wide {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: var(--spacing-xl) var(--spacing-lg);
}

.layout-header {
    margin-bottom: var(--spacing-xl);
}

/* grid-template-columns default 1fr */
.content-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
    align-items: start;
    min-height: 80vh;
}

/* If sidebar present: 300px 1fr */
.content-grid.has-sidebar {
    grid-template-columns: 300px 1fr;
}


/* Sidebar Styling Wrapper */
.layout-sidebar {
    position: sticky;
    top: 100px;
    background: var(--bg-card);
    /* Optional default, can be overridden */
    border-radius: 16px;
    border: 1px solid var(--border-color);
    /* Optional default */
    /* padding: var(--spacing-lg); handled by slot content usually, or we enforce it? */
    /* Let's enforce padding here to ensure consistency unless overridden */
    padding: var(--spacing-lg);
}

.layout-mobile-nav {
    display: none;
    /* Hidden on desktop */
}

/* Responsive Logic */
@media (max-width: 1024px) {
    .content-grid {
        display: block;
        /* Stack on mobile */
    }

    .layout-sidebar {
        display: none;
        /* Hide desktop sidebar */
    }

    .layout-mobile-nav {
        display: block;
        /* Show mobile nav */
        margin-bottom: var(--spacing-lg);
    }
}

@media (max-width: 640px) {
    .container-wide {
        padding: var(--spacing-md) var(--spacing-sm);
    }
}
</style>
