import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from "../../lib/axios"; 
import { LabReferral, CreateReferralRequest } from "./types";

// 1. Получить ВСЕ (Админ/Главврач)
const getAllReferrals = async (): Promise<LabReferral[]> => {
  const response = await apiClient.get(`/lab-referral/`);
  return response.data.data;
};

// 2. Получить "МОИ" (Врач видит выписанные им, Пациент видит свои)
const getMyReferrals = async (): Promise<LabReferral[]> => {
  const response = await apiClient.get(`/lab-referral/my`);
  return response.data.data;
};

// 3. Получить одно направление по ID
const getReferralById = async (id: number): Promise<LabReferral> => {
  const response = await apiClient.get(`/lab-referral/${id}`);
  return response.data.data;
};

// 4. Создать направление
const createReferral = async (data: CreateReferralRequest): Promise<LabReferral> => {
  const response = await apiClient.post(`/lab-referral/`, data);
  return response.data.data;
};

// 5. Удалить направление
const deleteReferral = async (id: number): Promise<void> => {
  await apiClient.delete(`/lab-referral/${id}`);
};


// --- REACT QUERY ХУКИ ---

// Хук для всех (Админ панель)
export const useAllReferrals = () => {
  return useQuery<LabReferral[]>({ 
    queryKey: ['referrals', 'all'], 
    queryFn: getAllReferrals 
  });
};

// Хук для моих (Личный кабинет)
export const useMyReferrals = () => {
  return useQuery<LabReferral[]>({ 
    queryKey: ['referrals', 'my'], 
    queryFn: getMyReferrals 
  });
};

// Хук для одной записи
export const useReferral = (id: number) => {
  return useQuery<LabReferral>({ 
    queryKey: ['referrals', id], 
    queryFn: () => getReferralById(id),
    enabled: !!id,
  });
};

// Создание
export const useCreateReferral = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReferral,
    onSuccess: () => {
      // Обновляем "Мои", так как врач только что создал новое направление
      queryClient.invalidateQueries({ queryKey: ['referrals', 'my'] });
      // Обновляем общий список
      queryClient.invalidateQueries({ queryKey: ['referrals', 'all'] });
    },
    onError: (error) => {
      console.error("Failed to create referral:", error);
    }
  });
};

// Удаление
export const useDeleteReferral = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReferral,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
    },
    onError: (error) => {
      console.error("Failed to delete referral:", error);
    }
  });
};