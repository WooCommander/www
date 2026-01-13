<script setup lang="ts">
import { ref, computed, onUnmounted, onMounted } from 'vue';
import { type QuizTopic, type QuizQuestion } from '../data/quiz_data';
import { QuestionStore } from '../services/QuestionStore';
import { ExamService } from '../services/ExamService';
import type { CustomQuiz } from '../types';

// Components
import QuizMenu from '../features/quiz/components/QuizMenu.vue';
import QuizRunner from '../features/quiz/components/QuizRunner.vue';
import QuizResults from '../features/quiz/components/QuizResults.vue';
import QuizTopicEditor from '../features/quiz/components/QuizTopicEditor.vue';
import QuizCreateModal from '../features/quiz/components/QuizCreateModal.vue';
import EditModal from '../features/editor/components/EditModal.vue';

// Composables
import { useQuizSession } from '../features/quiz/composables/useQuizSession';

const {
    currentQuiz,
    currentQuestionIndex,
    userAnswers,
    showResults,
    currentInputAnswer,
    isShaking,
    timeRemaining,
    formattedTime,
    activeQuestion,
    progress,
    calculateScore,
    startQuiz,
    startExamMode,
    stopTimer,
    onSelectOption,
    nextQuestion,
    resetQuiz
} = useQuizSession();


// View State
const viewMode = ref<'topic' | 'category' | 'exam' | 'editor'>('topic');
const isQuizEditorOpen = ref(false); // For Creating Custom Quiz
const isEditModalOpen = ref(false); // For Editing Question
const editingTopic = ref<QuizTopic | null>(null);
const questionToEdit = ref<any>(null); // For EditModal

onMounted(async () => {
    await QuestionStore.initialize();
});

onUnmounted(() => {
    stopTimer();
});

// --- Computed Data ---
// Merge static quizzes with user questions AND custom quizzes
const allQuizzes = computed(() => QuestionStore.getQuizzes.value);
const allCategories = computed(() => {
    const cats = new Set(allQuizzes.value.map((q: QuizTopic) => q.category));
    return Array.from(cats).sort() as string[];
});

// Group quizzes by category
const quizzesByCategory = computed(() => {
    const groups: Record<string, QuizTopic[]> = {};
    allQuizzes.value.forEach((q: QuizTopic) => {
        if (!groups[q.category]) {
            groups[q.category] = [];
        }
        groups[q.category]!.push(q);
    });
    return groups;
});

// --- Actions ---

// Helper: Shuffle Array
const shuffle = <T>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = arr[i]!;
        arr[i] = arr[j]!;
        arr[j] = temp;
    }
    return arr;
};

const handleStartQuiz = (quiz: QuizTopic) => {
    startQuiz(quiz);
};

// Start Category Mode (Random 20)
const handleStartCategory = (category: string) => {
    const topics = quizzesByCategory.value[category] || [];
    const allQuestions = topics.flatMap(t => t.questions);
    const selectedQuestions = shuffle(allQuestions).slice(0, 20);

    const quiz: QuizTopic = {
        id: `cat-${category}`,
        title: `Тест по теме: ${category}`,
        category: category,
        questions: selectedQuestions
    };
    startQuiz(quiz);
};

// Start Exam Mode (Random 50, 45 mins)
const handleStartExam = () => {
    // Generate True Exam using ExamService
    const quiz = ExamService.generateExam({
        totalQuestions: 50,
        distribution: { easy: 0.3, medium: 0.5, hard: 0.2 }
    });

    startExamMode(quiz);
};

const goBack = () => {
    stopTimer();
    currentQuiz.value = null;
    showResults.value = false;
    editingTopic.value = null; // Also clear editor topic
};


// --- Editor Actions ---

const openEditor = (topic: QuizTopic) => {
    editingTopic.value = topic;
};

// Open Modal to Edit existing question
const openEditQuestionModal = (q: QuizQuestion) => {
    // Map QuizQuestion to Question interface for Modal
    questionToEdit.value = {
        id: q.id,
        title: q.text,
        answer: q.correctAnswer,
        category: editingTopic.value?.category || 'General',
        difficulty: 'Medium',
        type: q.type,
        options: q.options
    };
    isEditModalOpen.value = true;
};

// Open Modal to Add New Question
const openAddQuestionModal = () => {
    if (!editingTopic.value) return;
    questionToEdit.value = null; // New question
    // We pass categories via props to Modal
    isEditModalOpen.value = true;
};

const saveQuestion = async (q: any) => {
    // q is Question interface
    if (editingTopic.value) {
        q.category = editingTopic.value.category;
    }
    await QuestionStore.saveQuestion(q);
    isEditModalOpen.value = false;
};

const deleteQuestion = async (id: string) => {
    if (confirm('Удалить вопрос?')) {
        await QuestionStore.deleteQuestion(id);
    }
};

const saveCustomQuiz = async (quiz: CustomQuiz) => {
    await QuestionStore.saveCustomQuiz(quiz);
    isQuizEditorOpen.value = false;
};

</script>

<template>
    <main class="container quiz-container">

        <!-- Menu / Overview -->
        <QuizMenu v-if="!currentQuiz && !editingTopic" :view-mode="viewMode" :all-categories="allCategories"
            :quizzes-by-category="quizzesByCategory" @update:view-mode="viewMode = $event" @start-quiz="handleStartQuiz"
            @start-category="handleStartCategory" @start-exam="handleStartExam" @open-editor="openEditor"
            @create-quiz="isQuizEditorOpen = true" />

        <!-- Editor Detail Mode -->
        <QuizTopicEditor v-else-if="editingTopic" :topic="editingTopic" @back="editingTopic = null"
            @add-question="openAddQuestionModal" @edit-question="openEditQuestionModal"
            @delete-question="deleteQuestion" />

        <!-- Active Quiz Runner -->
        <QuizRunner v-else-if="!showResults && activeQuestion && currentQuiz" :current-quiz="currentQuiz"
            :active-question="activeQuestion" :current-question-index="currentQuestionIndex" :progress="progress"
            :formatted-time="formattedTime" :time-remaining="timeRemaining" :is-shaking="isShaking"
            v-model:current-input-answer="currentInputAnswer" :user-answers="userAnswers" @go-back="goBack"
            @select-option="onSelectOption" @next-question="() => nextQuestion(viewMode)" />

        <!-- Results -->
        <QuizResults v-else-if="showResults && currentQuiz" :current-quiz="currentQuiz" :score-data="calculateScore"
            :user-answers="userAnswers" @retry="resetQuiz" @go-back="goBack" />

    </main>

    <!-- Modals -->
    <QuizCreateModal :is-open="isQuizEditorOpen" @close="isQuizEditorOpen = false" @save="saveCustomQuiz" />

    <EditModal :is-open="isEditModalOpen" :question="questionToEdit" :categories="allCategories"
        @close="isEditModalOpen = false" @save="saveQuestion"
        @delete="(id) => { deleteQuestion(id as string); isEditModalOpen = false; }" />
</template>

<style scoped>
.quiz-container {
    padding-top: var(--spacing-xl);
    padding-bottom: var(--spacing-xl);
    max-width: 800px;
}
</style>
