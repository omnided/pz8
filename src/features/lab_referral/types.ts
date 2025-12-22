// Статус направления
export type ReferralStatus = 'очікування' | 'виконано' | 'скасовано';

// Вложенный объект пациента
export type ReferralPatient = {
  id: number;
  fullname: string;
};

// Вложенный объект доктора
export type ReferralDoctor = {
  id: number;
  fullname: string;
};

// Вложенный объект результата (если анализ уже сделан)
export type ReferralAnalysisResult = {
  id: number;
  result: string;
  date: string; // ISO string
};

// Основная сущность Направления (то, что возвращает API)
export type LabReferral = {
  id: number;
  analysis_type: string;
  referral_date: string; // ISO string
  status: ReferralStatus | string;
  
  patient: ReferralPatient | null;
  doctor: ReferralDoctor | null;
  analysis_result: ReferralAnalysisResult | null;
};

// Данные для создания (POST)
export type CreateReferralRequest = {
  // Бэкенд принимает "patientIdentifier", который может быть ID (число) или Именем (строка)
  patientIdentifier: number | string; 
  analysisType: string;
};