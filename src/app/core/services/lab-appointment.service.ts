import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LabAppointmentDTO {
  id: string;
  medicalEntityId: string;
  doctorId: string | null;
  patientId: string;
  createdAt: string;
  status: 'SOLICITADO' | 'COMPLETADA';
  sampleType: 'BLOOD' | 'DNA' | 'TISSUE' | 'SALIVA' | 'URINE' | 'MUTATIONS';
  notes: string;
}

export interface LabAppointmentCreationDTO {
  medicalEntityId: string;
  doctorId: string | null;
  patientId: string;
  sampleType: 'BLOOD' | 'DNA' | 'TISSUE' | 'SALIVA' | 'URINE' | 'MUTATIONS';
  notes: string;
}

@Injectable({
  providedIn: 'root'
})
export class LabAppointmentService {
  private baseUrl = 'http://localhost:8080/api/lab-appointments';

  constructor(private http: HttpClient) {}

  create(appointment: LabAppointmentCreationDTO): Observable<LabAppointmentDTO> {
    return this.http.post<LabAppointmentDTO>(this.baseUrl, appointment);
  }

  findByPatient(patientId: string): Observable<LabAppointmentDTO[]> {
    return this.http.get<LabAppointmentDTO[]>(`${this.baseUrl}/patient/${patientId}`);
  }
}