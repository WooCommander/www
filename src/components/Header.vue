<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../shared/api/supabase';
import { CourseStore } from '../modules/course/services/CourseStore';

defineProps<{
  isDark: boolean;
}>();

defineEmits<{
  (e: 'toggleTheme'): void;
}>();

const user = ref<any>(null);
const isMenuOpen = ref(false);

const courses = computed(() => CourseStore.courses);
const currentCourse = computed(() => CourseStore.currentCourse);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  if (isMenuOpen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

const closeMenu = () => {
  isMenuOpen.value = false;
  document.body.style.overflow = '';
};

// Dropdown Logic
const showCourseMenu = ref(false);

const selectCourse = (course: any) => {
  CourseStore.setCourse(course);
  showCourseMenu.value = false;
  // Reload handled by watchers in views usually, setting course updates logic
  // But we might want to redirect to Home if we are on a protected route?
  // Actually if we switch course while on /quiz, we should probably reset/reload.
  // Let's reload user's location to be safe or just let reactivity work.
  // Given QuestionStore logic, a full reload might be safer or just rely on global reactivity.
  window.location.reload();
};

onMounted(() => {
  // Init courses
  CourseStore.initialize();

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
      <div class="header-left">
        <router-link to="/" class="logo" @click="closeMenu">
          <span class="text-gradient">InterView</span>
        </router-link>

        <!-- Course Selector (Desktop) -->
        <div class="course-selector-wrapper">
          <button class="course-select-btn" @click="showCourseMenu = !showCourseMenu">
            <span v-if="currentCourse" class="selected-course">
              {{ currentCourse.icon }} {{ currentCourse.title }}
            </span>
            <span v-else class="placeholder">Выбрать курс ▾</span>
          </button>

          <div v-if="showCourseMenu" class="course-dropdown">
            <div class="course-list">
              <div v-for="c in courses" :key="c.id" class="course-item" @click="selectCourse(c)">
                {{ c.icon }} {{ c.title }}
              </div>
            </div>
            <!-- Overlay to close -->
            <div class="dropdown-overlay" @click="showCourseMenu = false"></div>
          </div>
        </div>
      </div>

      <nav class="nav-items desktop-nav">
        <router-link to="/" class="nav-link" active-class="active">Дашборд</router-link>
        <!-- Main Links (Hidden if no course) -->
        <template v-if="currentCourse">
          <router-link to="/study" class="nav-link" active-class="active">Учить</router-link>
          <router-link to="/quiz" class="nav-link" active-class="active">Тест</router-link>
          <router-link to="/leaderboard" class="nav-link" active-class="active">Топ</router-link>
        </template>
        <template v-else>
          <span class="nav-hint">Выберите курс, чтобы начать &uarr;</span>
        </template>

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
            <!-- Mobile Course Selector -->
            <div class="mobile-course-section">
              <label>Текущий курс</label>
              <div class="mobile-courses">
                <div v-for="c in courses" :key="c.id" class="mobile-course-item"
                  :class="{ active: currentCourse?.id === c.id }" @click="selectCourse(c)">
                  {{ c.icon }} {{ c.title }}
                </div>
              </div>
            </div>

            <div class="mobile-divider"></div>

            <template v-if="currentCourse">
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
            </template>

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
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  padding-top: calc(var(--spacing-sm) + env(safe-area-inset-top, 24px));
  padding-bottom: var(--spacing-sm);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.light-theme .app-header {
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
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
  text-decoration: none;
}

/* Course Selector */
.course-selector-wrapper {
  position: relative;
}

.course-select-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  padding: 6px 12px;
  border-radius: 8px;
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  min-width: 150px;
  justify-content: space-between;
  transition: all 0.2s;
}

.course-select-btn:hover {
  border-color: var(--accent-primary);
}

.placeholder {
  color: var(--text-secondary);
  font-style: italic;
}

.course-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  min-width: 200px;
  z-index: 200;
  overflow: hidden;
  animation: fadeIn 0.2s ease;
}

.course-list {
  max-height: 300px;
  overflow-y: auto;
}

.course-item {
  padding: 10px 16px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s;
  color: var(--text-primary);
}

.course-item:hover {
  background: var(--bg-secondary);
  color: var(--accent-primary);
}

.dropdown-overlay {
  position: fixed;
  inset: 0;
  z-index: -1;
  cursor: default;
}

/* Nav */
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
  text-decoration: none;
}

.nav-link:hover {
  color: var(--text-primary);
  background: rgba(100, 100, 100, 0.1);
}

.nav-link.active {
  color: var(--accent-primary);
  background: rgba(56, 189, 248, 0.1);
}

.nav-hint {
  font-size: 0.85rem;
  color: var(--text-secondary);
  opacity: 0.7;
  animation: pulse 2s infinite;
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
  cursor: pointer;
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
  position: relative;
  z-index: 200; /* Ensure above overlay */
}

/* Mobile Overlay */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: var(--bg-primary);
  z-index: 150;
  padding: 80px 24px 24px;
  display: flex;
  flex-direction: column;
}

.mobile-nav-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobile-link {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  padding: 10px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background 0.2s;
  text-decoration: none;
}

.mobile-link:active {
  background: var(--bg-card);
}

.mobile-link.active {
  color: var(--accent-primary);
  background: rgba(56, 189, 248, 0.1);
}

.m-icon {
  font-size: 1.3rem;
  width: 32px;
  text-align: center;
}

.mobile-divider {
  height: 1px;
  background: var(--border-color);
  margin: 12px 0;
}

.mobile-link.theme-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  width: 100%;
}

/* Mobile Course Items */
.mobile-course-section {
  padding: 12px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.mobile-course-section label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  display: block;
  margin-bottom: 8px;
  text-transform: uppercase;
  font-weight: 700;
}

.mobile-courses {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.mobile-course-item {
  padding: 10px;
  border-radius: 8px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-course-item.active {
  border: 1px solid var(--accent-primary);
  background: rgba(56, 189, 248, 0.1);
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

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    opacity: 0.5;
  }

  50% {
    opacity: 0.9;
  }

  100% {
    opacity: 0.5;
  }
}

@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }

  .menu-toggle {
    display: block;
  }

  .course-selector-wrapper {
    display: none;
    /* Hide desktop selector on mobile, use menu */
  }

  .header-content {
    justify-content: space-between;
    gap: 0;
  }

  .logo {
    z-index: 102;
    position: relative;
  }
}
</style>
