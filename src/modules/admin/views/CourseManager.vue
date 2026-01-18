<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BaseButton from '../../../shared/ui/BaseButton.vue';
import BaseInput from '../../../shared/ui/BaseInput.vue';
import { CourseService, type Course } from '../../course/services/CourseService';
import { NotificationService } from '../../../shared/services/NotificationService';

import { quizzes as staticQuizzes, type QuizTopic } from '../../../data/quiz_data';
import { AdminService } from '../services/AdminService';
import { UserService } from '../../../services/UserService';

const courses = ref<Course[]>([]);
const loading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);

const form = ref({
    title: '',
    description: '',
    icon: '🎓'
});

const loadCourses = async () => {
    loading.value = true;
    courses.value = await CourseService.getAllCourses();
    loading.value = false;
};

// ... existing openAddModal, openEditModal, saveCourse, deleteCourse ...

const importLegacyData = async () => {
    if (!confirm('Это импортирует ВСЕ старые хардкодные тесты (переменные, типы данных и т.д.) в базу данных и привяжет их к курсу "Frontend Interview". Продолжить?')) return;

    try {
        loading.value = true;

        // 1. Find target course
        let targetCourse = courses.value.find(c => c.title === 'Frontend Interview');
        if (!targetCourse) {
            // Fallback or create? Assume it exists from migration, or pick the first one.
            if (courses.value.length > 0) targetCourse = courses.value[0];
            else return NotificationService.error('Сначала создайте курс!');
        }

        if (!targetCourse) return; // Should be handled above but TS needs certainty

        const user = await UserService.getUser();
        if (!user) return NotificationService.error('Пользователь не найден');

        // Optional: Clear existing legacy questions to avoid duplicates?
        // Since we don't have a reliable way to identify "Legacy" vs "New" other than text match or author...
        // Let's just create them. User can delete manually if needed.
        // OR better: Ask user if they want to clear course first.
        if (confirm('Очистить все вопросы в этом курсе перед импортом? (Рекомендуется для избежания дубликатов)')) {
            // We need a service method for this.
            // For now, let's skip or we'd need to add deleteByCourseId to AdminService.
            // Adding deleteByCourseId to AdminServie is quick.
            await AdminService.deleteQuestionsByCourse(targetCourse.id);
        }

        // 2. Prepare Data
        const questionsToInsert: any[] = [];

        staticQuizzes.forEach((topic: QuizTopic) => {
            topic.questions.forEach(q => {
                questionsToInsert.push({
                    course_id: targetCourse!.id,
                    title: q.text,
                    answer: q.explanation || 'See options',
                    category: topic.category,
                    difficulty: 'Medium',
                    type: q.type,
                    // Fix: Pass raw object (array), let Supabase client serialize to JSONB
                    options: q.options || null,
                    code: q.codeSnippet,
                    author_id: user.id
                });
            });
        });

        // 3. Batch Insert
        // Split into chunks of 100 to be safe
        const chunkSize = 100;
        for (let i = 0; i < questionsToInsert.length; i += chunkSize) {
            const chunk = questionsToInsert.slice(i, i + chunkSize);
            await AdminService.bulkCreateQuestions(chunk);
        }

        NotificationService.success(`Импортировано ${questionsToInsert.length} вопросов!`);
        loadCourses(); // Refresh
    } catch (e: any) {
        NotificationService.error('Ошибка импорта: ' + e.message);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    loadCourses();
});

const openAddModal = () => {
    isEditing.value = false;
    editingId.value = null;
    form.value = { title: '', description: '', icon: '🎓' };
    showModal.value = true;
};

const openEditModal = (course: Course) => {
    isEditing.value = true;
    editingId.value = course.id;
    form.value = {
        title: course.title,
        description: course.description || '',
        icon: course.icon
    };
    showModal.value = true;
};

const saveCourse = async () => {
    if (!form.value.title) return;

    try {
        if (isEditing.value && editingId.value) {
            await CourseService.updateCourse(editingId.value, form.value);
            NotificationService.success('Курс обновлен');
        } else {
            await CourseService.createCourse(form.value);
            NotificationService.success('Курс создан');
        }
        showModal.value = false;
        loadCourses();
    } catch (e: any) {
        // Error handled in service
    }
};

const deleteCourse = async (id: string) => {
    if (!confirm('Удалить этот курс? Все вопросы внутри него тоже удалятся!')) return;
    try {
        await CourseService.deleteCourse(id);
        NotificationService.success('Курс удален');
        loadCourses();
    } catch (e) {
        // Handled
    }
};

onMounted(() => {
    loadCourses();
});
</script>

<template>
    <div class="course-manager">
        <header class="page-header">
            <h1>🎓 Курсы / Предметы</h1>
            <div class="header-actions">
                <BaseButton variant="secondary" @click="importLegacyData" title="Импорт старых JS вопросов">📥 Импорт
                    Legacy</BaseButton>
                <BaseButton variant="primary" @click="openAddModal">➕ Создать Курс</BaseButton>
            </div>
        </header>

        <div class="courses-grid">
            <div v-if="loading" class="loading">Загрузка...</div>

            <div v-else-if="courses.length === 0" class="empty-state">
                Нет курсов. Создайте первый!
            </div>

            <div v-else class="course-card" v-for="course in courses" :key="course.id">
                <div class="course-icon">{{ course.icon }}</div>
                <div class="course-info">
                    <h3>{{ course.title }}</h3>
                    <p>{{ course.description || 'Нет описания' }}</p>
                </div>
                <div class="course-actions">
                    <button class="btn-icon" @click="openEditModal(course)">✏️</button>
                    <button class="btn-icon delete" @click="deleteCourse(course.id)">🗑️</button>
                </div>
            </div>
        </div>

        <!-- Modal -->
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
            <div class="modal-card">
                <h2>{{ isEditing ? 'Редактировать курс' : 'Новый курс' }}</h2>
                <form @submit.prevent="saveCourse" class="modal-form">
                    <div class="row">
                        <div class="col-icon">
                            <label>Иконка</label>
                            <input v-model="form.icon" class="icon-input" placeholder="🎓" maxlength="2" />
                        </div>
                        <div class="col-title">
                            <BaseInput v-model="form.title" label="Название" placeholder="Например: Математика 5 класс"
                                required />
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Описание</label>
                        <textarea v-model="form.description" rows="3" placeholder="О чем этот курс?"></textarea>
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

.header-actions {
    display: flex;
    gap: 12px;
}

.courses-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
}

.course-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: transform 0.2s;

    &:hover {
        transform: translateY(-2px);
        border-color: var(--accent-primary);
    }
}

.course-icon {
    font-size: 2.5rem;
    background: var(--bg-secondary);
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.course-info {
    flex: 1;

    h3 {
        margin: 0 0 4px 0;
        font-size: 1.1rem;
    }

    p {
        margin: 0;
        font-size: 0.85rem;
        color: var(--text-secondary);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
}

.course-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.btn-icon {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 1.1rem;
    padding: 4px;
    opacity: 0.6;
    transition: opacity 0.2s;

    &:hover {
        opacity: 1;
    }

    &.delete:hover {
        transform: scale(1.1);
    }
}

.empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 40px;
    color: var(--text-secondary);
    background: var(--bg-card);
    border-radius: 12px;
    border: 1px dashed var(--border-color);
}

/* Modal Helpers */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    backdrop-filter: blur(4px);
}

.modal-card {
    background: var(--bg-card);
    padding: 24px;
    border-radius: 16px;
    width: 90%;
    max-width: 450px;
    border: 1px solid var(--border-color);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.row {
    display: flex;
    gap: 16px;
}

.col-icon {
    width: 60px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    label {
        font-size: 0.8rem;
        color: var(--text-secondary);
    }

    .icon-input {
        width: 100%;
        height: 42px;
        text-align: center;
        font-size: 1.5rem;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        color: var(--text-primary);

        &:focus {
            outline: none;
            border-color: var(--accent-primary);
        }
    }
}

.col-title {
    flex: 1;
}

.form-group {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    label {
        font-size: 0.9rem;
        color: var(--text-secondary);
    }

    textarea {
        background: var(--bg-input);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 10px;
        color: var(--text-primary);
        font-family: inherit;
        resize: none;

        &:focus {
            outline: none;
            border-color: var(--accent-primary);
        }
    }
}

.modal-actions {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}
</style>
