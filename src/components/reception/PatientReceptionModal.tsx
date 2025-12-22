import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import apiClient from '../../lib/axios';
import { ArrangedReception } from '../../features/arranged_reception/types';
// Никаких лишних хуков для загрузки результата!

interface PatientModalProps {
  reception: ArrangedReception | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PatientReceptionModal: React.FC<PatientModalProps> = ({ reception, isOpen, onClose }) => {
  const queryClient = useQueryClient();

  // Мутация отмены (остается без изменений)
  const cancelMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.patch(`/arranged-reception/${id}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receptions'] });
      onClose();
    },
  });

  if (!isOpen || !reception) return null;

  const isCompleted = reception.status === 'завершено';
  const isCanceled = reception.status === 'скасовано';
  const canCancel = !isCompleted && !isCanceled;

  // Данные результата теперь берем прямо из объекта
  const result = reception.result; 

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        
        {/* Шапка */}
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-2xl font-bold">Запис №{reception.id}</h2>
            <p className="opacity-90">{format(new Date(reception.appointment_date), 'dd.MM.yyyy')}</p>
          </div>
          <button onClick={onClose} className="text-white text-2xl font-bold">&times;</button>
        </div>

        {/* Скроллящийся контент */}
        <div className="p-6 overflow-y-auto">
          
          {/* ... Статус, Врач, Причина (код тот же) ... */}
          <div className="mb-6">
             {/* ... */}
             <div className="text-gray-700 italic bg-gray-50 p-3 rounded border border-gray-100">
               "{reception.reason}"
             </div>
          </div>

          {/* === БЛОК РЕЗУЛЬТАТОВ (МГНОВЕННЫЙ ПОКАЗ) === */}
          {/* Показываем, если статус завершен И данные реально пришли */}
          {isCompleted && result ? (
            <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                📂 Медичний висновок
              </h3>

              <div className="space-y-4 bg-green-50/50 p-4 rounded-xl border border-green-100">
                {/* Диагноз */}
                <div>
                  <span className="text-xs font-bold text-green-700 uppercase bg-green-100 px-2 py-0.5 rounded">
                    Діагноз
                  </span>
                  <p className="mt-2 text-lg font-medium text-gray-800">
                    {result.diagnosis}
                  </p>
                </div>

                {/* Назначение */}
                {result.assignment && (
                  <div className="pt-3 border-t border-green-100/50">
                    <span className="text-xs font-bold text-green-700 uppercase bg-green-100 px-2 py-0.5 rounded">
                       Призначення
                    </span>
                    <p className="mt-2 text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {result.assignment}
                    </p>
                  </div>
                )}
                
                <div className="pt-2 text-right">
                    <button className="text-xs text-green-700 hover:underline font-bold" onClick={() => window.print()}>
                      🖨️ Друкувати висновок
                    </button>
                </div>
              </div>
            </div>
          ) : isCompleted && !result ? (
            // На случай, если статус "завершено", но врач забыл заполнить поля (баг)
            <div className="text-yellow-600 bg-yellow-50 p-4 rounded-lg mt-4">
              Прийом завершено, але деталі висновку відсутні.
            </div>
          ) : null}

          {/* Кнопки действий */}
          <div className="flex flex-col gap-3 mt-8">
             {canCancel && (
                <button 
                  onClick={() => cancelMutation.mutate(reception.id)}
                  className="w-full py-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold"
                >
                  Скасувати запис
                </button>
             )}
             <button onClick={onClose} className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200">
               Закрити
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};