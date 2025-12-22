// Описание одного лекарства внутри детализации выдачи
export type DispenseMedicine = {
  name: string;
  quantity_per_recipe: number;
};

// Элемент списка (возвращается в findAll и findMy)
export type DispenseListItem = {
  id: number;
  dispense_date: string; // С бэкенда приходит ISO строка
  quantity_dispensed: number;
  pharmacist_name: string;
  patient_name: string;
  diagnosis: string;
  recipe_id: number;
};

// Детальная информация (возвращается в findOne, create, update)
// Наследует поля из списка + добавляет детали рецепта
export type DispenseDetail = DispenseListItem & {
  doctor_prescriber: string;
  recipe_frequency: string;
  recipe_duration: string;
  medicines_list: DispenseMedicine[];
};

// Данные для выдачи рецепта (POST)
export type CreateDispenseRequest = {
    recipeId: number,
    pharmacistLogin: string 
  // pharmacistLogin берется из токена на бэке
};

// Данные для обновления (PATCH)
export type UpdateDispenseRequest = {
  dispense_date?: string | Date; 
  quantity?: number;
};