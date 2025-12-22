import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import apiClient from "../../lib/axios"; 
import { ArrangedReception, CreateReceptionRequest } from "./types";

// --- API ФУНКЦИИ ---

const BASE_URL = '/arranged-receptions'; // ⚠️ УКАЖИ ЗДЕСЬ СВОЙ ПРЕФИКС РОУТЕРА

// 1. Получить ВСЕ (Админ)
const getAllReceptions = async (): Promise<ArrangedReception[]> => {
  const response = await apiClient.get(`/arranged-reception/`);
  return response.data.data;
};

// 2. Получить "МОИ" (Пациент или Врач - универсальный роут)
const getMyReceptions = async (): Promise<ArrangedReception[]> => {
  const response = await apiClient.get(`/arranged-reception/my`);
  return response.data.data;
};

// 3. Получить ОЖИДАЮЩИЕ (Врач/Админ)
const getPendingReceptions = async (): Promise<ArrangedReception[]> => {
  const response = await apiClient.get(`/arranged-reception/pending`);
  return response.data.data;
};

const getFinishedReceptions = async (): Promise<ArrangedReception[]> => {
  const response = await apiClient.get(`/arranged-reception/fin`);
  return response.data.data;
};

// 4. Получить ОДНУ по ID
const getReceptionById = async (id: number): Promise<ArrangedReception> => {
  const response = await apiClient.get(`/arranged-reception/${id}`);
  return response.data.data;
};

// 5. Создать запись
const createReception = async (data: CreateReceptionRequest): Promise<ArrangedReception> => {
  const response = await apiClient.post(`${BASE_URL}/`, data);
  return response.data.data;
};

// 6. Принять запись (Врач)
const acceptReception = async (id: number): Promise<ArrangedReception> => {
  const response = await apiClient.patch(`${BASE_URL}/${id}/accept`);
  return response.data.data;
};

// 7. Отменить запись
const cancelReception = async (id: number): Promise<ArrangedReception> => {
  const response = await apiClient.patch(`${BASE_URL}/${id}/cancel`);
  return response.data.data;
};

const deleteReception = async (id: number): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/${id}`);
};


// --- REACT QUERY ХУКИ ---

// Хук для всех записей (Админ)
export const useAllReceptions = () => {
  return useQuery<ArrangedReception[]>({ 
    queryKey: ['receptions', 'all'], 
    queryFn: getAllReceptions 
  });
};

// Хук для моих записей (Личный кабинет)
export const useMyReceptions = () => {
  return useQuery<ArrangedReception[]>({ 
    queryKey: ['receptions', 'my'], 
    queryFn: getMyReceptions 
  });
};

// Хук для ожидающих (Рабочий стол врача)
export const usePendingReceptions = () => {
  return useQuery<ArrangedReception[]>({ 
    queryKey: ['receptions', 'pending'], 
    queryFn: getPendingReceptions 
  });
};

export const useFinishedReceptions = () => {
  return useQuery<ArrangedReception[]>({ 
    queryKey: ['receptions', 'finished'], 
    queryFn: getFinishedReceptions 
  });
};

// Хук для одной записи
export const useReception = (id: number) => {
  return useQuery<ArrangedReception>({ 
    queryKey: ['receptions', id], 
    queryFn: () => getReceptionById(id),
    enabled: !!id,
  });
};

// Создание записи
export const useCreateReception = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createReception,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receptions', 'my'] });
      
      queryClient.invalidateQueries({ queryKey: ['receptions', 'all'] });
      
      // Можно перенаправить на страницу "Мои записи"
      // navigate({ to: '/profile/receptions' }); 
    },
    onError: (err) => console.error("Create reception error", err)
  });
};

// Принятие записи (Врач)
export const useAcceptReception = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptReception,
    onSuccess: (data) => {
      // Обновляем список ожидающих (она оттуда пропадет)
      queryClient.invalidateQueries({ queryKey: ['receptions', 'pending'] });

      queryClient.invalidateQueries({ queryKey: ['receptions', 'all'] });
      
      // Обновляем список "Мои" (она там появится у врача)
      queryClient.invalidateQueries({ queryKey: ['receptions', 'my'] });
      
      // Обновляем детальную инфу, если мы сейчас внутри карточки
      queryClient.setQueryData(['receptions', data.id], data);
    },
  });
};

// Отмена записи
export const useCancelReception = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelReception,
    onSuccess: (data) => {
      // Инвалидируем все списки, чтобы статус обновился везде
      queryClient.invalidateQueries({ queryKey: ['receptions'] });
      
      // Обновляем конкретную карточку
      queryClient.setQueryData(['receptions', data.id], data);
    },
  });
};

export const useDeleteArrangedReception = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteReception,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receptions'] });
    },
  });
};