<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Question } from '../types';

const props = defineProps<{
  question: Question | null;
  isOpen: boolean;
  categories: string[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', q: Question): void;
  (e: 'delete', id: number | string): void;
}>();

const formData = ref<Question>({
  id: '0',
  title: '',
  answer: '',
  category: 'JavaScript Core',
  difficulty: 'Medium',
  slug: ''
});

watch(() => props.question, (newQ) => {
  if (newQ) {
    formData.value = { ...newQ };
  } else {
    // New question defaults
    formData.value = {
      id: Date.now().toString(), // Temp ID as string
      title: '',
      answer: '',
      category: 'JavaScript Core',
      difficulty: 'Medium',
      slug: ''
    };
  }
}, { immediate: true });

const save = () => {
    emit('save', formData.value);
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>{{ question ? 'Редактировать вопрос' : 'Новый вопрос' }}</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      
      <form @submit.prevent="save" class="edit-form">
        <label>
          Вопрос
          <input v-model="formData.title" required placeholder="Заголовок вопроса" />
        </label>

        <label>
          Категория
          <input 
            v-model="formData.category" 
            list="categories-list" 
            required
            placeholder="Выберите или введите"
          />
          <datalist id="categories-list">
            <option v-for="cat in categories" :key="cat" :value="cat"></option>
          </datalist>
        </label>

        <label>
          Ответ (Markdown)
          <textarea v-model="formData.answer" rows="10" required placeholder="Текст ответа..."></textarea>
        </label>

        <label>
          Сложность
          <select v-model="formData.difficulty">
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </label>
        
        <div class="actions">
          <button v-if="question" type="button" class="btn-delete" @click="$emit('delete', formData.id)">Удалить</button>
          <div class="spacer"></div>
          <button type="button" class="btn-cancel" @click="$emit('close')">Отмена</button>
          <button type="submit" class="btn-save">Сохранить</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s;
}

.modal {
  background: var(--bg-card);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  padding: 0 8px;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

input, select, textarea {
  padding: 10px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 1rem;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.spacer {
  flex: 1;
}

.btn-save {
  background: var(--accent-primary);
  color: white;
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-weight: 600;
}

.btn-cancel {
  background: transparent;
  color: var(--text-secondary);
  padding: 10px 20px;
}

.btn-delete {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 10px 20px;
  border-radius: var(--radius-sm);
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.2);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
