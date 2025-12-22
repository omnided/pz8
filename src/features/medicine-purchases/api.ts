import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from "../../lib/axios";
import { 
  PurchaseListItem, 
  PurchaseDetail, 
  CreatePurchaseRequest, 
  ProcessPurchaseRequest,
  ProcessDeliveryRequest
} from "./types";

// ⚠️ Check your router prefix in your Express app
const BASE_URL = '/medicine-purchase'; 

// --- API FUNCTIONS ---

// 1. Get ALL (Admin/Head Pharmacist)
const getAllPurchases = async (): Promise<PurchaseListItem[]> => {
  const response = await apiClient.get(`${BASE_URL}/`);
  return response.data.data;
};

// 2. Get MY (Pharmacist, Admin, Courier)
const getMyPurchases = async (): Promise<PurchaseListItem[]> => {
  const response = await apiClient.get(`${BASE_URL}/my`);
  return response.data.data;
};

// 3. Get ONE (Detail)
const getPurchaseById = async (id: number): Promise<PurchaseDetail> => {
  const response = await apiClient.get(`${BASE_URL}/${id}`);
  return response.data.data;
};

// 4. Create (Pharmacist)
const createPurchase = async (data: CreatePurchaseRequest): Promise<PurchaseDetail> => {
  const response = await apiClient.post(`${BASE_URL}/`, data);
  return response.data.data;
};

// 5. Admin Process (Approve/Cancel)
const processPurchaseAdmin = async ({ id, data }: { id: number; data: ProcessPurchaseRequest }): Promise<PurchaseDetail> => {
  const response = await apiClient.patch(`${BASE_URL}/${id}`, data);
  return response.data.data;
};

// 6. Courier Process (Delivered/Cancel)
const processPurchaseDelivery = async ({ id, data }: { id: number; data: ProcessDeliveryRequest }): Promise<PurchaseDetail> => {
  const response = await apiClient.patch(`${BASE_URL}/${id}/delivery`, data);
  return response.data.data;
};

// 7. Delete (Pharmacist - only if 'чекає прийняття')
const deletePurchase = async (id: number): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/${id}`);
};


// --- REACT QUERY HOOKS ---

// Hook for All Purchases
export const useAllPurchases = () => {
  return useQuery<PurchaseListItem[]>({ 
    queryKey: ['purchases', 'all'], 
    queryFn: getAllPurchases 
  });
};

// Hook for My Purchases
export const useMyPurchases = () => {
  return useQuery<PurchaseListItem[]>({ 
    queryKey: ['purchases', 'my'], 
    queryFn: getMyPurchases 
  });
};

// Hook for Single Purchase
export const usePurchase = (id: number) => {
  return useQuery<PurchaseDetail>({ 
    queryKey: ['purchases', id], 
    queryFn: () => getPurchaseById(id),
    enabled: !!id,
  });
};

// Create Hook
export const useCreatePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPurchase,
    onSuccess: () => {
      // Invalidate 'my' because the pharmacist just created one
      queryClient.invalidateQueries({ queryKey: ['purchases', 'my'] });
      // Invalidate 'all' for admins
      queryClient.invalidateQueries({ queryKey: ['purchases', 'all'] });
    },
    onError: (error) => console.error("Create failed:", error)
  });
};

// Admin Process Hook
export const useProcessPurchaseAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: processPurchaseAdmin,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.setQueryData(['purchases', data.id], data);
    },
    onError: (error) => console.error("Admin process failed:", error)
  });
};

// Courier Process Hook
export const useProcessPurchaseDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: processPurchaseDelivery,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.setQueryData(['purchases', data.id], data);
    },
    onError: (error) => console.error("Delivery process failed:", error)
  });
};

// Delete Hook
export const useDeletePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
    onError: (error) => console.error("Delete failed:", error)
  });
};