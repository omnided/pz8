export type Medcard = {
  id: number;
  created_at: string;
  blood_type: string;
  chronic_diseases: string | null;
  patient_name: string;
  patient_id: number;
  allergies: string[]; 
};

export type MedcardListItem = Omit<Medcard, 'allergies'>;

export type CreateMedcardRequest = {
  patientName: string;
  chronic?: string;
  blood_type?: string;
  allergies?: string[];
};

export type UpdateMedcardRequest = {
  chronic?: string;
  blood_type?: string;
};