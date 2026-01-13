import { createRouter, createWebHistory } from 'vue-router';
import StudyView from '../components/StudyView.vue';
import QuizView from '../components/QuizView.vue';
import LeaderboardView from '../components/LeaderboardView.vue';

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
