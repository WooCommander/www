<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Header from './components/Header.vue';
import { QuestionStore } from './services/QuestionStore';
import ToastContainer from './shared/ui/ToastContainer.vue';
import { useSwipeNavigation } from './composables/useSwipeNavigation';
import PullToRefresh from './components/PullToRefresh.vue';

const isDark = ref(true);

// Initialize Swipe Back Gesture
useSwipeNavigation();

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    isDark.value = savedTheme === 'dark';
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  updateThemeClass();

  // Initialize data globally
  QuestionStore.initialize();
});

const toggleTheme = () => {
  isDark.value = !isDark.value;
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
  updateThemeClass();
};

const updateThemeClass = () => {
  if (isDark.value) {
    document.body.classList.remove('light-theme');
  } else {
    document.body.classList.add('light-theme');
  }
};

const handleRefresh = async () => {
  // Logic to refresh data
  // Since QuestionStore is the main data source, we might want to re-initialize it
  // or just reload the page for simplicity as requested "update screen" usually implies getting fresh data

  // Option 1: Full Page Reload (Simpler, guaranteed clean state)
  window.location.reload();

  // Option 2: Data Refresh (Smoother)
  // await QuestionStore.initialize();
  // However, QuestionStore.initialize might not force fetch if data is loaded.
  // Let's stick to reload for now as it covers all bases (including updates to the app itself if PWA)
};
</script>

<template>
  <div class="app-shell">
    <Header :is-dark="isDark" @toggle-theme="toggleTheme" />
    <ToastContainer />

    <div class="app-main">
      <PullToRefresh :on-refresh="handleRefresh">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" class="view-content" />
          </transition>
        </router-view>
      </PullToRefresh>
    </div>
  </div>
</template>

<style>
/* Global Layout Shell */
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
  /* Ensure bg covers everything */
}

.app-main {
  flex: 1;
  overflow: hidden;
  /* Prevent global scroll, delegation to views */
  display: flex;
  flex-direction: column;
  position: relative;
}

.view-content {
  flex: 1;
  height: 100%;
  /* Ensure view takes full height of app-main */
  overflow-y: auto;
  overflow-x: hidden;
  /* Views handle their own scrolling or let this container scroll */
}

/* Page Transitions */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
