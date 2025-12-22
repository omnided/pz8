export type PatientMedcard = {
  id: number;
  chronic_diseases: string | null;
  blood_type: string;
  created_at: string; // ISO date
  allergies: string[];
};

export type Patient = {
  id: number;
  fullname: string;
  sex: string;
  address: string;
  phone: string;
  birthday: string; // ISO date
  login: string;
  register_date: string; // ISO date
  
  medcard: PatientMedcard | null;
};

// Элемент списка (обычно медкарты нет)
export type PatientListItem = Omit<Patient, 'medcard'> & { medcard: null };


export type CreatePatientRequest = {
  patient_fullname: string;
  patient_sex: string;
  patient_address: string;
  patient_number: string;
  patient_birthdaydate: string | Date;
  patient_username: string;
};

// Данные для обновления (PATCH)
export type UpdatePatientRequest = Partial<CreatePatientRequest>;