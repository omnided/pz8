import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from "../../lib/axios"; 
import { Medicine, CreateMedicineRequest, UpdateMedicineRequest } from "./types";

// ⚠️ Укажи здесь префикс роутера
const BASE_URL = '/medicine'; 

// --- API ФУНКЦИИ ---

// 1. Получить список всех медикаментов
const getAllMedicines = async (): Promise<Medicine[]> => {
  const response = await apiClient.get(`${BASE_URL}/`);
  return response.data.data;
};

// 2. Получить один медикамент по ID
const getMedicineById = async (id: number): Promise<Medicine> => {
  const response = await apiClient.get(`${BASE_URL}/${id}`);
  return response.data.data;
};

// 3. Поиск медикаментов (по названию или другим параметрам)
const searchMedicines = async (query: string): Promise<Medicine[]> => {
  if (!query) return [];
  // Предполагаем, что бэкенд принимает ?query=...
  const response = await apiClient.get(`${BASE_URL}/search`, {
    params: { query } 
  });
  return response.data.data;
};

// 4. Создать медикамент
const createMedicine = async (data: CreateMedicineRequest): Promise<Medicine> => {
  const response = await apiClient.post(`${BASE_URL}/`, data);
  return response.data.data;
};

// 5. Обновить медикамент
const updateMedicine = async ({ id, data }: { id: number; data: UpdateMedicineRequest }): Promise<Medicine> => {
  const response = await apiClient.patch(`${BASE_URL}/${id}`, data);
  return response.data.data;
};

// 6. Удалить медикамент
const deleteMedicine = async (id: number): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/${id}`);
};


// --- REACT QUERY ХУКИ ---

// Хук для списка всех лекарств (Склад)
export const useAllMedicines = () => {
  return useQuery<Medicine[]>({ 
    queryKey: ['medicines', 'all'], 
    queryFn: getAllMedicines 
  });
};

// Хук для поиска (динамический)
export const useSearchMedicines = (searchTerm: string) => {
  return useQuery<Medicine[]>({ 
    queryKey: ['medicines', 'search', searchTerm], 
    queryFn: () => searchMedicines(searchTerm),
    enabled: !!searchTerm && searchTerm.length > 2, // Искать только если введено > 2 символов
    staleTime: 60 * 1000, // Кешировать результаты на минуту
  });
};

// Хук для одного лекарства
export const useMedicine = (id: number) => {
  return useQuery<Medicine>({ 
    queryKey: ['medicines', id], 
    queryFn: () => getMedicineById(id),
    enabled: !!id,
  });
};

// Создание
export const useCreateMedicine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMedicine,
    onSuccess: () => {
      // Обновляем список лекарств
      queryClient.invalidateQueries({ queryKey: ['medicines', 'all'] });
    },
    onError: (error) => {
      console.error("Failed to create medicine:", error);
    }
  });
};

// Обновление
export const useUpdateMedicine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMedicine,
    onSuccess: (updatedData) => {
      // Обновляем кеш конкретного лекарства
      queryClient.setQueryData(['medicines', updatedData.id], updatedData);
      // Обновляем общий список
      queryClient.invalidateQueries({ queryKey: ['medicines', 'all'] });
    },
  });
};

// Удаление
export const useDeleteMedicine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMedicine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
    },
    onError: (error) => {
      console.error("Failed to delete medicine:", error);
    }
  });
};