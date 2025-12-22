import { useState } from 'react';
import { useAuthStore } from '../../features/authStore';
import { 
  useAllRecipes, 
  usePendingRecipes, // Если нужна кнопка создания рецепта врачом, оставь, если нет - убери
} from '../../features/recipe/api';
import { Recipe } from '../../features/recipe/types';
import { DispenseListItem } from '../../features/dispense/types';
import { useAllDispenses } from '../../features/dispense/api'; // useCreateDispense УБРАЛИ
import { RecipeModal } from '../../components/recipe/RecipeModal';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';

type TabType = 'pending' | 'all' | 'dispensed';

export const RecipesDashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const isPharmacist = user?.role === 'pharmacist'; 
  
  const [activeTab, setActiveTab] = useState<TabType>(isPharmacist ? 'pending' : 'all');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // API Хуки
  const pendingQuery = usePendingRecipes();
  const allQuery = useAllRecipes();
  const historyQuery = useAllDispenses();
  // dispenseMutation УБРАЛИ - здесь мы ничего не выдаем

  let data: any[] = [];
  let isLoading = false;

  // Выбор данных
  if (activeTab === 'pending') {
    data = pendingQuery.data || [];
    isLoading = pendingQuery.isLoading;
  } else if (activeTab === 'all') {
    data = allQuery.data || [];
    isLoading = allQuery.isLoading;
  } else {
    data = historyQuery.data || [];
    isLoading = historyQuery.isLoading;
  }

  // handleDispense УБРАЛИ - теперь действие только через модалку

  const handleRowClick = (item: any) => {
    // Открываем модалку, если это не история выдачи
    if (activeTab !== 'dispensed') {
      setSelectedRecipe(item as Recipe);
    }
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Електронні рецепти</h1>
           <p className="text-gray-500 text-sm">База призначень та видачі ліків</p>
        </div>

        {/* ТАБЫ */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <TabButton 
            active={activeTab === 'pending'} 
            onClick={() => setActiveTab('pending')} 
            label="В черзі" 
            count={pendingQuery.data?.length}
          />
          <TabButton 
            active={activeTab === 'all'} 
            onClick={() => setActiveTab('all')} 
            label="Архів рецептів" 
          />
          <TabButton 
            active={activeTab === 'dispensed'} 
            onClick={() => setActiveTab('dispensed')} 
            label="Журнал видачі" 
            count={historyQuery.data?.length}
          />
        </div>
      </div>

      {!data.length ? (
        <EmptyState title="Список порожній" text="Записів у цій категорії немає." icon="💊" />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Дата {activeTab === 'dispensed' ? 'видачі' : 'створення'}</th>
                <th className="p-4">Пацієнт</th>
                <th className="p-4">{activeTab === 'dispensed' ? 'Фармацевт' : 'Лікар'}</th>
                <th className="p-4">Статус / Інфо</th>
                <th className="p-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => handleRowClick(item)}
                  className={`transition ${activeTab !== 'dispensed' ? 'hover:bg-blue-50/50 cursor-pointer' : ''}`}
                >
                  <td className="p-4 font-mono text-xs text-gray-400">#{item.id}</td>
                  
                  {/* Дата */}
                  <td className="p-4 font-medium text-gray-800">
                     {new Date(activeTab === 'dispensed' ? (item as DispenseListItem).dispense_date : (item as Recipe).created_at).toLocaleDateString()}
                  </td>
                  
                  {/* Пациент */}
                  <td className="p-4">{item.patient_name}</td>
                  
                  {/* Врач или Фармацевт */}
                  <td className="p-4 text-sm text-gray-600">
                    {activeTab === 'dispensed' ? (item as DispenseListItem).pharmacist_name : (item as Recipe).doctor_name}
                  </td>
                  
                  {/* Статус / Инфо */}
                  <td className="p-4">
                    {activeTab === 'dispensed' ? (
                       <span className="text-sm text-gray-600 truncate max-w-[150px] inline-block" title={(item as DispenseListItem).diagnosis}>
                         {(item as DispenseListItem).diagnosis}
                       </span>
                    ) : (
                       <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                         (item as Recipe).status === 'очікує видачі' ? 'bg-yellow-100 text-yellow-800' :
                         (item as Recipe).status === 'виданий' ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-800'
                       }`}>
                         {(item as Recipe).status}
                       </span>
                    )}
                  </td>

                  {/* КНОПКА ДЕЙСТВИЯ: Оставляем только стрелочку */}
                  <td className="p-4 text-right text-gray-400">
                    {activeTab !== 'dispensed' && <span>&rarr;</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Модалка */}
      <RecipeModal 
        recipe={selectedRecipe} 
        isOpen={!!selectedRecipe} 
        onClose={() => setSelectedRecipe(null)} 
      />
    </div>
  );
};

const TabButton = ({ active, onClick, label, count }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
      active ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
    }`}
  >
    {label}
    {count !== undefined && (
      <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-blue-100' : 'bg-gray-200'}`}>
        {count}
      </span>
    )}
  </button>
);