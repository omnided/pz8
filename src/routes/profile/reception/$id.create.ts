import { createFileRoute } from '@tanstack/react-router';
import { CreateReceptionResultPage } from '../../../pages/patient/CreateReceptionResultPage';

export const Route = createFileRoute('/profile/reception/$id/create')({
  component: CreateReceptionResultPage ,
});
