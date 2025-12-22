import { createFileRoute} from '@tanstack/react-router';
import { MySickLeavesPage } from '../../../pages/patient/MySickLeavesPage';

export const Route = createFileRoute('/profile/sick_leave/my')({
  component: MySickLeavesPage,
});