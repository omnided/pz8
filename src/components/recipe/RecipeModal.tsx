import React from 'react';
// import { useNavigate } from '@tanstack/react-router'; // Больше не нужно
import { Recipe } from '../../features/recipe/types';
import { useAuthStore } from '../../features/authStore';
import { useCreateDispense } from '../../features/dispense/api'; // Импортируй свой хук отсюда

interface Props {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RecipeModal: React.FC<Props> = ({ recipe, isOpen, onClose }) => {
  // const navigate = useNavigate(); // Убираем навигацию
  const user = useAuthStore((state) => state.user);
  
  // 1. Подключаем мутацию
  const { mutate: dispense, isPending } = useCreateDispense();
  
  if (!isOpen || !recipe) return null;

  const isPharmacist = user?.role === 'pharmacist';
  const canDispense = isPharmacist && recipe.status === 'очікує видачі';

  // 2. Новый обработчик клика
  const handleDispenseClick = () => {
    // Проверка на наличие пользователя/логина
    if (!user?.login) { 
      alert("Помилка: Не вдалося визначити логін фармацевта.");
      return;
    }

    if (confirm(`Видати ліки за рецептом #${recipe.id}?`)) {
      dispense({
        recipeId: recipe.id,
        pharmacistLogin: user.login // Передаем логин из стора
      }, {
        onSuccess: () => {
          alert('Ліки успішно видано!');
          onClose(); // Закрываем модалку при успехе
        },
        onError: (err: any) => {
          alert(`Помилка: ${err.message || 'Не вдалося видати ліки'}`);
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        
        {/* Шапка */}
        <div className={`p-6 text-white flex justify-between ${recipe.status === 'виданий' ? 'bg-green-600' : 'bg-blue-600'}`}>
          <div>
            <h2 className="text-xl font-bold">Рецепт #{recipe.id}</h2>
            <p className="opacity-90">{new Date(recipe.created_at).toLocaleDateString()}</p>
          </div>
          <button onClick={onClose} className="text-2xl font-bold hover:text-gray-200">&times;</button>
        </div>

        {/* Контент */}
        <div className="p-6 space-y-6">
          
          {/* Статус */}
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-500 uppercase text-xs">Статус</span>
            <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${
              recipe.status === 'виданий' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {recipe.status}
            </span>
          </div>

          

          {/* Лекарства */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
             <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                💊 Призначені препарати
             </h3>
             <ul className="space-y-2">
               {recipe.medicines?.map((med, idx) => (
                 <li key={idx} className="flex items-center gap-2 text-gray-700">
                   <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                   {med.medicine_name}
                 </li>
               )) || <li className="text-gray-400">Список порожній</li>}
             </ul>
          </div>

          {/* Детали */}
          <div className="grid grid-cols-2 gap-4 text-sm">
             <div>
               <p className="text-gray-400 font-bold uppercase text-xs">Пацієнт</p>
               <p className="font-medium text-gray-800">{recipe.patient_name}</p>
             </div>
             <div>
               <p className="text-gray-400 font-bold uppercase text-xs">Лікар</p>
               <p className="font-medium text-gray-800">{recipe.doctor_name}</p>
             </div>
             <div>
               <p className="text-gray-400 font-bold uppercase text-xs">Діагноз</p>
               <p className="font-medium text-gray-800">{recipe.diagnosis}</p>
             </div>
             <div>
               <p className="text-gray-400 font-bold uppercase text-xs">Курс</p>
               <p className="font-medium text-gray-800">{recipe.duration} днів ({recipe.frequency})</p>
             </div>
          </div>

          {/* Кнопка действия (только для Фармацевта) */}
          {canDispense && (
            <div className="pt-6 border-t border-gray-100">
              <button 
                onClick={handleDispenseClick}
                disabled={isPending} // Блокируем кнопку при отправке
                className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-100 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>⏳ Обробка...</>
                ) : (
                  <>✅ Видати ліки</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};