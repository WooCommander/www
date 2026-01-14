<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Header from './components/Header.vue';

const isDark = ref(true);

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
  <Header :is-dark="isDark" @toggle-theme="toggleTheme" />

  <router-view v-slot="{ Component }">
    <transition name="page-fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
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
