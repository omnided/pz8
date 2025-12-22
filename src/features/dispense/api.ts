import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import apiClient from "../../lib/axios"; 
import { 
  DispenseListItem, 
  DispenseDetail, 
  CreateDispenseRequest, 
  UpdateDispenseRequest 
} from "./types";

// ⚠️ Укажи здесь префикс, который ты настроил в express app.use(...)
const BASE_URL = '/dispense'; 

// --- API ФУНКЦИИ ---

// 1. Получить ВСЮ историю (для Админа/Главного)
const getAllDispenses = async (): Promise<DispenseListItem[]> => {
  const response = await apiClient.get(`${BASE_URL}/`);
  return response.data.data;
};

// 2. Получить МОЮ историю (для Фармацевта)
const getMyDispenses = async (): Promise<DispenseListItem[]> => {
  const response = await apiClient.get(`${BASE_URL}/my`);
  return response.data.data;
};

// 3. Получить детали одной выдачи
const getDispenseById = async (id: number): Promise<DispenseDetail> => {
  const response = await apiClient.get(`${BASE_URL}/${id}`);
  return response.data.data;
};

// 4. Выдать рецепт (Создать запись)
const createDispense = async (data: CreateDispenseRequest): Promise<DispenseDetail> => {
  const response = await apiClient.post(`${BASE_URL}/`, data);
  return response.data.data;
};

// 5. Обновить запись
const updateDispense = async ({ id, data }: { id: number; data: UpdateDispenseRequest }): Promise<DispenseDetail> => {
  const response = await apiClient.patch(`${BASE_URL}/${id}`, data);
  return response.data.data;
};

// 6. Удалить (Отменить выдачу)
const deleteDispense = async (id: number): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/${id}`);
};


// --- REACT QUERY ХУКИ ---

// Хук для общей истории
export const useAllDispenses = () => {
  return useQuery<DispenseListItem[]>({ 
    queryKey: ['dispenses', 'all'], 
    queryFn: getAllDispenses 
  });
};

// Хук для личной истории фармацевта
export const useMyDispenses = () => {
  return useQuery<DispenseListItem[]>({ 
    queryKey: ['dispenses', 'my'], 
    queryFn: getMyDispenses 
  });
};

// Хук для одной записи
export const useDispense = (id: number) => {
  return useQuery<DispenseDetail>({ 
    queryKey: ['dispenses', id], 
    queryFn: () => getDispenseById(id),
    enabled: !!id,
  });
};

// Хук создания выдачи
export const useCreateDispense = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createDispense,
    onSuccess: () => {
      // Обновляем "Мои" записи, так как фармацевт только что что-то выдал
      queryClient.invalidateQueries({ queryKey: ['dispenses', 'my'] });
      // Обновляем общие
      queryClient.invalidateQueries({ queryKey: ['dispenses', 'all'] });
      
      // Можно перенаправить на список или показать уведомление
      // navigate({ to: '/dispense/history' });
    },
    onError: (error) => {
        console.error("Failed to dispense:", error);
    }
  });
};

// Хук обновления
export const useUpdateDispense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDispense,
    onSuccess: (updatedData) => {
      // Обновляем списки
      queryClient.invalidateQueries({ queryKey: ['dispenses'] });
      
      // Обновляем кеш конкретной записи
      queryClient.setQueryData(['dispenses', updatedData.id], updatedData);
    },
  });
};

// Хук удаления
export const useDeleteDispense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDispense,
    onSuccess: () => {
      // Инвалидируем все списки выдач
      queryClient.invalidateQueries({ queryKey: ['dispenses'] });
      
      // Также, возможно, стоит обновить список рецептов (если он есть в кеше), 
      // так как статус рецепта поменялся на "активный"
      queryClient.invalidateQueries({ queryKey: ['recipes'] }); 
    },
  });
};