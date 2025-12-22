import { createFileRoute, redirect } from '@tanstack/react-router';
import { RecipesDashboardPage } from '../../../pages/patient/RecipesDashboardPage';
import { useAuthStore } from '../../../features/authStore';

export const Route = createFileRoute('/profile/recipe/')({
  component: RecipesDashboardPage,
  beforeLoad: ({ location }) => {
    const user = useAuthStore.getState().user;
    
    // 1. Проверка авторизации
    if (!user) {
      throw redirect({ to: '/auth/login', search: { redirect: location.href } });
    }

    // 2. Проверка ролей (Только Педиатр или Фармацевт)
    const allowedRoles = ['pediator', 'pharmacist', 'admin']; // 'pediator' - как у тебя в базе
    if (!allowedRoles.includes(user.role ?? '')) {
      // Если это пациент или кто-то левый -> на главную или 403
      throw redirect({ to: '/' });
    }
  },
});