// Основная сущность Результата приема (Reception)
// Соответствует тому, что возвращает метод transform
export type Reception = {
  id: number;
  diagnosis: string | null;
  assignment: string | null;

  // Данные из назначения (ArrangedReception)
  appointment_date: string; // ISO date string
  appointment_time: string;
  reason: string;

  // Данные пациента
  patient_name: string;

  // Данные врача
  doctor_name: string;
  doctor_photo: string | null;
};

// Данные для создания (POST)
export type CreateReceptionRequest = {
  arranged_id: number;
  diagnosis?: string;
  assignment?: string;
};

// Данные для обновления (PATCH)
export type UpdateReceptionRequest = {
  diagnosis?: string;
  assignment?: string;
};