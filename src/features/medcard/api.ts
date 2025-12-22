import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from "../../lib/axios"; 
import { Medcard, MedcardListItem, CreateMedcardRequest, UpdateMedcardRequest } from "./types";

// 1. Получить ВСЕ (Админ/Врач)
const getAllMedcards = async (): Promise<MedcardListItem[]> => {
  const response = await apiClient.get(`/medcard/`);
  return response.data.data;
};

// 2. Получить "МОЮ" (Пациент)
const getMyMedcard = async (): Promise<Medcard> => {
  const response = await apiClient.get(`/medcard/my`);
  return response.data.data;
};

// 3. Получить одну карту по ID
const getMedcardById = async (id: number): Promise<Medcard> => {
  const response = await apiClient.get(`/medcard/${id}`);
  return response.data.data;
};

// 4. Создать медкарту
const createMedcard = async (data: CreateMedcardRequest): Promise<Medcard> => {
  const response = await apiClient.post(`/medcard/`, data);
  return response.data.data;
};

// 5. Обновить медкарту
const updateMedcard = async ({ id, data }: { id: number; data: UpdateMedcardRequest }): Promise<Medcard> => {
  const response = await apiClient.patch(`/medcard/${id}`, data);
  return response.data.data;
};

// 6. Удалить медкарту
const deleteMedcard = async (id: number): Promise<void> => {
  await apiClient.delete(`/medcard/${id}`);
};


// --- REACT QUERY ХУКИ ---

// Хук для списка всех карт
export const useAllMedcards = () => {
  return useQuery<MedcardListItem[]>({ 
    queryKey: ['medcards', 'all'], 
    queryFn: getAllMedcards 
  });
};

// Хук для моей карты (личный кабинет)
export const useMyMedcard = () => {
  return useQuery<Medcard>({ 
    queryKey: ['medcards', 'my'], 
    queryFn: getMyMedcard,
    // Можно добавить retry: false, чтобы если карты нет (404), не долбил запросами
    retry: false 
  });
};

// Хук для одной карты (просмотр врачом)
export const useMedcard = (id: number) => {
  return useQuery<Medcard>({ 
    queryKey: ['medcards', id], 
    queryFn: () => getMedcardById(id),
    enabled: !!id,
  });
};

// Создание
export const useCreateMedcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMedcard,
    onSuccess: () => {
      // Обновляем список всех карт
      queryClient.invalidateQueries({ queryKey: ['medcards', 'all'] });
    },
    onError: (error) => {
      console.error("Failed to create medcard:", error);
    }
  });
};

// Обновление
export const useUpdateMedcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMedcard,
    onSuccess: (updatedData) => {
      // Обновляем кеш конкретной карты
      queryClient.setQueryData(['medcards', updatedData.id], updatedData);
      queryClient.invalidateQueries({ queryKey: ['medcards', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['medcards', 'my'] });
    },
  });
};

export const useDeleteMedcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMedcard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medcards'] });
    },
    onError: (error) => {
      console.error("Failed to delete medcard:", error);
    }
  });
};