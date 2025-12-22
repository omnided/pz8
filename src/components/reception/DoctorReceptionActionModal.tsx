import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
// import { useMutation, useQueryClient } from '@tanstack/react-query'; // Больше не нужно
import { ArrangedReception } from '../../features/arranged_reception/types';

// Импортируем твой готовый хук
import { useCreateReception } from '../../features/receptions/api'; // Убедись, что путь верный
import { CreateRecipeModal } from '../recipe/CreateRecipeModal';


interface Props {
  reception: ArrangedReception | null;
  isOpen: boolean;
  onClose: () => void;
}

type FormValues = {
  diagnosis: string;
  assignment: string;
};

export const DoctorReceptionActionModal: React.FC<Props> = ({ reception, isOpen, onClose }) => {
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  // 1. Используем твой хук
  const { mutate: createReception, isPending } = useCreateReception();

  if (!isOpen || !reception) return null;

  const hasResult = !!reception.result;

  // 2. Сабмит формы
  const onSubmit = (data: FormValues) => {
    // Вызываем мутацию
    createReception({
      arranged_id: reception.id, // Важно: убедись, что твой createReception принимает этот формат
      diagnosis: data.diagnosis,
      assignment: data.assignment
    }, {
      // 3. UI-действия при успехе (закрытие, алерт)
      onSuccess: () => {
        alert('Прийом завершено, результат збережено!');
        onClose();
      },
      onError: (err: any) => {
        alert(`Помилка: ${err.message || 'Не вдалося зберегти'}`);
      }
    });
  };

  if (!isOpen || !reception) return null;

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* Шапка */}
        <div className="bg-blue-600 p-6 text-white flex justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold">Прийом #{reception.id} — {reception.patient?.patient_fullname}</h2>
            <p className="opacity-80 text-sm">Статус: {reception.status}</p>
          </div>
          <button onClick={onClose} className="text-2xl hover:text-gray-200">&times;</button>
        </div>

        {/* Контент */}
        <div className="p-6 overflow-y-auto">
          
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Скарги пацієнта</h3>
            <p className="text-gray-800 italic">"{reception.reason}"</p>
          </div>
          
          <div className="mb-6 flex justify-end">
               <button 
                 type="button"
                 onClick={() => setIsRecipeModalOpen(true)}
                 className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-xl font-bold hover:bg-purple-200 transition"
               >
                 💊 Виписати рецепт
               </button>
            </div>
          {/* ЛОГИКА ОТОБРАЖЕНИЯ */}
          
          {hasResult ? (
            // ВАРИАНТ 1: Результат уже есть (Просмотр)
            <div className="bg-green-50 p-6 rounded-xl border border-green-100">
               <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                 ✅ Медичний висновок
               </h3>
               <div className="space-y-4">
                 <div>
                   <span className="text-xs font-bold text-gray-500 uppercase">Діагноз</span>
                   <p className="font-medium text-lg">{reception.result?.diagnosis}</p>
                 </div>
                 <div>
                   <span className="text-xs font-bold text-gray-500 uppercase">Призначення</span>
                   <p className="whitespace-pre-wrap text-gray-700">{reception.result?.assignment || '-'}</p>
                 </div>
               </div>
               
               <div className="mt-6 text-right">
                  <button onClick={onClose} className="text-green-700 font-bold hover:underline">Закрити</button>
               </div>
            </div>
          ) : (
            // ВАРИАНТ 2: Результата нет (Форма создания)
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
               <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Заповнення результатів</h3>
               
               <div>
                 <label className="block font-bold text-gray-700 mb-1">Діагноз</label>
                 <input 
                   {...register('diagnosis', { required: 'Введіть діагноз' })}
                   className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                   placeholder="Наприклад: Гострий бронхіт"
                 />
                 {errors.diagnosis && <span className="text-red-500 text-sm">{errors.diagnosis.message}</span>}
               </div>

               <div>
                 <label className="block font-bold text-gray-700 mb-1">Призначення та лікування</label>
                 <textarea 
                   {...register('assignment', { required: 'Введіть призначення' })}
                   className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                   placeholder="Ліки, режим, рекомендації..."
                 />
                 {errors.assignment && <span className="text-red-500 text-sm">{errors.assignment.message}</span>}
               </div>

               <div className="flex gap-3 pt-4">
                 <button 
                   type="button"
                   onClick={onClose}
                   className="flex-1 py-4 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
                 >
                   Скасувати
                 </button>
                 <button 
                   type="submit" 
                   disabled={isPending}
                   className="flex-[2] py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition disabled:opacity-70"
                 >
                   {isPending ? 'Збереження...' : 'Зберегти та завершити'}
                 </button>
               </div>
            </form>
          )}

        </div>
      </div>
    </div>
    <CreateRecipeModal 
        receptionId={reception.id}
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}/>
    </>
  );
};