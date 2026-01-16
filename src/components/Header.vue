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
const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  if (isMenuOpen.value) {
    document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
  } else {
    document.body.style.overflow = '';
  }
};

const closeMenu = () => {
  isMenuOpen.value = false;
  document.body.style.overflow = '';
};

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
      <router-link to="/" class="logo" @click="closeMenu">
        <span class="text-gradient">InterView</span>
      </router-link>

      <!-- Desktop Nav -->
      <nav class="nav-items desktop-nav">
        <router-link to="/" class="nav-link" active-class="active">Главная</router-link>
        <router-link to="/study" class="nav-link" active-class="active">Учить</router-link>
        <router-link to="/quiz" class="nav-link" active-class="active">Тест</router-link>
        <router-link to="/leaderboard" class="nav-link" active-class="active">Топ</router-link>

        <div class="divider"></div>

        <button class="theme-toggle" @click="$emit('toggleTheme')"
          :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          <span v-if="isDark">☀️</span>
          <span v-else>🌙</span>
        </button>

        <router-link v-if="!user" to="/auth" class="auth-link">Войти</router-link>
        <router-link v-else to="/profile" class="auth-link profile-link">👤</router-link>
      </nav>

      <!-- Mobile Menu Toggle -->
      <button class="menu-toggle" @click="toggleMenu" aria-label="Menu">
        <span class="hamburger-icon">{{ isMenuOpen ? '✕' : '☰' }}</span>
      </button>

      <!-- Mobile Nav Overlay -->
      <transition name="slide-fade">
        <div v-if="isMenuOpen" class="mobile-menu-overlay">
          <nav class="mobile-nav-items">
            <router-link to="/" class="mobile-link" active-class="active" @click="closeMenu">
              <span class="m-icon">🏠</span> Главная
            </router-link>
            <router-link to="/study" class="mobile-link" active-class="active" @click="closeMenu">
              <span class="m-icon">📚</span> Учить
            </router-link>
            <router-link to="/quiz" class="mobile-link" active-class="active" @click="closeMenu">
              <span class="m-icon">🚀</span> Тест
            </router-link>
            <router-link to="/leaderboard" class="mobile-link" active-class="active" @click="closeMenu">
              <span class="m-icon">🏆</span> Топ игроков
            </router-link>

            <div class="mobile-divider"></div>

            <router-link v-if="!user" to="/auth" class="mobile-link" @click="closeMenu">
              <span class="m-icon">🔑</span> Войти
            </router-link>
            <router-link v-else to="/profile" class="mobile-link" @click="closeMenu">
              <span class="m-icon">👤</span> Профиль
            </router-link>

            <button class="mobile-link theme-btn" @click="$emit('toggleTheme')">
              <span class="m-icon">{{ isDark ? '☀️' : '🌙' }}</span>
              {{ isDark ? 'Светлая тема' : 'Темная тема' }}
            </button>
          </nav>
        </div>
      </transition>
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

/* Menu Toggle */
.menu-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 1.8rem;
  cursor: pointer;
  z-index: 102;
  /* Above overlay */
}

/* Mobile Overlay */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: var(--bg-primary);
  /* Should match theme bg */
  z-index: 101;
  padding: 80px 24px 24px;
  /* Space for header */
  display: flex;
  flex-direction: column;
}

.mobile-nav-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobile-link {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  padding: 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: background 0.2s;
  text-decoration: none;

  &:active {
    background: var(--bg-card);
  }

  &.active {
    color: var(--accent-primary);
    background: rgba(56, 189, 248, 0.1);
  }
}

.m-icon {
  font-size: 1.8rem;
  width: 40px;
  text-align: center;
}

.mobile-divider {
  height: 1px;
  background: var(--border-color);
  margin: 16px 0;
}

.mobile-link.theme-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  width: 100%;
}

/* Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@media (max-width: 768px) {
  .desktop-nav {
    display: none;
    /* Hide horizontal nav */
  }

  .menu-toggle {
    display: block;
    /* Show hamburger */
  }

  .header-content {
    justify-content: space-between;
    gap: 0;
  }

  .logo {
    z-index: 102;
    /* Keep logo visible above overlay if wanted, or let it cover */
    position: relative;
  }
}
</style>
