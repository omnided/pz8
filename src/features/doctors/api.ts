import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from "../../lib/axios"; // Подставь свой путь к axios
import { Doctor, CreateDoctorRequest, UpdateDoctorRequest } from "./types"; 

// --- API ФУНКЦИИ ---

// 1. Получить всех
const getDoctors = async (): Promise<Doctor[]> => {
  const response = await apiClient.get('/doctor'); // Проверь свой роут на бэкенде
  return response.data.data; // Обычно в axios ответ обернут в data, и твой кастомный респонс тоже имеет поле data
};

// 2. Получить одного
const getDoctorById = async (id: number): Promise<Doctor> => {
  const response = await apiClient.get(`/doctor/${id}`);
  return response.data.data;
};

// 3. Создать
const createDoctor = async (newDoctor: CreateDoctorRequest): Promise<Doctor> => {
  const response = await apiClient.post('/doctor', newDoctor);
  return response.data.data;
};

// 4. Обновить
const updateDoctor = async ({ id, data }: { id: number, data: UpdateDoctorRequest }): Promise<Doctor> => {
  // Используем PATCH или PUT в зависимости от роута, обычно для частичного обновления лучше PATCH
  const response = await apiClient.patch(`/doctor/${id}`, data);
  return response.data.data;
};

// 5. Удалить
const deleteDoctor = async (id: number): Promise<void> => {
  await apiClient.delete(`/doctor/${id}`);
};


// --- REACT QUERY ХУКИ ---

// Хук для списка врачей
export const useDoctors = () => {
  return useQuery<Doctor[]>({ 
    queryKey: ['doctors'], 
    queryFn: getDoctors 
  });
};

// Хук для одного врача
export const useDoctor = (id: number) => {
  return useQuery<Doctor>({ 
    queryKey: ['doctors', id], 
    queryFn: () => getDoctorById(id),
    enabled: !!id, // Не делать запрос, если id нет (например 0 или undefined)
  });
};

// Хук создания
export const useCreateDoctor = () => {
  const queryClient = useQueryClient();
 // const navigate = useNavigate();

  return useMutation({
    mutationFn: createDoctor,
    onSuccess: () => {
      // Инвалидируем список, чтобы он обновился
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      // Переходим обратно к списку
    //  navigate({ to: '/doctors/doctors' }); 
    },
    onError: (error) => {
        console.error("Failed to create doctor:", error);
        // Тут можно добавить тост с ошибкой
    }
  });
};

// Хук обновления
export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();
 // const navigate = useNavigate();

  return useMutation({
    mutationFn: updateDoctor,
    onSuccess: (updatedDoctor) => {
      // 1. Обновляем список
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      
      // 2. Обновляем кеш конкретного доктора (чтобы не делать лишний запрос getById, если мы на его странице)
      queryClient.setQueryData(['doctors', updatedDoctor.id], updatedDoctor);
      
      // navigate({ to: '/doctors/doctors' });
    },
    onError: (error) => {
        console.error("Failed to update doctor:", error);
    }
  });
};

// Хук удаления
export const useDeleteDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
    onError: (error) => {
        console.error("Failed to delete doctor:", error);
    }
  });
};
