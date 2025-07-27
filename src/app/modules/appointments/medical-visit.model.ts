export interface MedicalVisitDTO {
  id: string;
  patientName: string;
  doctorName: string;
  visitDate: string;
  notes: string;
  diagnosis: string;
  recommendations: string;
  medicalEntityId: string;
  visitCompleted: boolean;
  type: 'CONSULTATION' | 'FOLLOW_UP' | 'SURGERY' | 'EMERGENCY' | 'OTHER';
}