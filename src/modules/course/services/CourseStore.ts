import { reactive } from 'vue';
import { CourseService, type Course } from './CourseService';

interface CourseState {
    courses: Course[];
    currentCourse: Course | null;
    isLoading: boolean;
}

const state = reactive<CourseState>({
    courses: [],
    currentCourse: null,
    isLoading: false
});

export const CourseStore = {
    get state() { return state; },

    get currentCourse() { return state.currentCourse; },
    get courses() { return state.courses; },

    async initialize() {
        if (state.courses.length > 0) return; // Already loaded

        state.isLoading = true;
        try {
            state.courses = await CourseService.getAllCourses();

            // Restore selection
            const saved = localStorage.getItem('interView_currentCourse');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Verify it still exists
                    const exists = state.courses.find(c => c.id === parsed.id);
                    if (exists) {
                        state.currentCourse = exists;
                    } else {
                        localStorage.removeItem('interView_currentCourse');
                    }
                } catch {
                    localStorage.removeItem('interView_currentCourse');
                }
            }
        } finally {
            state.isLoading = false;
        }
    },

    setCourse(course: Course | null) {
        state.currentCourse = course;
        if (course) {
            localStorage.setItem('interView_currentCourse', JSON.stringify(course));
        } else {
            localStorage.removeItem('interView_currentCourse');
        }

        // Trigger page refresh or allow reactivity to handle it?
        // Ideally reactivity. But QuestionStore needs to reload.
        // We can let components watch CourseStore.currentCourse
        // Or we can explicitly call QuestionStore.initialize() if needed.
        // For now, simple state update.
        window.dispatchEvent(new Event('course-changed')); // Optional custom event if non-reactive parts need it
    }
};
