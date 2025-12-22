// Описание аллергии внутри медикамента
export type MedicineAllergy = {
  id: number;
  name: string;
};

// Основная сущность Медикамента
export type Medicine = {
  id: number;
  name: string;
  category: string;
  form: string;
  maker: string | null;
  expiry_date: string; // ISO date string
  count: number;
  allergies: MedicineAllergy[];
};

// Элемент списка (возможно, бэкенд возвращает пустой массив allergies в списке, 
// поэтому тип совместим)
export type MedicineListItem = Medicine;

// Данные для создания (POST)
export type CreateMedicineRequest = {
  medicine_name: string;
  medicine_category: string;
  medicine_form: string;
  medicine_count: number;
  medicine_expirydate: string | Date;
  medicine_maker?: string;
};

// Данные для обновления (PATCH)
export type UpdateMedicineRequest = Partial<CreateMedicineRequest>;