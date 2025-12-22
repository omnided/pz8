export type WorkSchedule = {
  id: number;
  doctor_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room_number?: number;
};

// Тип Доктора (то, что приходит с бэкенда)
export type Doctor = {
  id: number;
  doctor_fullname: string;
  doctor_number: string;
  doctor_office: number;
  post_name: string;      // В твоем сервисе это строка
  photo_url: string | null;
  work_schedule: WorkSchedule | null; // Это поле добавляется в findById
};

// Данные для СОЗДАНИЯ (без ID)
export type CreateDoctorRequest = {
  doctor_fullname: string;
  doctor_number: string;
  doctor_office: number;
  post_name: string;
  photo_url: string;
};

// Данные для ОБНОВЛЕНИЯ (все поля опциональны)
export type UpdateDoctorRequest = Partial<CreateDoctorRequest>;
