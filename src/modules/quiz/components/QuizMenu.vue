<script setup lang="ts">
import type { QuizTopic } from '../../../data/quiz_data';
import MainLayout from '../../../shared/layout/MainLayout.vue';
import PageHeader from '../../../components/common/PageHeader.vue';

defineProps<{
  viewMode: 'topic' | 'category' | 'exam' | 'editor';
  allCategories: string[];
  quizzesByCategory: Record<string, QuizTopic[]>;
}>();

const emit = defineEmits<{
  (e: 'update:viewMode', mode: 'topic' | 'category' | 'exam' | 'editor'): void;
  (e: 'start-quiz', quiz: QuizTopic): void;
  (e: 'start-category', category: string): void;
  (e: 'start-exam'): void;
  (e: 'open-editor', quiz: QuizTopic): void;
  (e: 'create-quiz'): void;
}>();
</script>

<template>
  <MainLayout fixed-height>
    <template #header>
      <PageHeader title="Режимы тестирования" description="Проверь свои знания в различных режимах тестирования." />
    </template>

    <template #sidebar>
      <div class="nav-list">
        <button class="nav-item" :class="{ active: viewMode === 'topic' }" @click="emit('update:viewMode', 'topic')">
          <span class="icon">📚</span> Темы
        </button>
        <button class="nav-item" :class="{ active: viewMode === 'category' }"
          @click="emit('update:viewMode', 'category')">
          <span class="icon">🏷️</span> Категории
        </button>
        <button class="nav-item" :class="{ active: viewMode === 'exam' }" @click="emit('update:viewMode', 'exam')">
          <span class="icon">⏱️</span> Экзамен
        </button>
        <button class="nav-item" :class="{ active: viewMode === 'editor' }" @click="emit('update:viewMode', 'editor')">
          <span class="icon">✏️</span> Редактор
        </button>
      </div>
    </template>

    <template #mobile-nav>
      <div class="mobile-tabs">
        <button class="mode-tab" :class="{ active: viewMode === 'topic' }"
          @click="emit('update:viewMode', 'topic')">Темы</button>
        <button class="mode-tab" :class="{ active: viewMode === 'category' }"
          @click="emit('update:viewMode', 'category')">Категории</button>
        <button class="mode-tab" :class="{ active: viewMode === 'exam' }"
          @click="emit('update:viewMode', 'exam')">Экзамен</button>
        <button class="mode-tab" :class="{ active: viewMode === 'editor' }"
          @click="emit('update:viewMode', 'editor')">Редактор</button>
      </div>
    </template>

    <template #content>
      <!-- Topic Mode -->
      <div v-if="viewMode === 'topic'">
        <div class="topics-header">
          <h3>Доступные темы</h3>
          <button class="btn-create" @click="emit('create-quiz')">+ Создать Тест</button>
        </div>

        <div v-for="category in allCategories" :key="category" class="topic-group">
          <h4 class="category-title">{{ category }}</h4>
          <div class="quiz-grid">
            <div v-for="quiz in quizzesByCategory[category]" :key="quiz.id" class="quiz-card"
              @click="emit('start-quiz', quiz)">
              <h5>{{ quiz.title }}</h5>
              <div class="topic-meta">
                <span>{{ quiz.questions.length }} вопросов</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Category Mode -->
      <div v-if="viewMode === 'category'" class="category-list-view">
        <div class="mode-desc">
          <p>Вам будет предложено 20 случайных вопросов из выбранной категории.</p>
        </div>

        <div class="quiz-grid">
          <div v-for="cat in allCategories" :key="cat" class="quiz-card category-card"
            @click="emit('start-category', cat)">
            <h3>{{ cat }}</h3>
            <p>Случайные 20 вопросов</p>
            <button class="start-btn">Начать тест</button>
          </div>
        </div>
      </div>

      <!-- Exam Mode -->
      <div v-if="viewMode === 'exam'" class="exam-view">
        <div class="exam-intro">
          <h3>Финальный Экзамен</h3>
          <div class="exam-info">
            <div class="info-item">
              <span class="emoji">⏱️</span>
              <span>45 минут</span>
            </div>
            <div class="info-item">
              <span class="emoji">❓</span>
              <span>50 вопросов</span>
            </div>
            <div class="info-item">
              <span class="emoji">📊</span>
              <span>Сложность: Микс</span>
            </div>
          </div>
          <p>
            Вопросы выбираются случайно из всей базы знаний.
            Таймер запустится автоматически. Результат будет сохранен только после завершения.
          </p>
          <button class="start-exam-btn" @click="emit('start-exam')">Начать экзамен</button>
        </div>
      </div>

      <!-- Editor Overview Mode (Topic List) -->
      <div v-if="viewMode === 'editor'" class="editor-topics">
        <div class="topics-header">
          <h3>Выберите тему для редактирования</h3>
        </div>

        <div v-for="category in allCategories" :key="category" class="topic-group">
          <h4 class="category-title">{{ category }}</h4>
          <div class="quiz-grid">
            <div v-for="quiz in quizzesByCategory[category]" :key="quiz.id" class="quiz-card"
              @click="emit('open-editor', quiz)">
              <h5>{{ quiz.title }}</h5>
              <div class="topic-meta">
                <span>{{ quiz.questions.length }} вопросов</span>
                <span class="edit-icon">✏️</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </MainLayout>
</template>

<style scoped lang="scss">
/* Global styles for this component */
.intro-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);

  h2 {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
  }

  p {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }
}

.nav-title {
  font-size: 1.1rem;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

/* Desktop Layout */
.quiz-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: var(--spacing-xl);
  align-items: start;
}

.sidebar-nav {
  position: sticky;
  top: 100px;
  background: var(--bg-card);
  padding: var(--spacing-lg);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  min-height: 300px;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  width: 100%;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
  }

  &.active {
    background: var(--accent-primary);
    color: #fff;
    box-shadow: var(--shadow-sm);
  }

  .icon {
    font-size: 1.2rem;
  }
}

.mobile-tabs {
  display: none;
  /* Hidden on desktop */
}

.topics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.btn-create {
  background: transparent;
  border: 1px solid var(--accent-primary);
  color: var(--accent-primary);
  padding: 6px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(56, 189, 248, 0.1);
  }
}

.topic-group {
  margin-bottom: var(--spacing-xl);
}

.category-title {
  color: var(--accent-primary);
  font-size: 1.2rem;
  margin-bottom: var(--spacing-md);
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.quiz-grid {
  display: grid;
  /* Force 2 columns on desktop to match user request */
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

.quiz-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: var(--spacing-lg);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-4px);
    border-color: var(--accent-primary);
    box-shadow: var(--shadow-md);
  }

  h5 {
    font-size: 1.1rem;
    margin-bottom: 8px;
    color: var(--text-primary);
    word-break: break-word;
    /* Ensure long words don't overflow */
    line-height: 1.3;
  }
}

.topic-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--text-secondary);

  .edit-icon {
    opacity: 0.5;
  }
}

/* Exam & Category specific styles */
.exam-view,
/* Exam & Category specific styles */
.exam-view {
  text-align: center;
  max-width: 800px;
  /* Keep Exam somewhat focused but wider */
  margin: 0 auto;
}

.category-list-view {
  /* Allow full width for grid */
  text-align: left;
}

.exam-intro {
  background: var(--bg-card);
  padding: 40px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
}

.exam-info {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin: 30px 0;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  .emoji {
    font-size: 2rem;
  }
}

.start-exam-btn {
  background: var(--accent-warning);
  color: #1e293b;
  border: none;
  padding: 16px 40px;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 20px;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
}

.start-btn {
  margin-top: var(--spacing-md);
  width: 100%;
  padding: 10px;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

@media (max-width: 1024px) {
  .quiz-layout {
    display: block;
  }

  .sidebar-nav {
    display: none;
  }

  .mobile-tabs {
    display: flex;
    justify-content: center;
    gap: var(--spacing-sm);

    flex-wrap: wrap;
    /* Matches the update from earlier */
    padding-bottom: 0;
  }

  .mode-tab {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.95rem;

    &:hover {
      border-color: var(--accent-primary);
      color: var(--text-primary);
    }

    &.active {
      background: var(--accent-primary);
      color: white;
      border-color: var(--accent-primary);
    }
  }
}

@media (max-width: 640px) {
  .quiz-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .exam-intro {
    padding: 24px;
  }

  .exam-info {
    gap: 16px;
    flex-wrap: wrap;
  }

  .info-item {
    min-width: 80px;
  }

  .mobile-tabs {
    gap: 8px;
  }

  .mode-tab {
    font-size: 0.9rem;
    padding: 6px 12px;
  }
}
</style>
