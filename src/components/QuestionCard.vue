<script setup lang="ts">
import { ref } from 'vue';
import type { Question } from '../types';

defineProps<{
  question: Question;
}>();

const isOpen = ref(false);

const toggle = () => {
  isOpen.value = !isOpen.value;
};
</script>

<template>
  <div 
    class="question-card" 
    :class="{ 'is-open': isOpen }"
    @click="toggle"
  >
    <div class="card-header">
      <h3 class="question-title">{{ question.title }}</h3>
      <div class="card-meta">
        <span class="badge" :class="question.difficulty.toLowerCase()">
          {{ question.difficulty }}
        </span>
        <span class="icon-chevron" :class="{ rotate: isOpen }">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </span>
      </div>
    </div>
    
    <div class="card-body" :style="{ maxHeight: isOpen ? '1000px' : '0px' }">
      <div class="answer-content">
        <p>{{ question.answer }}</p>
        
        <div v-if="question.code" class="code-block">
          <pre><code>{{ question.code }}</code></pre>
        </div>

        <div class="category-tag">#{{ question.category }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.question-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  position: relative;
}

.question-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: rgba(56, 189, 248, 0.3);
}

.card-header {
  padding: var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.question-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  padding-right: var(--spacing-sm);
}

.card-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.badge {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 20px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge.easy { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
.badge.medium { background: rgba(234, 179, 8, 0.2); color: #facc15; }
.badge.hard { background: rgba(239, 68, 68, 0.2); color: #f87171; }

.icon-chevron {
  transition: transform 0.3s ease;
  color: var(--text-secondary);
}

.icon-chevron.rotate {
  transform: rotate(180deg);
  color: var(--accent-primary);
}

.card-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0, 1, 0, 1);
  background: rgba(0, 0, 0, 0.2);
}

.answer-content {
  padding: var(--spacing-md);
  padding-top: 0;
  color: var(--text-secondary);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  margin-top: var(--spacing-sm); /* visual separation usually handled by padding, but let's tweak */
  padding-top: var(--spacing-md); /* restore padding */
}

.category-tag {
  display: inline-block;
  margin-top: var(--spacing-sm);
  font-size: 0.85rem;
  color: var(--accent-secondary);
  opacity: 0.8;
}

.code-block {
  margin-top: var(--spacing-sm);
  background: #0d1117;
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.9rem;
  color: #e6edf3;
  line-height: 1.5;
}

.code-block code {
  font-family: inherit;
}
</style>
