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
      path: '/update-password',
      name: 'update-password',
      component: () => import('../modules/auth/views/UpdatePasswordView.vue')
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
        },
        {
          path: 'courses',
          name: 'admin-courses',
          component: () => import('../modules/admin/views/CourseManager.vue')
        }
      ]
    }
  ]
});

// Navigation Guards & Security
router.beforeEach(async (to, _from, next) => {
  const { data: { session } } = await import('../shared/api/supabase').then(m => m.supabase.auth.getSession());

  // 1. Auth Guard for /admin or /profile
  if ((to.path.startsWith('/admin') || to.path.startsWith('/profile')) && !session) {
    next('/auth');
    return;
  }

  // 2. Ban Check (Global)
  if (session && to.path !== '/auth') {
    const { data: profile } = await import('../shared/api/supabase').then(m => m.supabase
      .from('profiles')
      .select('is_banned')
      .eq('id', session.user.id)
      .single()
    );

    if (profile?.is_banned) {
      await import('../shared/api/supabase').then(m => m.supabase.auth.signOut());
      alert('Ваш аккаунт заблокирован. Свяжитесь с администрацией.');
      next('/auth');
      return;
    }
  }

  // 3. Course Selection Guard
  // Require course for Study, Quiz, Panic modes
  const courseProtectedPaths = ['/study', '/quiz', '/panic'];
  const requiresCourse = courseProtectedPaths.some(path => to.path.startsWith(path));

  if (requiresCourse) {
    const selectedCourse = localStorage.getItem('interView_currentCourse');
    if (!selectedCourse) {
      // Redirect to Home with query to show selection needs attention?
      // Or just standard home.
      alert('Сначала выберите курс!');
      next('/');
      return;
    }
  }

  next();
});

export default router;
