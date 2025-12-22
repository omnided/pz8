import { useForm } from 'react-hook-form';
import { useNavigate } from '@tanstack/react-router';
import { useCreateReception } from '../../features/arranged_reception/api'; 
import { format } from 'date-fns';

// Временные слоты клиники
const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

type FormValues = {
  date: string;
  time: string;
  reason: string;
};

export const CreateArrangedReceptionPage = () => {
  const navigate = useNavigate();
  const createMutation = useCreateReception();

  // Форма
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
    }
  });

  const selectedDate = watch('date');
  const selectedTime = watch('time');

  const onSubmit = (data: FormValues) => {
    // Отправляем только дату, время и причину
    createMutation.mutate({
      date: data.date,
      time: data.time,
      reason: data.reason,
    }, {
      onSuccess: () => {
        navigate({ to: '/profile/arranged-reception/dashboard' });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <button onClick={() => navigate({ to: '..' })} className="mb-6 text-gray-500 hover:text-blue-600 flex items-center gap-1 transition">
        &larr; Скасувати
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Створити запис</h1>
        <p className="text-gray-500">Оберіть зручний час, і вільний лікар прийме вашу заявку.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-8">
        
        {/* --- ЛЕВАЯ КОЛОНКА: ФОРМА --- */}
        <div className="flex-1 space-y-8">
          
          {/* Шаг 1: Дата и Время */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-8 h-8 flex items-center justify-center rounded-full text-sm">1</span>
              Дата та час візиту
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Бажана дата</label>
              <input 
                type="date"
                min={format(new Date(), 'yyyy-MM-dd')}
                {...register('date', { required: 'Оберіть дату' })}
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Доступні слоти</label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {TIME_SLOTS.map(time => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setValue('time', time)}
                    className={`py-2 px-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedTime === time 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
              <input type="hidden" {...register('time', { required: 'Оберіть час' })} />
              {errors.time && <p className="text-red-500 text-sm mt-2">{errors.time.message}</p>}
            </div>
          </section>

          {/* Шаг 2: Жалобы */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-8 h-8 flex items-center justify-center rounded-full text-sm">2</span>
              Причина звернення
            </h2>
            <textarea
              {...register('reason', { 
                required: 'Опишіть причину звернення',
                minLength: { value: 5, message: 'Опишіть детальніше (мінімум 5 символів)' } 
              })}
              placeholder="Опишіть ваші симптоми..."
              className="w-full border border-gray-300 rounded-xl p-4 min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            ></textarea>
            {errors.reason && <p className="text-red-500 text-sm mt-2">{errors.reason.message}</p>}
          </section>

        </div>

        {/* --- ПРАВАЯ КОЛОНКА: ИТОГО --- */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Ваша заявка</h3>
            
            <div className="space-y-6">
              {/* Информация о враче удалена, так как он назначается позже */}
              
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">📅</div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Дата та час</p>
                  <p className="font-medium text-gray-800">
                    {selectedDate ? format(new Date(selectedDate), 'dd.MM.yyyy') : '--.--.----'}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedTime || '--:--'}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg text-xs text-yellow-800 border border-yellow-100">
                Лікар буде призначений автоматично після підтвердження заявки.
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <button 
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? 'Створення...' : 'Створити заявку'}
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};