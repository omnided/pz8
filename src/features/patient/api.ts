import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from "../../lib/axios"; 
import { Patient, PatientListItem, CreatePatientRequest, UpdatePatientRequest } from "./types";

// ⚠️ Укажи здесь префикс роутера
const BASE_URL = '/patient'; 

// --- API ФУНКЦИИ ---

// 1. Получить список всех пациентов
const getAllPatients = async (): Promise<PatientListItem[]> => {
  const response = await apiClient.get(`${BASE_URL}/`);
  return response.data.data;
};

// 2. Получить одного пациента по ID (с медкартой)
const getPatientById = async (id: number): Promise<Patient> => {
  const response = await apiClient.get(`${BASE_URL}/${id}`);
  return response.data.data;
};

// 3. Создать пациента
const createPatient = async (data: CreatePatientRequest): Promise<Patient> => {
  const response = await apiClient.post(`${BASE_URL}/`, data);
  return response.data.data;
};

// 4. Обновить пациента
const updatePatient = async ({ id, data }: { id: number; data: UpdatePatientRequest }): Promise<Patient> => {
  const response = await apiClient.patch(`${BASE_URL}/${id}`, data);
  return response.data.data;
};

// 5. Удалить пациента
const deletePatient = async (id: number): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/${id}`);
};


// --- REACT QUERY ХУКИ ---

// Хук для списка пациентов (Регистратура)
export const useAllPatients = () => {
  return useQuery<PatientListItem[]>({ 
    queryKey: ['patients', 'all'], 
    queryFn: getAllPatients 
  });
};

// Хук для одного пациента (Карточка пациента)
export const usePatient = (id: number) => {
  return useQuery<Patient>({ 
    queryKey: ['patients', id], 
    queryFn: () => getPatientById(id),
    enabled: !!id,
  });
};

// Создание
export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      // Обновляем список пациентов
      queryClient.invalidateQueries({ queryKey: ['patients', 'all'] });
    },
    onError: (error) => {
      console.error("Failed to create patient:", error);
    }
  });
};

// Обновление
export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePatient,
    onSuccess: (updatedData) => {
      // Обновляем кеш конкретного пациента
      queryClient.setQueryData(['patients', updatedData.id], updatedData);
      // Обновляем общий список
      queryClient.invalidateQueries({ queryKey: ['patients', 'all'] });
    },
  });
};

// Удаление
export const useDeletePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: (error) => {
      console.error("Failed to delete patient:", error);
    }
  });
};