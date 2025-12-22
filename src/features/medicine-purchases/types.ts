export type PurchaseStatus = 'чекає прийняття' | 'прийнято' | 'скасовано' | 'доставлено';

// Item inside a purchase
export type PurchaseItem = {
  name: string;
  quantity: number;
};

// Basic info for the list (findAll / findMy)
export type PurchaseListItem = {
  id: number;
  status: PurchaseStatus;
  create_date: string; // ISO Date string
  pharmacist: string;  // Name
  admin: string | null;
  admin_date: string | null;
  deliver: string | null;
  deliver_date?: string | null;
};

// Detailed info (findOne) - includes the list of medicines
export type PurchaseDetail = PurchaseListItem & {
  medicines: PurchaseItem[];
};

// --- Request DTOs ---

// POST / (Create)
export type CreatePurchaseRequest = {
  items: PurchaseItem[];
};

// PATCH /:id (Admin Process)
export type ProcessPurchaseRequest = {
  action: 'approve' | 'cancel';
};

// PATCH /:id/delivery (Courier Process)
export type ProcessDeliveryRequest = {
  action: 'delivered' | 'cancel';
};