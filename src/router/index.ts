import { createRouter, createWebHistory } from 'vue-router';
import StudyView from '../modules/quiz/views/StudyView.vue';
import QuizView from '../modules/quiz/views/QuizView.vue';
import LeaderboardView from '../views/LeaderboardView.vue';
import AuthView from '../modules/auth/views/AuthView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/study',
      name: 'study',
      component: StudyView
    },
    {
      path: '/auth',
      name: 'auth',
      component: AuthView
    },
    {
      path: '/panic',
      name: 'panic',
      component: () => import('../modules/quiz/views/PanicView.vue')
    },
    {
      path: '/quiz',
      name: 'quiz',
      component: QuizView
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: LeaderboardView
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../modules/user/views/ProfileView.vue')
    }
  ]
});

export default router;
