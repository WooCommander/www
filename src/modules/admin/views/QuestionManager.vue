<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import BaseButton from '../../../shared/ui/BaseButton.vue';
import { AdminService } from '../services/AdminService';
import { NotificationService } from '../../../shared/services/NotificationService';
import EditModal from '../../../features/editor/components/EditModal.vue';
import { UserService } from '../../../services/UserService';
import type { Question, UserProfile } from '../../../shared/types';
import { CourseService, type Course } from '../../course/services/CourseService';

const questions = ref<Question[]>([]);
const courses = ref<Course[]>([]);
const selectedCourseId = ref<string>('');
const loading = ref(false);
const searchQuery = ref('');
const currentUser = ref<UserProfile | null>(null);

// Modal State
const showEditModal = ref(false);
const editingQuestion = ref<Question | null>(null);

// Get unique categories for Modal
const categories = computed(() => {
    const cats = new Set(questions.value.map(q => q.category));
    return Array.from(cats).sort();
});

const loadQuestions = async () => {
    try {
        loading.value = true;

        // Load courses first to set default filter
        courses.value = await CourseService.getAllCourses();
        if (courses.value.length > 0 && !selectedCourseId.value) {
            selectedCourseId.value = courses.value[0].id;
        }

        const [qs, session] = await Promise.all([
            AdminService.getAllQuestions(),
            UserService.getSession()
        ]);

        questions.value = qs || [];

        if (session?.user) {
            const userProfile = await UserService.getProfile(session.user.id);
            currentUser.value = { ...userProfile, id: session.user.id } as UserProfile;
        }

    } catch (e) {
        // handled by service mostly
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
    editingQuestion.value = null;
    showEditModal.value = true;
};

const openEditModal = (q: Question) => {
    // RBAC Check: Admin can edit ALL. Editor can edit OWN.
    // (Ideally this is enforced by API, but good for UI feedback)
    const isAdmin = (currentUser.value as any)?.role === 'admin';
    const isOwner = (q as any).author_id === currentUser.value?.id;

    if (!isAdmin && !isOwner) {
        NotificationService.error('Редактировать можно только свои вопросы (или быть Админом)');
        return;
    }

    editingQuestion.value = q;
    showEditModal.value = true;
};

const handleSave = async (questionData: Question) => {
    try {
        if (editingQuestion.value) {
            // Update
            await AdminService.updateQuestion(questionData.id.toString(), questionData);
            NotificationService.success('Вопрос обновлен');
        } else {
            // Create
            if (!selectedCourseId.value) {
                return NotificationService.error('Выберите курс перед созданием вопроса!');
            }

            const { id, ...dataToSave } = questionData;

            // Add author_id and COURSE_ID
            const payload = {
                ...dataToSave,
                author_id: currentUser.value?.id,
                course_id: selectedCourseId.value
            };

            await AdminService.createQuestion(payload);
            NotificationService.success('Вопрос создан');
        }
        showEditModal.value = false;
        loadQuestions();
    } catch (e: any) {
        NotificationService.error('Ошибка сохранения: ' + e.message);
    }
};

const handleDelete = async (id: number | string) => {
    if (!confirm('Удалить этот вопрос?')) return;
    try {
        await AdminService.deleteQuestion(id.toString());
        NotificationService.success('Вопрос удален');
        showEditModal.value = false;
        loadQuestions();
    } catch (e) {
        NotificationService.error('Ошибка удаления');
    }
};

const filteredQuestions = computed(() => {
    let list = questions.value;

    // 1. Filter by Course
    if (selectedCourseId.value) {
        list = list.filter(q => (q as any).course_id === selectedCourseId.value);
    }

    // 2. Search
    const q = searchQuery.value.toLowerCase();
    return list.filter(item =>
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
                <select v-model="selectedCourseId" class="course-select">
                    <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.icon }} {{ c.title }}</option>
                </select>
                <input v-model="searchQuery" placeholder="🔍 Поиск..." class="search-input" />
                <BaseButton variant="primary" @click="openAddModal">➕ Создать</BaseButton>
                <!-- <BaseButton variant="secondary" @click="syncQuestions">📥 Миграция</BaseButton> -->
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
                            <td class="id-col" :title="q.id.toString()">{{ q.id.toString().slice(0, 4) }}...</td>
                            <td class="title-col">{{ q.title }}</td>
                            <td>
                                <span class="badge category">{{ q.category }}</span>
                            </td>
                            <td>
                                <span class="badge difficulty" :class="q.difficulty?.toLowerCase()">{{ q.difficulty ||
                                    'Medium' }}</span>
                            </td>
                            <td class="actions-col">
                                <button class="icon-btn" @click="openEditModal(q)" title="Редактировать">✏️</button>
                                <button class="icon-btn delete" @click="handleDelete(q.id)" title="Удалить">🗑️</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Shared Edit Modal -->
        <EditModal :is-open="showEditModal" :question="editingQuestion" :categories="categories"
            @close="showEditModal = false" @save="handleSave" @delete="handleDelete" />
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

.course-select {
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--bg-card);
    color: var(--text-primary);
    min-width: 150px;
    cursor: pointer;

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
</style>
