<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';

import EditModal from '../features/editor/components/EditModal.vue';
import { QuestionStore } from '../services/QuestionStore';
import type { Question } from '../shared/types';
import QuestionCard from '../components/QuestionCard.vue';
import MainLayout from '../shared/layout/MainLayout.vue';
import PageHeader from '../components/common/PageHeader.vue';

const selectedCategory = ref('Все');
const searchQuery = ref('');

const isEditModalOpen = ref(false);
const editingQuestion = ref<Question | null>(null);

// Responsive logic
const windowWidth = ref(window.innerWidth);

const updateWidth = () => {
  windowWidth.value = window.innerWidth;
};

// Pagination / Infinite Scroll
const visibleLimit = ref(20);
const PAGE_SIZE = 20;
const observerTarget = ref<HTMLElement | null>(null);

onMounted(async () => {
  window.addEventListener('resize', updateWidth);
  await QuestionStore.initialize();

  // Setup Intersection Observer for infinite scroll
  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (entry && entry.isIntersecting) {
      loadMore();
    }
  }, { rootMargin: '200px' });

  if (observerTarget.value) {
    observer.observe(observerTarget.value);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth);
});

const loadMore = () => {
  if (visibleLimit.value < flatList.value.length) {
    visibleLimit.value += PAGE_SIZE;
  }
};

// Reset pagination when filters change
watch([selectedCategory, searchQuery], () => {
  visibleLimit.value = PAGE_SIZE;
  // Scroll to top might be nice here
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const questions = computed(() => QuestionStore.getAllQuestions.value);

const uniqueCategories = computed(() => {
  const cats = new Set(questions.value.map((q: Question) => q.category));
  return Array.from(cats).sort() as string[];
});

const openEditModal = (q: Question | null) => {
  editingQuestion.value = q;
  isEditModalOpen.value = true;
};

const saveQuestion = async (updatedQ: Question) => {
  try {
    await QuestionStore.saveQuestion(updatedQ);
    isEditModalOpen.value = false;
  } catch (e) {
    console.error(e);
    alert('Error saving question');
  }
};

const deleteQuestion = async (id: number | string) => {
  if (!confirm('Are you sure?')) return;

  try {
    await QuestionStore.deleteQuestion(id.toString());
    isEditModalOpen.value = false;
  } catch (e) {
    console.error(e);
    alert('Error deleting question');
  }
};

const categories = computed(() => {
  const counts: Record<string, number> = { 'Все': questions.value.length };

  // Calculate specific counts
  questions.value.forEach((q: Question) => {
    counts[q.category] = (counts[q.category] || 0) + 1;
  });

  // Calculate Favorites count
  const favCount = questions.value.filter(q => QuestionStore.favorites.has(q.id.toString())).length;

  const uniqueCats = Object.keys(counts).filter(c => c !== 'Все').sort();

  return [
    { name: 'Все', count: counts['Все'] },
    { name: 'Избранное', count: favCount },
    ...uniqueCats.map(c => ({ name: c, count: counts[c] }))
  ];
});

const groupedQuestions = computed(() => {
  const groups: Record<string, typeof questions.value> = {};

  questions.value.forEach((q: Question) => {
    const query = searchQuery.value.toLowerCase().trim();
    if (query) {
      const matchesId = q.id.toString().includes(query);
      const matchesTitle = q.title.toLowerCase().includes(query);
      if (!matchesId && !matchesTitle) return;
    }

    if (selectedCategory.value === 'Избранное') {
      if (!QuestionStore.favorites.has(q.id.toString())) return;
    } else if (selectedCategory.value !== 'Все' && q.category !== selectedCategory.value) {
      return;
    }

    if (!groups[q.category]) {
      groups[q.category] = [];
    }
    groups[q.category]!.push(q);
  });

  return groups;
});

// Grid Logic
const columnCount = computed(() => (windowWidth.value > 1024 ? 1 : 1));

type FlatItem =
  | { type: 'header'; id: string; text: string }
  | { type: 'row'; id: string; items: Question[] };

const flatList = computed(() => {
  const list: FlatItem[] = [];
  const groups = groupedQuestions.value;
  const cols = columnCount.value;

  Object.keys(groups).sort().forEach(category => {
    list.push({ type: 'header', id: `cat-${category}`, text: category });

    const questionsInCat = groups[category]!;
    for (let i = 0; i < questionsInCat.length; i += cols) {
      const chunk = questionsInCat.slice(i, i + cols);
      list.push({
        type: 'row',
        id: `row-${category}-${i}`,
        items: chunk
      });
    }
  });

  return list;
});

const visibleList = computed(() => {
  return flatList.value.slice(0, visibleLimit.value);
});

const onHorizontalScroll = (e: WheelEvent) => {
  const container = e.currentTarget as HTMLElement;
  if (e.deltaY !== 0) {
    e.preventDefault();
    container.scrollLeft += e.deltaY;
  }
};
</script>

<template>
  <div class="study-view">
    <MainLayout fixed-height>
      <template #header>
        <PageHeader title="Вопросы для собеседования"
          description="Практикуйся и изучай Js и TypeScript помощью интерактивных карточек." />
      </template>

      <template #sidebar>
        <div class="search-container">
          <input v-model="searchQuery" type="text" placeholder="Поиск..." class="search-input">
        </div>

        <div class="categories-nav">
          <div class="nav-header">
            <h3 class="sidebar-title">Категории</h3>
          </div>
          <div class="nav-list">
            <button v-for="cat in categories" :key="cat.name" class="category-chip"
              :class="{ active: selectedCategory === cat.name }" @click="selectedCategory = cat.name">
              <span class="cat-name">{{ cat.name }}</span>
              <span class="category-count">{{ cat.count }}</span>
            </button>
          </div>
        </div>
      </template>

      <template #mobile-nav>
        <div class="search-container mobile-search">
          <input v-model="searchQuery" type="text" placeholder="Поиск..." class="search-input">
        </div>

        <div class="categories-nav mobile-categories" @wheel="onHorizontalScroll">
          <button v-for="cat in categories" :key="cat.name" class="category-chip"
            :class="{ active: selectedCategory === cat.name }" @click="selectedCategory = cat.name">
            {{ cat.name }}
            <span class="category-count">{{ cat.count }}</span>
          </button>
        </div>
      </template>

      <template #content>
        <div class="questions-wrapper">
          <div v-for="item in visibleList" :key="item.id" class="list-item">
            <template v-if="item.type === 'header'">
              <div class="category-section">
                <h3 class="category-title">{{ item.text }}</h3>
              </div>
            </template>
            <template v-else-if="item.type === 'row'">
              <div class="questions-grid-row" :style="{
                display: 'grid',
                gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
                gap: 'var(--spacing-sm)'
              }">
                <QuestionCard v-for="q in item.items" :key="q.id" :question="q" @edit="openEditModal" />
              </div>
            </template>
          </div>

          <!-- Intersection Observer Target -->
          <div ref="observerTarget" class="loading-trigger">
            <span v-if="visibleLimit < flatList.length">Загрузка...</span>
          </div>
        </div>
      </template>
    </MainLayout>

    <button class="fab-add" @click="openEditModal(null)" title="Add Question">+</button>

    <EditModal :is-open="isEditModalOpen" :question="editingQuestion" :categories="uniqueCategories"
      @close="isEditModalOpen = false" @save="saveQuestion" @delete="deleteQuestion" />
  </div>
</template>

<style scoped lang="scss">
.study-view {
  height: 100%;
  overflow: hidden;
}

.fab-add {
  /* ... existing styles ... */
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--accent-primary);
  color: white;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  z-index: 90;

  &:hover {
    transform: scale(1.1);
  }
}

.sidebar-title {
  font-size: 1.1rem;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.search-container {
  width: 100%;
  margin-bottom: var(--spacing-lg);
  padding: 0;
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 0.95rem;
  color: var(--text-primary);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
  }
}

.categories-nav {
  display: flex;
  flex-direction: column;
  gap: 0;
  /* Reset gap, handle in list */
  flex: 1;
  min-height: 0;
  /* Allow shrinking */
}

.nav-header {
  flex-shrink: 0;
  margin-bottom: var(--spacing-sm);
  position: sticky;
  top: 0;
  background: var(--bg-card);
  z-index: 10;
  padding-bottom: 5px;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  /* Internal scroll for categories if needed */
  padding-right: 4px;
  /* Space for scrollbar */
}

/* Custom thin scrollbar for nav-list */
.nav-list::-webkit-scrollbar {
  width: 4px;
}

.nav-list::-webkit-scrollbar-track {
  background: transparent;
}

.nav-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.category-chip {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  width: 100%;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
    transform: translateX(4px);
  }

  &.active {
    background: rgba(56, 189, 248, 0.15);
    color: var(--accent-primary);
    border-color: rgba(56, 189, 248, 0.2);
    font-weight: 500;
  }
}

.cat-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 10px;
}

.category-count {
  font-size: 0.75em;
  opacity: 0.7;
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 24px;
  text-align: center;
}

.questions-wrapper {
  padding-bottom: 40px;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.category-section {
  margin-bottom: var(--spacing-lg);
  margin-top: var(--spacing-md);

  &:first-child {
    margin-top: 0;
  }
}

.category-title {
  font-size: 1.5rem;
  color: var(--accent-primary);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-xs);
  border-bottom: 2px solid rgba(56, 189, 248, 0.2);
  display: inline-block;
  width: 100%;
}

/* Mobile Responsive Adjustments for Nav Slots */
@media (max-width: 1024px) {
  .categories-nav.mobile-categories {
    flex-direction: row;
    flex-wrap: nowrap;
    overflow-x: auto;
    /* Horizontal scroll */
    padding-bottom: 4px;
    /* Space for scrollbar */
    justify-content: flex-start;
    gap: 8px;
    -webkit-overflow-scrolling: touch;
    /* Smooth scroll on iOS */
    margin-bottom: 8px;

    /* Hide scrollbar for cleaner look if desired, or style it thin */
    &::-webkit-scrollbar {
      height: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }

    width: 100%;
  }

  .nav-header {
    display: none;
  }

  /* Reset nav-list styles for mobile if used elsewhere */
  .nav-list {
    flex-direction: row;
    flex-wrap: nowrap;
    overflow-y: hidden;
    overflow-x: auto;
    justify-content: flex-start;
  }

  .category-chip {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    white-space: nowrap;
    flex-shrink: 0;
    padding: 6px 14px;
    border-radius: 20px;
    width: auto;
    font-size: 0.85rem;

    &:hover {
      border-color: var(--accent-primary);
      color: var(--text-primary);
      transform: none;
    }

    &.active {
      background: var(--accent-primary);
      color: white;
      border-color: var(--accent-primary);
    }
  }

  .mobile-search {
    margin-bottom: var(--spacing-sm);
  }
}

@media (max-width: 640px) {
  .fab-add {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
    right: 1.5rem;
    bottom: 1.5rem;
  }
}

.loading-trigger {
  padding: 20px;
  text-align: center;
  color: var(--text-secondary);
  min-height: 50px;
}

.list-item {
  width: 100%;
}
</style>
