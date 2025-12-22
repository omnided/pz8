import { createFileRoute } from '@tanstack/react-router';
import { CreateArrangedReceptionPage } from '../../../pages/patient/CreateArrangedReceptionPage';

export const Route = createFileRoute('/profile/arranged-reception/create')({
  component: CreateArrangedReceptionPage,
});