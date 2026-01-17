<script setup lang="ts">
import { useSlots, computed } from 'vue';

const props = defineProps<{
    fixedHeight?: boolean;
}>();

const slots = useSlots();
const hasSidebar = computed(() => !!slots.sidebar);
</script>

<template>
    <div class="container-wide main-layout" :class="{ 'fixed-height': fixedHeight }">
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
    padding: var(--spacing-md) var(--spacing-lg) var(--spacing-lg) var(--spacing-lg);
}

.container-wide.fixed-height {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding-bottom: 0;
}

.layout-header {
    margin-bottom: 0;
    flex-shrink: 0;
}

/* grid-template-columns default 1fr */
.content-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
    align-items: start;
    min-height: 80vh;
}

.fixed-height .content-grid {
    flex: 1;
    overflow: hidden;
    min-height: 0;
    /* Important for flex child to shrink */
    align-items: stretch;
    /* Stretch to fill height */
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
    border-radius: 16px;
    border: 1px solid var(--border-color);
    padding: 1rem;
    /* Decreased from var(--spacing-lg) */
    display: flex;
    flex-direction: column;
}

.fixed-height .layout-sidebar {
    position: relative;
    top: 0;
    height: auto;
    /* Allow shrinking */
    max-height: 100%;
    /* But don't overflow viewport */
    overflow: hidden;
    overflow-y: auto;
    align-self: start;
    /* Prevent grid stretch */
}



.fixed-height .layout-content {
    height: 100%;
    overflow-y: auto;
    padding-bottom: 2rem;
    padding-right: 10px;
    /* Space for scrollbar */
}

.layout-mobile-nav {
    display: none;
    /* Hidden on desktop */
}

/* Scrollbar Styling for fixed areas */
.fixed-height .layout-sidebar::-webkit-scrollbar,
.fixed-height .layout-content::-webkit-scrollbar {
    width: 6px;
}

.fixed-height .layout-sidebar::-webkit-scrollbar-track,
.fixed-height .layout-content::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
}

.fixed-height .layout-sidebar::-webkit-scrollbar-thumb,
.fixed-height .layout-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
}

/* Responsive Logic */
@media (max-width: 1024px) {
    .content-grid {
        display: block;
        /* Stack on mobile */
    }

    .fixed-height .content-grid {
        display: flex;
        flex-direction: column;
    }

    .fixed-height .layout-content {
        padding-right: 0;
        scrollbar-width: none;
        /* Firefox */
        -ms-overflow-style: none;
        /* IE/Edge */
    }

    .fixed-height .layout-content::-webkit-scrollbar {
        display: none;
        /* Chrome/Safari */
    }

    .layout-sidebar {
        display: none;
        /* Hide desktop sidebar */
    }

    .layout-mobile-nav {
        display: block;
        /* Show mobile nav */
        /* margin-bottom: var(--spacing-lg); */
        flex-shrink: 0;
    }
}

@media (max-width: 640px) {
    .container-wide {
        padding: var(--spacing-md) var(--spacing-sm);
    }
}
</style>
