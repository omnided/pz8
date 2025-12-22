import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import apiClient from "../../lib/axios"; // Твой путь к axios
import { AnalysisListItem, AnalysisDetail, CreateAnalysisRequest } from "./types"; 

// --- API ФУНКЦИИ ---

// 1. Получить ВСЕ анализы (для лаборанта/админа)
const getAllAnalyses = async (): Promise<AnalysisListItem[]> => {
  const response = await apiClient.get('/analysis'); // Проверь базовый путь в роутере
  return response.data.data;
};

// 2. Получить "МОИ" анализы (для пациента)
const getMyAnalyses = async (): Promise<AnalysisDetail[]> => {
  const response = await apiClient.get('/analysis/my');
  return response.data.data;
};

// 3. Получить ОДИН анализ (детально)
const getAnalysisById = async (id: number): Promise<AnalysisDetail> => {
  const response = await apiClient.get(`/analysis/${id}`);
  return response.data.data;
};

// 4. Создать анализ
const createAnalysis = async (data: CreateAnalysisRequest): Promise<AnalysisDetail> => {
  const response = await apiClient.post('/analysis', data);
  return response.data.data;
};

// 5. Удалить анализ
const deleteAnalysis = async (id: number): Promise<void> => {
  await apiClient.delete(`/analysis/${id}`);
};


// --- REACT QUERY ХУКИ ---

// Хук для списка ВСЕХ анализов
export const useAllAnalyses = () => {
  return useQuery<AnalysisListItem[]>({ 
    queryKey: ['analyses', 'all'], 
    queryFn: getAllAnalyses 
  });
};

// Хук для списка "МОИХ" анализов
export const useMyAnalyses = () => {
  return useQuery<AnalysisDetail[]>({ 
    queryKey: ['analyses', 'my'], 
    queryFn: getMyAnalyses 
  });
};

// Хук для одного анализа
export const useAnalysis = (id: number) => {
  return useQuery<AnalysisDetail>({ 
    queryKey: ['analyses', id], 
    queryFn: () => getAnalysisById(id),
    enabled: !!id,
  });
};

// Хук создания
export const useCreateAnalysis = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createAnalysis,
    onSuccess: () => {
      // Обновляем списки
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
      // Можно перенаправить на список или детальную страницу
        navigate({ to: '/' });
    },
    onError: (error) => {
        console.error("Failed to create analysis:", error);
    }
  });
};

// Хук удаления
export const useDeleteAnalysis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAnalysis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
    },
    onError: (error) => {
        console.error("Failed to delete analysis:", error);
    }
  });
};