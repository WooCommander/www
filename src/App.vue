<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Header from './components/Header.vue';

const isDark = ref(true);
const route = useRoute();
const router = useRouter();

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    isDark.value = savedTheme === 'dark';
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  updateThemeClass();
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

// Map route name to view name for Header compatibility or refactor Header
const currentView = computed(() => {
    const name = route.name as string;
    return (['study', 'quiz', 'leaderboard'].includes(name) ? name : 'study') as 'study' | 'quiz' | 'leaderboard';
});

const handleViewChange = (view: string) => {
    // Adapter for Header event -> Router
    if (view === 'study') router.push('/');
    else if (view === 'quiz') router.push('/quiz');
    else if (view === 'leaderboard') router.push('/leaderboard');
};
</script>

<template>
  <Header 
    :is-dark="isDark" 
    :current-view="currentView"
    @toggle-theme="toggleTheme" 
    @change-view="handleViewChange"
  />
  
  <router-view />
</template>

<style>
/* Global resets or shared styles if needed, 
   but specific styles should reside in components */
</style>
