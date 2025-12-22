import { createFileRoute, redirect } from '@tanstack/react-router';
import { ReceptionsDashboardPage } from '../../../pages/patient/ReceptionsDashboardPage';
import { useAuthStore } from '../../../features/authStore';

export const Route = createFileRoute('/profile/arranged-reception/dashboard')({
  component: ReceptionsDashboardPage,
  beforeLoad: ({ location }) => {
    // Проверка авторизации: пускаем и пациентов, и врачей
    const user = useAuthStore.getState().user;
    if (!user) {
      throw redirect({
        to: '/auth/login',
        search: { redirect: location.href },
      });
    }

    const allowedRoles = ['patient', 'pediator', 'admin'];
    const userRole = user.role ?? '';
    console.log("CHECKING:", userRole, "IN", allowedRoles);
    if (!allowedRoles.includes(userRole)) {
      // Redirect unauthorized roles (e.g. pharmacists shouldn't see this?)
      throw redirect({ to: '/' });
    }
  },
});