<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useWindowVirtualizer } from '@tanstack/vue-virtual';

import EditModal from '../features/editor/components/EditModal.vue';
import { QuestionStore } from '../services/QuestionStore';
import type { Question } from '../types';
import QuestionCard from '../components/QuestionCard.vue';

const selectedCategory = ref('Все');
const searchQuery = ref('');

const isEditModalOpen = ref(false);
const editingQuestion = ref<Question | null>(null);

// Responsive logic
const windowWidth = ref(window.innerWidth);

const updateWidth = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(async () => {
  window.addEventListener('resize', updateWidth);
  await QuestionStore.initialize();
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth);
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
  questions.value.forEach((q: Question) => {
    counts[q.category] = (counts[q.category] || 0) + 1;
  });

  const uniqueCats = Object.keys(counts).filter(c => c !== 'Все').sort();

  return [
    { name: 'Все', count: counts['Все'] },
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

    if (selectedCategory.value !== 'Все' && q.category !== selectedCategory.value) {
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
const columnCount = computed(() => (windowWidth.value > 1024 ? 2 : 1));

// Virtual Scroll Logic
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

const rowVirtualizer = useWindowVirtualizer({
  count: flatList.value.length,
  estimateSize: () => 200, // Estimate height in px
  overscan: 5,
});

const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems());
const totalSize = computed(() => rowVirtualizer.value.getTotalSize());

const measureElement = (el: any) => {
  if (!el) return;
  rowVirtualizer.value.measureElement(el);
};
</script>

<template>
  <main class="container-wide main-content">
    <div class="intro">
      <h2>Вопросы для собеседования</h2>
      <p>Практикуйся и изучай Js и TypeScript помощью интерактивных карточек.</p>
    </div>

    <div class="study-layout">
      <!-- Sidebar (Desktop) / Top Nav (Mobile) -->
      <aside class="sidebar">
        <div class="search-container">
          <input v-model="searchQuery" type="text" placeholder="Поиск..." class="search-input">
        </div>

        <div class="categories-nav">
          <h3 class="sidebar-title">Категории</h3>
          <button v-for="cat in categories" :key="cat.name" class="category-chip"
            :class="{ active: selectedCategory === cat.name }" @click="selectedCategory = cat.name">
            {{ cat.name }}
            <span class="category-count">{{ cat.count }}</span>
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="content-area">
        <div class="questions-wrapper" :style="{ height: `${totalSize}px`, width: '100%', position: 'relative' }">
          <div v-for="virtualRow in virtualRows" :key="flatList[virtualRow.index]?.id || virtualRow.index"
            :data-index="virtualRow.index" :ref="measureElement" :style="{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }">
            <template v-if="flatList[virtualRow.index]?.type === 'header'">
              <div class="category-section">
                <h3 class="category-title">{{ (flatList[virtualRow.index] as any).text }}</h3>
              </div>
            </template>
            <template v-else-if="flatList[virtualRow.index]?.type === 'row'">
              <div class="questions-grid-row" :style="{
                display: 'grid',
                gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
                gap: 'var(--spacing-sm)'
              }">
                <QuestionCard v-for="q in (flatList[virtualRow.index] as any).items" :key="q.id" :question="q"
                  @edit="openEditModal" />
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </main>

  <button class="fab-add" @click="openEditModal(null)" title="Add Question">+</button>

  <EditModal :is-open="isEditModalOpen" :question="editingQuestion" :categories="uniqueCategories"
    @close="isEditModalOpen = false" @save="saveQuestion" @delete="deleteQuestion" />
</template>

<style scoped lang="scss">
.fab-add {
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


.container-wide {
  width: 100%;
  max-width: 1400px;
  /* Wider container for desktop */
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.main-content {
  padding-top: var(--spacing-xl);
  padding-bottom: var(--spacing-xl);
}

.intro {
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

/* Desktop Grid Layout */
.study-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--spacing-xl);
  align-items: start;
  min-height: 80vh;
}

/* Sidebar Styles */
.sidebar {
  position: sticky;
  top: 100px;
  background: var(--bg-card);
  padding: var(--spacing-lg);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.sidebar-title {
  font-size: 1.1rem;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.search-container {
  width: 100%;
  margin-bottom: var(--spacing-lg);
  padding: 0;
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
  gap: 6px;
}

.category-chip {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
  }

  &.active {
    background: var(--accent-primary);
    color: #fff;
    box-shadow: var(--shadow-sm);
  }
}

.category-count {
  font-size: 0.8em;
  opacity: 0.7;
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.category-section {
  margin-bottom: var(--spacing-xl);
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

/* Mobile Responsive */
@media (max-width: 1024px) {
  .study-layout {
    grid-template-columns: 1fr;
    display: block;
  }

  .sidebar {
    position: static;
    background: transparent;
    border: none;
    padding: 0;
    margin-bottom: var(--spacing-lg);
  }

  .sidebar-title {
    display: none;
  }

  .categories-nav {
    flex-direction: row;
    flex-wrap: wrap;
    /* Wrap on mobile */
    overflow-x: visible;
    /* No scroll */
    padding-bottom: 0;
    justify-content: center;
    /* Center them */
  }

  .category-chip {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    white-space: nowrap;
    flex-shrink: 0;
    padding: 8px 16px;
    border-radius: 20px;

    &.active {
      background: var(--accent-primary);
    }

    /* Reset flex/justify for chips */
    display: inline-flex;
  }
}

@media (max-width: 640px) {
  .container-wide {
    padding: 0 var(--spacing-sm);
  }

  .main-content {
    padding-top: var(--spacing-md);
  }

  .intro h2 {
    font-size: 1.8rem;
  }

  .intro p {
    font-size: 1rem;
    padding: 0 var(--spacing-sm);
  }

  .fab-add {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
    right: 1.5rem;
    bottom: 1.5rem;
  }
}
</style>
