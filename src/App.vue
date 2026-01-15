<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Header from './components/Header.vue';
import { QuestionStore } from './services/QuestionStore';

const isDark = ref(true);

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
</script>

<template>
  <div class="app-shell">
    <Header :is-dark="isDark" @toggle-theme="toggleTheme" />

    <div class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" class="view-content" />
        </transition>
      </router-view>
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
  overflow: hidden;
  /* Views handle their own scrolling */
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
