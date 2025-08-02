import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DoctorStats {
  totalPatients: number;
  todayAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
}

export interface MedicalVisit {
  id: string;
  patientName: string;
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

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiUrl = 'http://localhost:8080/api/medical-visits';

  constructor(private http: HttpClient) {}

  getDoctorStats(doctorId: string): Observable<DoctorStats> {
    return this.http.get<DoctorStats>(`http://localhost:8080/api/users/${doctorId}/stats`);
  }

  // Todas las citas del doctor
  getAllVisits(doctorId: string): Observable<MedicalVisit[]> {
    return this.http.get<MedicalVisit[]>(`${this.apiUrl}/doctor/${doctorId}`);
  }

  // Solo citas pendientes del doctor
  getPendingVisits(doctorId: string): Observable<MedicalVisit[]> {
    return this.http.get<MedicalVisit[]>(`${this.apiUrl}/doctor/${doctorId}/pending`);
  }
}