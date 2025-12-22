import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from "../../lib/axios";
import { SickLeave, CreateSickLeaveRequest } from "./types";

// ⚠️ Check your router prefix in your Express app
const BASE_URL = '/sick-leave'; 

// --- API FUNCTIONS ---

// 1. Get ALL (Admin/Doctor)
const getAllSickLeaves = async (): Promise<SickLeave[]> => {
  const response = await apiClient.get(`${BASE_URL}/`);
  return response.data.data;
};

// 2. Get MY (Patient/Doctor specific list)
const getMySickLeaves = async (): Promise<SickLeave[]> => {
  const response = await apiClient.get(`${BASE_URL}/my`);
  return response.data.data;
};

// 3. Get ONE
const getSickLeaveById = async (id: number): Promise<SickLeave> => {
  const response = await apiClient.get(`${BASE_URL}/${id}`);
  return response.data.data;
};

// 4. Create
const createSickLeave = async (data: CreateSickLeaveRequest): Promise<SickLeave> => {
  const response = await apiClient.post(`${BASE_URL}/`, data);
  return response.data.data;
};

// 5. Delete
const deleteSickLeave = async (id: number): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/${id}`);
};


// --- REACT QUERY HOOKS ---

// Hook for All Sick Leaves (Registry/Admin)
export const useAllSickLeaves = () => {
  return useQuery<SickLeave[]>({ 
    queryKey: ['sick-leaves', 'all'], 
    queryFn: getAllSickLeaves 
  });
};

// Hook for My Sick Leaves (Patient Profile)
export const useMySickLeaves = () => {
  return useQuery<SickLeave[]>({ 
    queryKey: ['sick-leaves', 'my'], 
    queryFn: getMySickLeaves 
  });
};

// Hook for Single Details
export const useSickLeave = (id: number) => {
  return useQuery<SickLeave>({ 
    queryKey: ['sick-leaves', id], 
    queryFn: () => getSickLeaveById(id),
    enabled: !!id,
  });
};

// Create Hook
export const useCreateSickLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSickLeave,
    onSuccess: () => {
      // Invalidate both lists because a new document affects both views
      queryClient.invalidateQueries({ queryKey: ['sick-leaves', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['sick-leaves', 'my'] });
    },
    onError: (error) => {
      console.error("Failed to create sick leave:", error);
    }
  });
};

// Delete Hook
export const useDeleteSickLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSickLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sick-leaves'] });
    },
    onError: (error) => {
      console.error("Failed to delete sick leave:", error);
    }
  });
};