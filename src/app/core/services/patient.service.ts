import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Patient } from '../../modules/patients/patient.model';
import { Observable } from 'rxjs';
import { MedicalVisitDTO } from '../../modules/appointments/medical-visit.model';


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
export class PatientService {
  private apiUrl = 'http://localhost:8080/api/hospitals/register-patient/46f163c3-c5ff-4301-ba5f-6e348e982a8a';

  constructor(private http: HttpClient) {}

  registerPatient(patient: Patient): Observable<any> {
    return this.http.post(this.apiUrl, patient);
  }

  getPatientsByHospital(hospitalId: string) {
    return this.http.get<Patient[]>(`http://localhost:8080/api/hospitals/${hospitalId}/patients`);
  }

  deletePatient(id: string) {
    return this.http.delete(`http://localhost:8080/api/patients/${id}`);
  }

  getPatientsByName(firstName: string, lastName: string) {
    const params = new URLSearchParams();
    if (firstName) params.append('firstName', firstName);
    if (lastName) params.append('lastName', lastName);
    return this.http.get<Patient[]>(`http://localhost:8080/api/patients/getPatientsByName?${params.toString()}`);
  }

  // Solo necesitas este método para obtener el string del resumen IA
  getLatestReportText(patientId: string): Observable<string> {
    return this.http.get(`http://localhost:8080/api/patients/latest/${patientId}/summary-text`, { responseType: 'text' });
  }

  getPendingVisits(patientId: string): Observable<MedicalVisit[]> {
    return this.http.get<MedicalVisit[]>(`http://localhost:8080/api/medical-visits/patient/${patientId}/pending`);
  }

  getAllVisits(patientId: string): Observable<MedicalVisit[]> {
    return this.http.get<MedicalVisit[]>(`http://localhost:8080/api/medical-visits/patient/${patientId}`);
  }
}
