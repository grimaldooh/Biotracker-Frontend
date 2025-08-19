import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


export interface DoctorStats {
  totalPatients: number;
  todayAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
}

export interface MedicalVisit {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  visitDate: string;
  notes: string | null;
  diagnosis: string | null;
  recommendations: string | null;
  medicalEntityId: string;
  visitCompleted: boolean;
  type: string;
  medicalArea: string | null;
}

export interface VisitAdvanceDto {
  notes: string;
  diagnosis: string;
  recommendations: string;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiUrl = `${environment.apiUrl}/medical-visits`;

  constructor(private http: HttpClient) {}

  getDoctorStats(doctorId: string): Observable<DoctorStats> {
    return this.http.get<DoctorStats>(`${environment.apiUrl}/users/${doctorId}/stats`);
  }

  // Todas las citas del doctor
  getAllVisits(doctorId: string): Observable<MedicalVisit[]> {
    return this.http.get<MedicalVisit[]>(`${this.apiUrl}/doctor/${doctorId}`);
  }

  // Solo citas pendientes del doctor
  getPendingVisits(doctorId: string): Observable<MedicalVisit[]> {
    return this.http.get<MedicalVisit[]>(`${this.apiUrl}/doctor/${doctorId}/pending`);
  }

  // Enviar avance de cita médica
  submitVisitAdvance(visitId: string, visitData: VisitAdvanceDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/submitAdvance/${visitId}`, visitData);
  }
}