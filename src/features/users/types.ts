export type User = {
  login: string;
  password: string;
  role: 'guest' | 'admin' | 'pediator' | 'pharmacist' | 'laborant' | 'patient';
};