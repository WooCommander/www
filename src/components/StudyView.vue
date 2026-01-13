<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useWindowVirtualizer } from '@tanstack/vue-virtual';
import QuestionCard from './QuestionCard.vue';
import EditModal from '../features/editor/components/EditModal.vue';
import { QuestionStore } from '../services/QuestionStore';
import type { Question } from '../types';

const selectedCategory = ref('Все');
const searchQuery = ref('');

const isEditModalOpen = ref(false);
const editingQuestion = ref<Question | null>(null);

onMounted(async () => {
  await QuestionStore.initialize();
});

const questions = computed(() => QuestionStore.getAllQuestions.value);

const uniqueCategories = computed(() => {
  const cats = new Set(questions.value.map((q: Question) => q.category));
  return Array.from(cats).sort();
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

// Virtual Scroll Logic
type FlatItem =
  | { type: 'header'; id: string; text: string }
  | { type: 'question'; id: string; data: Question };

const flatList = computed(() => {
  const list: FlatItem[] = [];
  const groups = groupedQuestions.value;

  Object.keys(groups).sort().forEach(category => {
    list.push({ type: 'header', id: `cat-${category}`, text: category });
    groups[category]!.forEach((q: Question) => {
      list.push({ type: 'question', id: q.id, data: q });
    });
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
  <main class="container main-content">
    <div class="intro">
      <h2>Вопросы для собеседования</h2>
      <p>Практикуйся и изучай Js и TypeScript помощью интерактивных карточек.</p>
    </div>

    <div class="search-container">
      <input v-model="searchQuery" type="text" placeholder="Поиск по номеру (100) или названию..." class="search-input">
    </div>

    <div class="categories-nav">
      <button v-for="cat in categories" :key="cat.name" class="category-chip"
        :class="{ active: selectedCategory === cat.name }" @click="selectedCategory = cat.name">
        {{ cat.name }}
        <span class="category-count">{{ cat.count }}</span>
      </button>
    </div>

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
        <template v-else-if="flatList[virtualRow.index]?.type === 'question'">
          <div class="questions-list">
            <QuestionCard :question="(flatList[virtualRow.index] as any).data" @edit="openEditModal" />
          </div>
        </template>
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

.search-container {
  max-width: 600px;
  margin: 0 auto var(--spacing-lg);
  padding: 0 var(--spacing-md);
}

.search-input {
  width: 100%;
  padding: 12px 20px;
  font-size: 1rem;
  color: var(--text-primary);
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.1);
  }

  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.7;
  }
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
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

.categories-nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  overflow-x: auto;
  padding: 4px;
  margin-bottom: var(--spacing-xl);
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.category-chip {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-primary);
    color: var(--text-primary);
  }

  &.active {
    background: var(--accent-primary);
    color: #fff;
    border-color: var(--accent-primary);
  }
}

.category-count {
  font-size: 0.8em;
  opacity: 0.7;
  margin-left: 4px;
}
</style>
