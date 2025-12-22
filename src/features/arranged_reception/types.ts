// Статусы записи (для удобства и автокомплита)
export type ReceptionStatus = 'очікування підтвердження' | 'підтверджено' | 'скасовано' | 'завершено';

// Базовая информация о докторе
export type ReceptionDoctor = {
  id: number;
  doctor_fullname: string;
  photo_url?: string | null; // Приходит в getReceptionById
  post?: string | null;      // Приходит в getReceptionById
};

// Базовая информация о пациенте
export type ReceptionPatient = {
  id: number;
  patient_fullname: string;
  patient_username?: string;
};

export type ReceptionResultData = {
  diagnosis: string;
  assignment: string | null;
};

// Основная сущность Записи (универсальная)
export type ArrangedReception = {
  id: number;
  appointment_date: string; // С бэкенда даты приходят строками (ISO)
  appointment_time: string;
  reason: string;
  status: ReceptionStatus | string;
  
  // Поля опциональны, так как в разных методах (my, pending, all) 
  // возвращаются разные связи (где-то пациент, где-то доктор)
  patient?: ReceptionPatient | null;
  pediator?: ReceptionDoctor | null;
  result?: ReceptionResultData | null;
};

// DTO для создания записи
export type CreateReceptionRequest = {
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:mm'
  reason: string;
};