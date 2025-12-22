export type AnalysisListItem = {
  id: number;
  date: string;       // ISO дата
  result: string;
  analysis_type: string;
  patient_name: string;
};

// Детальная информация об анализе (возвращает findOne и findMy)
export type AnalysisDetail = {
  id: number;
  date: string;
  result: string;
  type: string;
  referral_date: string;
  patient: {
    id: number;
    name: string;
  };
  referred_by_doctor: {
    name: string;
  };
  performed_by_laborant: {
    name: string;
  };
};

// Данные для создания анализа
export type CreateAnalysisRequest = {
  referralId: number;
  result: string;
  // laborantUsername обычно берется из токена на бэкенде, 
  // но если нужно передавать явно, добавь сюда. 
  // В твоем контроллере скорее всего username берется из req.jwtPayload.
};