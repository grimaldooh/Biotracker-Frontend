export interface Patient {
  id : string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  email: string;
  password : string;
  phoneNumber: string;
  curp: string;
  createdAt: string;
}