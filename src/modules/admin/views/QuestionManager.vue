<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import BaseButton from '../../../shared/ui/BaseButton.vue';
import BaseInput from '../../../shared/ui/BaseInput.vue';
import { AdminService } from '../services/AdminService';
import { NotificationService } from '../../../shared/services/NotificationService';

const questions = ref<any[]>([]);
const loading = ref(false);
const searchQuery = ref('');

// Modal State
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);

const form = ref({
    title: '',
    answer: '',
    category: '',
    difficulty: 'Medium',
    type: 'input'
});

const loadQuestions = async () => {
    try {
        loading.value = true;
        questions.value = await AdminService.getAllQuestions() || [];
    } catch (e) {
        // handled by service
    } finally {
        loading.value = false;
    }
};

const syncQuestions = async () => {
    if (!confirm('Это полностью перезапишет таблицу questions из файла questions.ts. Продолжить?')) return;

    loading.value = true;
    try {
        await AdminService.migrateQuestionsFromCode();
        await loadQuestions();
    } finally {
        loading.value = false;
    }
};

const openAddModal = () => {
    isEditing.value = false;
    editingId.value = null;
    form.value = { title: '', answer: '', category: 'JavaScript', difficulty: 'Medium', type: 'input' };
    showModal.value = true;
};

const openEditModal = (q: any) => {
    isEditing.value = true;
    editingId.value = q.id;
    form.value = { ...q };
    showModal.value = true;
};

const saveQuestion = async () => {
    try {
        if (isEditing.value && editingId.value) {
            await AdminService.updateQuestion(editingId.value, form.value);
            NotificationService.success('Вопрос обновлен');
        } else {
            await AdminService.createQuestion(form.value);
            NotificationService.success('Вопрос создан');
        }
        showModal.value = false;
        loadQuestions();
    } catch (e: any) {
        NotificationService.error('Ошибка сохранения: ' + e.message);
    }
};

const deleteQuestion = async (id: string) => {
    if (!confirm('Удалить этот вопрос?')) return;
    try {
        await AdminService.deleteQuestion(id);
        NotificationService.success('Вопрос удален');
        loadQuestions();
    } catch (e) {
        NotificationService.error('Ошибка удаления');
    }
};

const filteredQuestions = computed(() => {
    const q = searchQuery.value.toLowerCase();
    return questions.value.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
});

onMounted(() => {
    loadQuestions();
});
</script>

<template>
    <div class="question-manager">
        <header class="page-header">
            <div class="header-left">
                <h1>Управление Вопросами</h1>
                <span class="count-badge" v-if="questions.length">{{ questions.length }}</span>
            </div>

            <div class="actions">
                <input v-model="searchQuery" placeholder="🔍 Поиск..." class="search-input" />
                <BaseButton variant="primary" @click="openAddModal">➕ Создать</BaseButton>
                <BaseButton variant="secondary" @click="syncQuestions">📥 Миграция</BaseButton>
            </div>
        </header>

        <div class="content-card">
            <p v-if="loading" class="no-data">Загрузка...</p>
            <p v-else-if="questions.length === 0" class="no-data">
                В базе нет вопросов. Нажмите "Миграция", чтобы загрузить их из файла.
            </p>

            <div v-else class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th width="50">ID</th>
                            <th>Вопрос</th>
                            <th width="150">Категория</th>
                            <th width="100">Сложность</th>
                            <th width="100">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="q in filteredQuestions" :key="q.id">
                            <td class="id-col" :title="q.id">{{ q.id.toString().slice(0, 4) }}...</td>
                            <td class="title-col">{{ q.title }}</td>
                            <td>
                                <span class="badge category">{{ q.category }}</span>
                            </td>
                            <td>
                                <span class="badge difficulty" :class="q.difficulty?.toLowerCase()">{{ q.difficulty ||
                                    'Medium' }}</span>
                            </td>
                            <td class="actions-col">
                                <button class="icon-btn" @click="openEditModal(q)">✏️</button>
                                <button class="icon-btn delete" @click="deleteQuestion(q.id)">🗑️</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Edit Modal -->
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
            <div class="modal-card">
                <h2>{{ isEditing ? 'Редактировать вопрос' : 'Новый вопрос' }}</h2>

                <form @submit.prevent="saveQuestion" class="modal-form">
                    <BaseInput v-model="form.title" label="Вопрос" placeholder="Текст вопроса..." required />

                    <div class="form-group">
                        <label>Ответ / Объяснение</label>
                        <textarea v-model="form.answer" rows="4" required></textarea>
                    </div>

                    <div class="row">
                        <BaseInput v-model="form.category" label="Категория" placeholder="JavaScript, CSS..."
                            required />

                        <div class="form-group">
                            <label>Сложность</label>
                            <select v-model="form.difficulty">
                                <option>Easy</option>
                                <option>Medium</option>
                                <option>Hard</option>
                            </select>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <BaseButton type="button" variant="ghost" @click="showModal = false">Отмена</BaseButton>
                        <BaseButton type="submit" variant="primary">Сохранить</BaseButton>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    h1 {
        margin: 0;
        font-size: 1.8rem;
    }
}

.count-badge {
    background: var(--bg-secondary);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.9rem;
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
}

.actions {
    display: flex;
    gap: 12px;
}

.search-input {
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--bg-card);
    color: var(--text-primary);
    width: 200px;

    &:focus {
        outline: none;
        border-color: var(--accent-primary);
    }
}

.content-card {
    background: var(--bg-card);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    overflow: hidden;
}

.no-data {
    padding: 40px;
    text-align: center;
    color: var(--text-secondary);
}

.table-container {
    overflow-x: auto;
}

.data-table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
        padding: 12px 16px;
        text-align: left;
        border-bottom: 1px solid var(--border-color);
    }

    th {
        background: rgba(0, 0, 0, 0.2);
        font-weight: 600;
        color: var(--text-secondary);
        font-size: 0.9rem;
    }

    tr:last-child td {
        border-bottom: none;
    }

    tr:hover td {
        background: rgba(255, 255, 255, 0.02);
    }
}

.id-col {
    color: var(--text-secondary);
    font-family: monospace;
    font-size: 0.85rem;
}

.title-col {
    font-weight: 500;
    max-width: 400px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.badge {
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 600;

    &.category {
        background: rgba(59, 130, 246, 0.1);
        color: #60a5fa;
    }

    &.difficulty {
        background: rgba(107, 114, 128, 0.1);
        color: #9ca3af;

        &.easy {
            background: rgba(34, 197, 94, 0.1);
            color: #4ade80;
        }

        &.medium {
            background: rgba(245, 158, 11, 0.1);
            color: #fbbf24;
        }

        &.hard {
            background: rgba(239, 68, 68, 0.1);
            color: #f87171;
        }
    }
}

.actions-col {
    display: flex;
    gap: 8px;
}

.icon-btn {
    background: transparent;
    border: none;
    font-size: 1.1rem;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;

    &:hover {
        opacity: 1;
    }

    &.delete:hover {
        opacity: 1;
        transform: scale(1.1);
    }
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
}

.modal-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    width: 90%;
    max-width: 500px;
    padding: 24px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);

    h2 {
        margin-top: 0;
        margin-bottom: 20px;
        font-size: 1.5rem;
    }
}

.modal-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    label {
        color: var(--text-secondary);
        font-size: 0.9rem;
    }

    textarea,
    select {
        background: var(--bg-input);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 10px;
        font-family: inherit;
        color: var(--text-primary);

        &:focus {
            outline: none;
            border-color: var(--accent-primary);
        }
    }

    textarea {
        resize: vertical;
    }
}

.row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 16px;
}
</style>
