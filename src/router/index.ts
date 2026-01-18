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
    },
    {
      path: '/admin',
      component: () => import('../modules/admin/layout/AdminLayout.vue'),
      children: [
        {
          path: '',
          redirect: '/admin/questions'
        },
        {
          path: 'questions',
          name: 'admin-questions',
          component: () => import('../modules/admin/views/QuestionManager.vue')
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('../modules/admin/views/UserManager.vue')
        }
      ]
    }
  ]
});

// Navigation Guards & Security
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await import('../shared/api/supabase').then(m => m.supabase.auth.getSession());

  // 1. Auth Guard for /admin or /profile
  if ((to.path.startsWith('/admin') || to.path.startsWith('/profile')) && !session) {
    next('/auth');
    return;
  }

  // 2. Ban Check (Global)
  if (session && to.path !== '/auth') {
    // Optimization: Store this in a proper Store or Memoize? 
    // For now, simple direct check to be safe.
    const { data: profile } = await import('../shared/api/supabase').then(m => m.supabase
      .from('profiles')
      .select('is_banned')
      .eq('id', session.user.id)
      .single()
    );

    if (profile?.is_banned) {
      // Force logout if banned
      await import('../shared/api/supabase').then(m => m.supabase.auth.signOut());
      alert('Ваш аккаунт заблокирован. Свяжитесь с администрацией.');
      next('/auth');
      return;
    }
  }

  next();
});

export default router;
