// Nested period object
export type SickLeavePeriod = {
  start: string; // ISO Date string
  end: string;   // ISO Date string
};

// Main Sick Leave Entity
export type SickLeave = {
  id: number;
  issue_date: string; // ISO Date string
  period: SickLeavePeriod;
  diagnosis: string;
  patient_name: string;
  doctor_name: string;
  reception_id: number;
};

// Request DTO for creating a sick leave
export type CreateSickLeaveRequest = {
  reception_id: number;
  start_date: string | Date;
  end_date: string | Date;
};