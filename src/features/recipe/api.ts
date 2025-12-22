import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from "../../lib/axios";
import { Recipe, CreateRecipeRequest, UpdateRecipeRequest, RecipeMedicine } from "./types";

// ⚠️ Check your Express app router prefix
const BASE_URL = '/recipe'; 

// --- API FUNCTIONS ---

// 1. Get All Recipes (General History)
const getAllRecipes = async (): Promise<Recipe[]> => {
  const response = await apiClient.get(`${BASE_URL}/`);
  return response.data.data;
};

// 2. Get Pending Recipes (For Pharmacist/Doctor dashboard)
const getPendingRecipes = async (): Promise<Recipe[]> => {
  const response = await apiClient.get(`${BASE_URL}/pending`);
  return response.data.data;
};

// 3. Get One Recipe (Detailed view with medicines)
const getRecipeById = async (id: number): Promise<Recipe> => {
  const response = await apiClient.get(`${BASE_URL}/${id}`);
  return response.data.data;
};

// 4. Create Recipe
const createRecipe = async (data: CreateRecipeRequest): Promise<Recipe> => {
  const response = await apiClient.post(`${BASE_URL}/`, data);
  return response.data.data;
};

// 5. Update Recipe (e.g. Status change to 'виданий')
const updateRecipe = async ({ id, data }: { id: number; data: UpdateRecipeRequest }): Promise<Recipe> => {
  const response = await apiClient.patch(`${BASE_URL}/${id}`, data);
  return response.data.data;
};

// 6. Delete Recipe (If needed)
const deleteRecipe = async (id: number): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/${id}`);
};


// --- REACT QUERY HOOKS ---

// Hook for History
export const useAllRecipes = () => {
  return useQuery<Recipe[]>({ 
    queryKey: ['recipes', 'all'], 
    queryFn: getAllRecipes 
  });
};

// Hook for Pending (Active Queue)
export const usePendingRecipes = () => {
  return useQuery<Recipe[]>({ 
    queryKey: ['recipes', 'pending'], 
    queryFn: getPendingRecipes 
  });
};

// Hook for Details
export const useRecipe = (id: number) => {
  return useQuery<Recipe>({ 
    queryKey: ['recipes', id], 
    queryFn: () => getRecipeById(id),
    enabled: !!id,
  });
};

// Create Hook
export const useCreateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRecipe,
    onSuccess: () => {
      // Invalidate both lists
      queryClient.invalidateQueries({ queryKey: ['recipes', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['recipes', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['recipes', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['reception'] });
      
      // Also invalidate the reception related to this recipe if you have that cached
      // queryClient.invalidateQueries({ queryKey: ['receptions'] });
    },
    onError: (error) => {
      console.error("Failed to create recipe:", error);
    }
  });
};

// Update Hook (Used for issuing meds or changing status)
export const useUpdateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRecipe,
    onSuccess: (updatedData) => {
      // Update the specific cache
      queryClient.setQueryData(['recipes', updatedData.id], updatedData);
      
      // Invalidate lists to move items from 'pending' to 'history/done'
      queryClient.invalidateQueries({ queryKey: ['recipes', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['recipes', 'pending'] });
    },
  });
};

export const useMedicinesList = () => {
  return useQuery<RecipeMedicine[]>({
    queryKey: ['medicines', 'list'],
    queryFn: async () => {
      const res = await apiClient.get('/medicines'); // Предполагаемый эндпоинт
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5, // Кэшируем на 5 минут
  });
};

// Delete Hook
export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
    onError: (error) => {
      console.error("Failed to delete recipe:", error);
    }
  });
};