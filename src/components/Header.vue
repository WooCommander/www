<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase } from '../services/supabase';

defineProps<{
  isDark: boolean;
}>();

defineEmits<{
  (e: 'toggleTheme'): void;
}>();

const user = ref<any>(null);

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    user.value = data.session?.user;
  });

  supabase.auth.onAuthStateChange((_, session) => {
    user.value = session?.user;
  });
});
</script>

<template>
  <header class="app-header">
    <div class="container header-content">
      <router-link to="/" class="logo">
        <span class="text-gradient">InterView</span>
      </router-link>

      <nav class="nav-items">
        <router-link to="/" class="nav-link" active-class="active">
          Главная
        </router-link>
        <router-link to="/study" class="nav-link" active-class="active">
          Учить
        </router-link>
        <router-link to="/quiz" class="nav-link" active-class="active">
          Тест
        </router-link>
        <router-link to="/leaderboard" class="nav-link" active-class="active">
          Топ
        </router-link>

        <div class="divider"></div>

        <button class="theme-toggle" @click="$emit('toggleTheme')"
          :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          <span v-if="isDark">☀️</span>
          <span v-else>🌙</span>
        </button>

        <!-- Auth Status -->
        <router-link v-if="!user" to="/auth" class="auth-link">
          Войти
        </router-link>
        <router-link v-else to="/profile" class="auth-link profile-link">
          👤
        </router-link>
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
  padding-top: calc(var(--spacing-sm) + env(safe-area-inset-top, 24px));
  /* Fallback 24px for notch simulation in browser */
  padding-bottom: var(--spacing-sm);
  padding-left: 0;
  padding-right: 0;
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

@media (max-width: 640px) {
  .text-gradient {
    /* display: none; Removed to show text on mobile */
    font-size: 1.2rem;
    /* Slightly smaller for mobile if needed */
  }

  .header-content {
    gap: 8px;
  }

  .nav-items {
    gap: 4px;
  }

  .nav-link {
    font-size: 0.8rem;
    padding: 4px 6px;
  }

  .logo {
    font-size: 1.2rem;
  }

  .divider {
    margin: 0 2px;
  }
}
</style>
