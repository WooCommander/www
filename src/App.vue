<script setup lang="ts">
import { computed, ref } from 'vue';
import Header from './components/Header.vue';
import QuestionCard from './components/QuestionCard.vue';
import { questions } from './data/questions';

const selectedCategory = ref('Все');
const searchQuery = ref('');

const categories = computed(() => {
  const cats = new Set(questions.map(q => q.category));
  return ['Все', ...Array.from(cats)].sort();
});

const groupedQuestions = computed(() => {
  const groups: Record<string, typeof questions> = {};
  
  questions.forEach(q => {
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
</script>

<template>
  <Header />
  
  <main class="container main-content">
    <div class="intro">
      <h2>Вопросы для собеседования</h2>
      <p>Практикуйся и изучай Js и TypeScript помощью интерактивных карточек.</p>
    </div>

    <div class="search-container">
      <input 
        v-model="searchQuery"
        type="text"
        placeholder="Поиск по номеру (100) или названию..."
        class="search-input"
      >
    </div>

    <div class="categories-nav">
      <button 
        v-for="cat in categories" 
        :key="cat"
        class="category-chip"
        :class="{ active: selectedCategory === cat }"
        @click="selectedCategory = cat"
      >
        {{ cat }}
      </button>
    </div>

    <div class="questions-wrapper">
      <div v-for="(categoryQuestions, category) in groupedQuestions" :key="category" class="category-section">
        <h3 class="category-title">{{ category }}</h3>
        <div class="questions-list">
          <QuestionCard 
            v-for="q in categoryQuestions" 
            :key="q.id" 
            :question="q" 
          />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.main-content {
  padding-top: var(--spacing-xl);
  padding-bottom: var(--spacing-xl);
}

.intro {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.intro h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.intro p {
  color: var(--text-secondary);
  font-size: 1.1rem;
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
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.1);
}

.search-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.no-results {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
  font-size: 1.2rem;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

/* Entrance Animation */
.questions-list {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
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
}

.categories-nav::-webkit-scrollbar {
  display: none;
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
}

.category-chip:hover {
  border-color: var(--accent-primary);
  color: var(--text-primary);
}

.category-chip.active {
  background: var(--accent-primary);
  color: #fff;
  border-color: var(--accent-primary);
}
</style>
