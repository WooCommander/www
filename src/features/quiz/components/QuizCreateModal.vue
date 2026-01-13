<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { QuestionStore } from '../../../services/QuestionStore';
import type { CustomQuiz, Question } from '../../../types';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', quiz: CustomQuiz): void;
}>();

const title = ref('');
const description = ref('');
const selectedIds = ref<Set<string>>(new Set());
const searchQuery = ref('');

const allQuestions = computed(() => QuestionStore.getAllQuestions.value);

const filteredQuestions = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return allQuestions.value;
  return allQuestions.value.filter(q =>
    q.title.toLowerCase().includes(query) ||
    q.id.toString().includes(query) ||
    q.category.toLowerCase().includes(query)
  );
});

// Watch isOpen to reset form when opening
watch(() => props.isOpen, (val) => {
  if (val) {
    title.value = '';
    description.value = '';
    selectedIds.value = new Set();
    searchQuery.value = '';
  }
});

const toggleSelection = (id: string | number) => {
  const sId = id.toString();
  if (selectedIds.value.has(sId)) {
    selectedIds.value.delete(sId);
  } else {
    selectedIds.value.add(sId);
  }
};

const save = () => {
  if (!title.value.trim()) return;
  if (selectedIds.value.size === 0) {
    alert('Выберите хотя бы один вопрос');
    return;
  }

  const newQuiz: CustomQuiz = {
    id: Date.now().toString(),
    title: title.value,
    description: description.value,
    questionIds: Array.from(selectedIds.value),
    createdAt: Date.now()
  };

  emit('save', newQuiz);
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>Новый Тест</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <div class="editor-content">
        <label>
          Название
          <input v-model="title" required placeholder="Например: Hardcore JS" />
        </label>

        <label>
          Описание (опционально)
          <input v-model="description" placeholder="Краткое описание..." />
        </label>

        <div class="question-selector">
          <h4>Выберите вопросы ({{ selectedIds.size }})</h4>
          <input v-model="searchQuery" placeholder="Поиск вопросов..." class="search-small" />

          <div class="questions-list">
            <div v-for="q in filteredQuestions" :key="q.id" class="question-item"
              :class="{ selected: selectedIds.has(q.id.toString()) }" @click="toggleSelection(q.id)">
              <input type="checkbox" :checked="selectedIds.has(q.id.toString())" readonly />
              <div class="q-info">
                <span class="q-title">{{ q.title }}</span>
                <span class="q-meta">{{ q.category }} • {{ q.difficulty }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="actions">
          <button class="btn-cancel" @click="$emit('close')">Отмена</button>
          <button class="btn-save" @click="save">Создать Тест</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--bg-card);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 700px;
  height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.editor-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  flex: 1;
  overflow: hidden;
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--text-secondary);
}

input {
  padding: 10px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }
}

.question-selector {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  padding: 10px;
  border-radius: var(--radius-sm);
}

.questions-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.question-item {
  display: flex;
  gap: 10px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  align-items: flex-start;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &.selected {
    background: rgba(56, 189, 248, 0.1);
    border: 1px solid rgba(56, 189, 248, 0.3);
  }
}

.q-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.q-title {
  font-weight: 500;
  font-size: 0.95rem;
}

.q-meta {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.btn-save {
  background: var(--accent-primary);
  color: white;
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.btn-cancel {
  background: transparent;
  color: var(--text-secondary);
  padding: 10px 20px;
  border: none;
  cursor: pointer;
}
</style>
