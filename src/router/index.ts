import { createRouter, createWebHistory } from 'vue-router';
import StudyView from '../views/StudyView.vue';
import QuizView from '../views/QuizView.vue';
import LeaderboardView from '../views/LeaderboardView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'study',
      component: StudyView
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
    }
  ]
});

export default router;
