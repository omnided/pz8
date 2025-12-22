import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import apiClient from '../../lib/axios';
import { ArrangedReception } from '../../features/arranged_reception/types';
import { format } from 'date-fns';

interface ReceptionModalProps {
  reception: ArrangedReception | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ResultFormData {
  diagnosis: string;
  assignment: string;
}

export const ReceptionModal: React.FC<ReceptionModalProps> = ({ reception, isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [isFormVisible, setIsFormVisible] = useState(false);
  
  // Хук формы
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ResultFormData>();

  // Мутация для создания результата (диагноза)
  const createResultMutation = useMutation({
    mutationFn: async (data: ResultFormData) => {
      if (!reception) return;
      // Отправляем запрос на создание записи в таблице 'reception'
      await apiClient.post('/receptions', {
        arranged_id: reception.id,
        diagnosis: data.diagnosis,
        assignment: data.assignment
      });
      // Также нужно обновить статус самого приема на "завершено" (если бэк это не делает сам)
      // await apiClient.patch(`/arranged-receptions/${reception.id}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receptions'] }); // Обновляем списки
      reset();
      setIsFormVisible(false);
      onClose(); // Закрываем окно
    },
  });

  if (!isOpen || !reception) return null;

  const onSubmit = (data: ResultFormData) => {
    createResultMutation.mutate(data);
  };

  const isCompleted = reception.status === 'завершено';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Затемнение фона */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Само окно */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Шапка */}
        <div className="bg-blue-600 p-6 text-white flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Прийом #{reception.id}</h2>
            <p className="opacity-90">
              {format(new Date(reception.appointment_date), 'dd.MM.yyyy')} о {reception.appointment_time.slice(0, 5)}
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl font-bold">
            &times;
          </button>
        </div>

        {/* Тело окна */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          
          {/* Инфо о пациенте */}
          <div className="flex gap-4 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
              👤
            </div>
            <div>
              <p className="text-sm text-gray-500 font-bold uppercase">Пацієнт</p>
              <p className="text-lg font-bold text-gray-800">{reception.patient?.patient_fullname}</p>
              {/* Можно добавить телефон или дату рождения, если есть в объекте */}
            </div>
          </div>

          {/* Причина обращения */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Скарги / Причина</h3>
            <div className="p-4 border border-gray-200 rounded-lg text-gray-700 bg-white">
              {reception.reason}
            </div>
          </div>

          {/* Зона действий (Если прием завершен - показываем инфо, если нет - форму) */}
          <div className="border-t border-gray-100 pt-6">
            {isCompleted ? (
              <div className="text-center py-4 bg-green-50 rounded-lg border border-green-100 text-green-800">
                ✅ Цей прийом завершено. Результати збережено.
                {/* Здесь можно добавить кнопку "Посмотреть результат" */}
              </div>
            ) : (
              <>
                {!isFormVisible ? (
                  <button
                    onClick={() => setIsFormVisible(true)}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <span>🩺</span> Провести огляд та додати результат
                  </button>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-gray-50 p-4 rounded-xl animate-in slide-in-from-top-2">
                    <h3 className="font-bold text-gray-800">Результати огляду</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Діагноз</label>
                      <input
                        {...register('diagnosis', { required: 'Вкажіть діагноз' })}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Наприклад: ГРВІ"
                      />
                      {errors.diagnosis && <span className="text-red-500 text-xs">{errors.diagnosis.message}</span>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Призначення та рекомендації</label>
                      <textarea
                        {...register('assignment', { required: 'Вкажіть призначення' })}
                        className="w-full border border-gray-300 rounded-lg p-2 h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                        placeholder="Список ліків, режим, направлення..."
                      />
                      {errors.assignment && <span className="text-red-500 text-xs">{errors.assignment.message}</span>}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsFormVisible(false)}
                        className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition"
                      >
                        Скасувати
                      </button>
                      <button
                        type="submit"
                        disabled={createResultMutation.isPending}
                        className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                      >
                        {createResultMutation.isPending ? 'Збереження...' : 'Зберегти та завершити'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};