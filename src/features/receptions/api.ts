import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from "../../lib/axios"; 
import { Reception, CreateReceptionRequest, UpdateReceptionRequest } from "./types";

// ⚠️ Укажи здесь префикс роутера
const BASE_URL = '/reception'; 

// --- API ФУНКЦИИ ---

// 1. Получить ВСЕ результаты (Админ)
const getAllReceptions = async (): Promise<Reception[]> => {
  const response = await apiClient.get(`${BASE_URL}/`);
  return response.data.data;
};

// 2. Получить "МОИ" результаты (Врач видит кого лечил, Пациент видит историю болезней)
const getMyReceptions = async (): Promise<Reception[]> => {
  const response = await apiClient.get(`${BASE_URL}/my`);
  return response.data.data;
};

// 3. Получить один результат по ID
const getReceptionById = async (id: number): Promise<Reception> => {
  const response = await apiClient.get(`${BASE_URL}/${id}`);
  return response.data.data;
};

// 4. Создать результат (Врач после приема)
const createReception = async (data: CreateReceptionRequest): Promise<Reception> => {
  const response = await apiClient.post(`${BASE_URL}/`, data);
  return response.data.data;
};

// 5. Обновить результат (диагноз/назначение)
const updateReception = async ({ id, data }: { id: number; data: UpdateReceptionRequest }): Promise<Reception> => {
  const response = await apiClient.patch(`${BASE_URL}/${id}`, data);
  return response.data.data;
};

// 6. Удалить результат
const deleteReception = async (id: number): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/${id}`);
};


// --- REACT QUERY ХУКИ ---

// Хук для списка всех (Архив)
export const useAllReceptions = () => {
  return useQuery<Reception[]>({ 
    queryKey: ['receptions', 'all'], 
    queryFn: getAllReceptions 
  });
};

// Хук для моих (Личная медкарта / Журнал врача)
export const useMyReceptions = () => {
  return useQuery<Reception[]>({ 
    queryKey: ['receptions', 'my'], 
    queryFn: getMyReceptions 
  });
};

// Хук для одного приема
export const useReception = (id: number) => {
  return useQuery<Reception>({ 
    queryKey: ['receptions', id], 
    queryFn: () => getReceptionById(id),
    enabled: !!id,
  });
};

// Создание
export const useCreateReception = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReception,
    onSuccess: () => {
      // Обновляем "Мои", так как врач только что добавил запись
      queryClient.invalidateQueries({ queryKey: ['receptions', 'my'] });
      // Обновляем общий список
      queryClient.invalidateQueries({ queryKey: ['receptions', 'all'] });
      
      // Также важно обновить статус записи на прием (ArrangedReception), 
      // так как обычно после создания результата прием считается завершенным.
      // Если у тебя есть список записей на прием, инвалидируй его тоже:
      queryClient.invalidateQueries({ queryKey: ['arranged-receptions'] });
    },
    onError: (error) => {
      console.error("Failed to create reception result:", error);
    }
  });
};

// Обновление
export const useUpdateReception = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateReception,
    onSuccess: (updatedData) => {
      // Обновляем кеш конкретной записи
      queryClient.setQueryData(['receptions', updatedData.id], updatedData);
      // Обновляем списки
      queryClient.invalidateQueries({ queryKey: ['receptions', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['receptions', 'my'] });
    },
  });
};

// Удаление
export const useDeleteReception = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReception,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receptions'] });
    },
    onError: (error) => {
      console.error("Failed to delete reception:", error);
    }
  });
};