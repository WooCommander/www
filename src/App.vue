<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Header from './components/Header.vue';
import StudyView from './components/StudyView.vue';
import QuizView from './components/QuizView.vue';

const isDark = ref(true);
const currentView = ref<'study' | 'quiz'>('study');

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
</script>

<template>
  <Header 
    :is-dark="isDark" 
    :current-view="currentView"
    @toggle-theme="toggleTheme" 
    @change-view="(view) => currentView = view"
  />
  
  <component :is="currentView === 'study' ? StudyView : QuizView" />
</template>

<style>
/* Global resets or shared styles if needed, 
   but specific styles should reside in components */
</style>
