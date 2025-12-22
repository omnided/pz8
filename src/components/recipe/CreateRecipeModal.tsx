import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useCreateRecipe, useMedicinesList } from '../../features/recipe/api';

interface Props {
  receptionId: number;
  isOpen: boolean;
  onClose: () => void;
}

type FormValues = {
  frequency: string;
  duration: number;
  // В форме храним как массив объектов для удобства работы с inputs
  medicinesItems: { name: string }[];
};

export const CreateRecipeModal: React.FC<Props> = ({ receptionId, isOpen, onClose }) => {
  const { mutate: createRecipe, isPending } = useCreateRecipe();
  const { data: medicinesList, isLoading: isLoadingMeds } = useMedicinesList();

  const { register, control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      frequency: '2 рази на день',
      duration: 5,
      medicinesItems: [{ name: '' }] // По умолчанию одна пустая строка
    }
  });

  // Хук для динамического списка полей
  const { fields, append, remove } = useFieldArray({
    control,
    name: "medicinesItems"
  });

  const onSubmit = (data: FormValues) => {
    // Превращаем массив объектов [{name: "Аналгин"}] в массив строк ["Аналгин"] для бэкенда
    const medicinesArray = data.medicinesItems
      .map(item => item.name)
      .filter(name => name.trim() !== ''); // Убираем пустые

    if (medicinesArray.length === 0) {
      alert("Будь ласка, оберіть хоча б один препарат.");
      return;
    }

    createRecipe({
      receptionId: receptionId,
      frequency: data.frequency,
      duration: Number(data.duration),
      medicines: medicinesArray
    }, {
      onSuccess: () => {
        alert("Рецепт успішно створено!");
        onClose();
      },
      onError: (err: any) => {
        alert(`Помилка: ${err.response?.data?.message || err.message}`);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden p-6 animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Виписати рецепт</h2>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Частота и Длительность */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Частота прийому</label>
              <input 
                {...register('frequency', { required: true })}
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="напр. 3 рази на день"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Тривалість (днів)</label>
              <input 
                type="number"
                min="1"
                {...register('duration', { required: true, min: 1 })}
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Список лекарств */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <label className="block text-sm font-bold text-gray-700 mb-2">Препарати (зі складу)</label>
            
            {isLoadingMeds ? (
              <div className="text-sm text-gray-500">Завантаження списку ліків...</div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <select
                      {...register(`medicinesItems.${index}.name` as const, { required: true })}
                      className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="">-- Оберіть препарат --</option>
                      {medicinesList?.map(med => (
                        <option key={med.id} value={med.medicine_name}>
                          {med.medicine_name} (залишок: {med.quantity_stock})
                        </option>
                      ))}
                    </select>
                    
                    {fields.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => remove(index)}
                        className="text-red-500 hover:bg-red-100 p-2 rounded-lg transition"
                        title="Видалити"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <button
              type="button"
              onClick={() => append({ name: '' })}
              className="mt-3 text-sm text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              <span>+</span> Додати ще препарат
            </button>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
             <button 
               type="button" 
               onClick={onClose} 
               className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50"
             >
               Скасувати
             </button>
             <button 
               type="submit" 
               disabled={isPending}
               className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-200"
             >
               {isPending ? 'Створення...' : 'Виписати рецепт'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};