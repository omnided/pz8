import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { format } from 'date-fns';
import { useAuthStore } from '../../features/authStore';

// Хуки API
import { 
  useMyReceptions, 
  usePendingReceptions, 
  useAllReceptions,
  useFinishedReceptions, // <--- Новый хук
  useAcceptReception,
  useDeleteArrangedReception
} from '../../features/arranged_reception/api';

import { ArrangedReception } from '../../features/arranged_reception/types';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { PatientReceptionModal } from '../../components/reception/PatientReceptionModal';
// Импорт новой модалки для врача
import { DoctorReceptionActionModal } from '../../components/reception/DoctorReceptionActionModal';

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'очікування підтвердження': 'bg-yellow-100 text-yellow-800',
    'підтверджено': 'bg-blue-100 text-blue-800',
    'завершено': 'bg-green-100 text-green-800',
    'скасовано': 'bg-red-50 text-red-600',
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
};

// Тип фильтра расширен
type FilterType = 'pending' | 'my' | 'all' | 'finished';

export const ReceptionsDashboardPage = () => {
  const user = useAuthStore((state) => state.user);

  const isDoctor = user?.role === 'pediator';
  const isAdmin = user?.role === 'admin';
  const isStaff = isDoctor || isAdmin; 

  const [filter, setFilter] = useState<FilterType>('my');
  const [selectedReception, setSelectedReception] = useState<ArrangedReception | null>(null);

  // Мутации
  const acceptMutation = useAcceptReception();
  const deleteMutation = useDeleteArrangedReception();

  // --- ЗАГРУЗКА ДАННЫХ ---
  const pendingQuery = usePendingReceptions();
  const myQuery = useMyReceptions();
  const allQuery = useAllReceptions();
  const finishedQuery = useFinishedReceptions(); // <--- Новый query

  let data: ArrangedReception[] | undefined = [];
  let isLoading = false;

  // Логика выбора данных
  if (isStaff) {
    if (filter === 'pending') {
      data = pendingQuery.data;
      isLoading = pendingQuery.isLoading;
    } else if (filter === 'finished') { // <--- Логика для завершенных
      data = finishedQuery.data;
      isLoading = finishedQuery.isLoading;
    } else if (filter === 'all' && isAdmin) {
      data = allQuery.data;
      isLoading = allQuery.isLoading;
    } else { // 'my'
      data = myQuery.data;
      isLoading = myQuery.isLoading;
    }
  } else {
    // Пациент
    data = myQuery.data;
    isLoading = myQuery.isLoading;
  }

  // --- ОБРАБОТЧИКИ ---

  // Для Врача: Открываем модалку действий (создать результат)
  const handleDoctorAction = (reception: ArrangedReception) => {
    setSelectedReception(reception);
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm('Ви впевнені? Це безповоротно видалить запис.')) deleteMutation.mutate(id);
  };

  const handleAcceptPatient = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm('Прийняти заявку?')) acceptMutation.mutate(id);
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* --- ШАПКА --- */}
      <div className="flex flex-col xl:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
             {isStaff ? 'Панель керування' : 'Мої записи'}
             {isAdmin && <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded border border-red-200">Admin</span>}
           </h1>
           <p className="text-gray-500 text-sm">
             {isStaff ? 'Керування чергою пацієнтів' : 'Історія та заплановані візити'}
           </p>
        </div>

        {isStaff ? (
          <div className="flex bg-gray-100 p-1 rounded-xl flex-wrap justify-center">
            <FilterButton active={filter === 'pending'} onClick={() => setFilter('pending')} label="Черга" count={pendingQuery.data?.length} />
            <FilterButton active={filter === 'my'} onClick={() => setFilter('my')} label={isAdmin ? 'Всі (Мої)' : 'Мої пацієнти'} count={myQuery.data?.length} />
            <FilterButton active={filter === 'finished'} onClick={() => setFilter('finished')} label="Завершені" count={finishedQuery.data?.length} />
            {isAdmin && <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="Всі записи" />}
          </div>
        ) : (
          <Link to="/profile/arranged-reception/create" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition flex items-center gap-2">
            <span>+</span> Записатися
          </Link>
        )}
      </div>

      {/* --- ТАБЛИЦА / СПИСОК --- */}
      {!data?.length ? (
        <EmptyState title="Список порожній" text="Даних немає." icon="📂" />
      ) : (
        <>
          {isStaff ? (
            /* ТАБЛИЦА (Врач + Админ) */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="p-4">Час</th>
                    <th className="p-4">Пацієнт</th>
                    <th className="p-4">Причина</th>
                    <th className="p-4">Статус</th>
                    <th className="p-4 text-right">Дія</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/50 transition">
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{item.appointment_time.slice(0, 5)}</div>
                        <div className="text-xs text-gray-400">{format(new Date(item.appointment_date), 'dd.MM')}</div>
                      </td>
                      <td className="p-4 font-medium">
                        {item.patient?.patient_fullname}
                        <div className="text-xs text-gray-400">ID: {item.patient?.id}</div>
                      </td>
                      <td className="p-4 text-gray-600 truncate max-w-[150px]" title={item.reason}>{item.reason}</td>
                      <td className="p-4"><StatusBadge status={item.status} /></td>
                      <td className="p-4 text-right flex items-center justify-end gap-2">
                        
                        {/* Кнопки статусов */}
                        {item.status === 'очікування підтвердження' && (
                          <button onClick={(e) => handleAcceptPatient(e, item.id)} className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-200">
                            Прийняти
                          </button>
                        )}
                        
                        {/* Если Подтверждено -> Врач проводит Осмотр (открывает модалку) */}
                        {item.status === 'підтверджено' && (
                          <button onClick={() => handleDoctorAction(item)} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-200 flex items-center gap-1">
                            🩺 Огляд
                          </button>
                        )}
                        
                        {/* Если Завершено -> Можно посмотреть результат (та же модалка) */}
                        {item.status === 'завершено' && (
                          <button onClick={() => handleDoctorAction(item)} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 flex items-center gap-1">
                            📄 Результат
                          </button>
                        )}

                        {isAdmin && (
                          <>
                            <div className="w-[1px] h-6 bg-gray-300 mx-1"></div>
                            <button onClick={(e) => handleDelete(e, item.id)} className="text-gray-400 hover:text-red-600 p-1">🗑️</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* СЕТКА (Пациент) - Без изменений */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.map((item) => (
                <div key={item.id} onClick={() => setSelectedReception(item)} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer relative overflow-hidden">
                   {/* ... код карточки пациента ... */}
                   <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.status === 'завершено' ? 'bg-green-400' : 'bg-blue-400'}`}></div>
                   <div className="flex justify-between mb-4 pl-3">
                    <StatusBadge status={item.status} />
                    <span className="text-xs text-gray-400">#{item.id}</span>
                  </div>
                  <div className="pl-3 mb-2">
                    <p className="text-lg font-bold text-gray-800">{format(new Date(item.appointment_date), 'dd.MM.yyyy')}</p>
                    <p className="text-blue-600 font-medium">{item.appointment_time.slice(0, 5)}</p>
                  </div>
                  <div className="pl-3 pt-3 border-t border-gray-50 text-sm text-gray-600">
                    <p>Лікар: <span className="font-medium text-gray-800">{item.pediator?.doctor_fullname || '...'}</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* МОДАЛКИ */}
      
      {/* 1. Если это Врач/Админ -> Открываем DoctorActionModal */}
      {isStaff && (
        <DoctorReceptionActionModal 
          reception={selectedReception} 
          isOpen={!!selectedReception} 
          onClose={() => setSelectedReception(null)} 
        />
      )}

      {/* 2. Если это Пациент -> Открываем PatientModal */}
      {!isStaff && (
        <PatientReceptionModal 
          reception={selectedReception} 
          isOpen={!!selectedReception} 
          onClose={() => setSelectedReception(null)} 
        />
      )}
    </div>
  );
};

// Хелпер для кнопок фильтров
const FilterButton = ({ active, onClick, label, count }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition m-1 ${active ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:bg-gray-200'}`}
  >
    {label}
    {count !== undefined && <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-blue-100' : 'bg-gray-300'}`}>{count}</span>}
  </button>
);