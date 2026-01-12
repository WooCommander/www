<script setup lang="ts">
defineProps<{
  isDark: boolean;
  currentView: 'study' | 'quiz';
}>();

defineEmits<{
  (e: 'toggleTheme'): void;
  (e: 'changeView', view: 'study' | 'quiz'): void;
}>();
</script>

<template>
  <header class="app-header">
    <div class="container header-content">
      <h1 class="logo" @click="$emit('changeView', 'study')" style="cursor: pointer;">
        <span class="logo-icon">TS</span>
        <span class="text-gradient">Interview</span>
      </h1>
      <nav class="nav-items">
        <button 
          class="nav-link" 
          :class="{ active: currentView === 'study' }"
          @click="$emit('changeView', 'study')"
        >
          Study
        </button>
        <button 
          class="nav-link" 
          :class="{ active: currentView === 'quiz' }"
          @click="$emit('changeView', 'quiz')"
        >
          Test
        </button>

        <div class="divider"></div>

        <button class="theme-toggle" @click="$emit('toggleTheme')" :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          <span v-if="isDark">☀️</span>
          <span v-else>🌙</span>
        </button>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  padding: var(--spacing-sm) 0;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.light-theme .app-header {
  background: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
  color: var(--text-primary);
  user-select: none;
}

.logo-icon {
  background: var(--accent-primary);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 1rem;
}

.nav-items {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.nav-link {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.95rem;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.nav-link:hover {
  color: var(--text-primary);
  background: rgba(100, 100, 100, 0.1);
}

.nav-link.active {
  color: var(--accent-primary);
  background: rgba(56, 189, 248, 0.1);
}

.divider {
  width: 1px;
  height: 20px;
  background: var(--border-color);
  margin: 0 4px;
}

.theme-toggle {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 1.2rem;
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  background: var(--bg-card);
  border-color: var(--accent-primary);
  transform: scale(1.05);
}
</style>
