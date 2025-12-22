import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useCreateReception } from '../../features/receptions/api'; // Хук создания Reception (результата)

export const CreateReceptionResultPage = () => {
  const { id } = useParams({ strict: false }); // ID arranged_reception
  const navigate = useNavigate();
  const createMutation = useCreateReception();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { diagnosis: '', assignment: '' }
  });

  const onSubmit = (data: any) => {
    createMutation.mutate({
      arranged_id: Number(id),
      diagnosis: data.diagnosis,
      assignment: data.assignment
    }, {
      onSuccess: () => {
        // После создания перекидываем на список всех результатов
        navigate({ to: '/profile/arranged-reception/dashboard' });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Завершення прийому (ID: {id})</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
        <div>
          <label className="block font-bold text-gray-700 mb-2">Діагноз</label>
          <input 
            {...register('diagnosis', { required: true })}
            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Введіть діагноз..."
          />
          {errors.diagnosis && <span className="text-red-500 text-sm">Обов'язкове поле</span>}
        </div>

        <div>
          <label className="block font-bold text-gray-700 mb-2">Призначення</label>
          <textarea 
            {...register('assignment')}
            className="w-full border border-gray-300 rounded-xl p-3 h-32 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Рекомендації, ліки..."
          />
        </div>

        <button 
          type="submit" 
          disabled={createMutation.isPending}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition"
        >
          {createMutation.isPending ? 'Збереження...' : 'Зберегти результат'}
        </button>
      </form>
    </div>
  );
};