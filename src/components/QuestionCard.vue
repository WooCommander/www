<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Question } from '../shared/types';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

import { QuestionStore } from '../services/QuestionStore';

const props = defineProps<{
  question: Question;
}>();

const isOpen = ref(false);

const isFav = computed(() => QuestionStore.isFavorite(props.question.id.toString()));

const toggleFav = (e: Event) => {
  e.stopPropagation();
  QuestionStore.toggleFavorite(props.question.id.toString());
};

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const copySlug = async () => {
  if (props.question.slug) {
    try {
      await navigator.clipboard.writeText(props.question.slug);
      // Optional: Show toast or feedback
      console.log('Slug copied:', props.question.slug);
    } catch (err) {
      console.error('Failed to copy slug', err);
    }
  }
};

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) { }
    }

    return ''; // use external default escaping
  }
});

const renderedAnswer = computed(() => {
  let content = props.question.answer || '';

  if (!content) {
    return '<p><em>Ответ отсутствует</em></p>';
  }

  if (props.question.code) {
    content += `\n\n\`\`\`typescript\n${props.question.code}\n\`\`\``;
  }
  return md.render(content);
});
</script>

<template>
  <div class="question-card" :class="{ 'is-open': isOpen }" @click="toggle">
    <div class="card-header">
      <h3 class="question-title">{{ question.title }}</h3>
      <div class="card-meta">
        <span class="slug-id" @click.stop="copySlug" title="Copy ID">
          #{{ question.numeric_id || question.id }}
        </span>
        <button class="fav-btn" :class="{ active: isFav }" @click="toggleFav" title="Bookmark">
          {{ isFav ? '★' : '☆' }}
        </button>
        <button class="edit-btn" @click.stop="$emit('edit', question)" title="Edit">
          ✏️
        </button>
        <span class="badge" :class="question.difficulty.toLowerCase()">
          {{ question.difficulty }}
        </span>
        <span class="icon-chevron" :class="{ rotate: isOpen }">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </div>
    </div>

    <div class="card-body" :style="{ maxHeight: isOpen ? '2000px' : '0px' }">
      <div class="answer-content markdown-body" v-html="renderedAnswer"></div>
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
  gap: 10px;
  flex-direction: column;
  align-items: flex-start;
}

.question-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  padding-right: var(--spacing-sm);
  flex: 1;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.slug-id {
  font-family: 'Fira Code', monospace;
  font-size: 0.8rem;
  color: var(--text-secondary);
  opacity: 0.6;
  padding: 2px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}



.fav-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: var(--text-secondary);
  transition: all 0.2s;
  padding: 0 4px;
}

.fav-btn:hover {
  transform: scale(1.1);
  color: #fbbf24;
  /* yellow-400 */
}

.fav-btn.active {
  color: #fbbf24;
  /* yellow-400 */
}

.edit-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.5;
  transition: opacity 0.2s;
  padding: 0 4px;
}

.edit-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.slug-id:hover {
  background: rgba(255, 255, 255, 0.1);
  opacity: 1;
  color: var(--accent-primary);
}

.badge {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 20px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge.easy {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.badge.medium {
  background: rgba(234, 179, 8, 0.2);
  color: #facc15;
}

.badge.hard {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

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
  padding-top: var(--spacing-md);
  font-size: 1rem;
  line-height: 1.6;
}

/* Markdown Styles */
:deep(.markdown-body h1),
:deep(.markdown-body h2),
:deep(.markdown-body h3) {
  color: var(--text-primary);
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 700;
}

:deep(.markdown-body h3) {
  font-size: 1.1rem;
}

:deep(.markdown-body p) {
  margin-bottom: 1em;
}

:deep(.markdown-body ul),
:deep(.markdown-body ol) {
  margin-bottom: 1em;
  padding-left: 1.5em;
}

:deep(.markdown-body li) {
  margin-bottom: 0.5em;
}

:deep(.markdown-body strong) {
  color: var(--accent-primary);
  font-weight: 700;
}

:deep(.markdown-body table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1em;
  font-size: 0.9em;
}

:deep(.markdown-body th),
:deep(.markdown-body td) {
  border: 1px solid var(--border-color);
  padding: 8px 12px;
  text-align: left;
}

:deep(.markdown-body th) {
  background: rgba(255, 255, 255, 0.05);
  font-weight: 600;
  color: var(--text-primary);
}

:deep(.markdown-body blockquote) {
  border-left: 4px solid var(--accent-secondary);
  background: rgba(255, 255, 255, 0.05);
  margin: 1em 0;
  padding: 0.5em 1em;
  color: var(--text-secondary);
}

:deep(.markdown-body code) {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 4px;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 0.9em;
  color: var(--accent-primary);
}

:deep(.markdown-body pre) {
  background: #0d1117;
  padding: 1em;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1em;
  border: 1px solid var(--border-color);
}

:deep(.markdown-body pre code) {
  background: transparent;
  padding: 0;
  color: inherit;
  font-size: 0.9em;
}

@media (max-width: 640px) {
  /* .card-header {
    flex-direction: column;
    align-items: flex-start;
  } */

  .question-title {
    width: 100%;
    margin-bottom: var(--spacing-sm);
    padding-right: 0;
  }

  .card-meta {
    width: 100%;
    justify-content: flex-start;
  }

  .icon-chevron {
    margin-left: auto;
  }
}
</style>
