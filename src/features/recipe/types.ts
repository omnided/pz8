export type RecipeStatus = 'очікує видачі' | 'виданий' | 'відмовлено';

// Main Recipe Entity (Output)
export type Recipe = {
  id: number;
  status: RecipeStatus;
  created_at: string; // ISO Date string
  frequency: string;
  duration: number;

  // Reception/Clinical Data
  diagnosis: string | null;
  assignment: string | null;

  // Patient Data
  patient_name: string;
  patient_number: string | null;
  patient_address: string | null;

  // Doctor Data
  doctor_name: string | null;
  doctor_office: number | null;

  // Medicines List (Populated in findOne, usually empty in findAll based on service code relations)
  medicines: RecipeMedicine[];
};

// Input DTO for Creating a Recipe
export type CreateRecipeRequest = {
  receptionId: number;
  frequency: string;
  duration: number;
  medicines: string[]; // Backend expects an array of medicine NAMES
};

export type RecipeMedicine = {
  id: number;
  medicine_name: string;
  quantity_stock: number;
};

// Input DTO for Updating
export type UpdateRecipeRequest = Partial<CreateRecipeRequest>;