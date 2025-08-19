import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Patient } from '../../modules/patients/patient.model';
import { Observable } from 'rxjs';
import { MedicalVisitDTO } from '../../modules/appointments/medical-visit.model';
import { environment } from '../../../environments/environment';


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

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = `${environment.apiUrl}/hospitals/register-patient/00d79e66-4457-4d27-9228-fe467823ce8e`;

  constructor(private http: HttpClient) {}

  registerPatient(patient: Patient): Observable<any> {
    return this.http.post(this.apiUrl, patient);
  }

  getPatientsByHospital(hospitalId: string) {
    return this.http.get<Patient[]>(`${environment.apiUrl}/hospitals/${hospitalId}/patients`);
  }

  deletePatient(id: string) {
    return this.http.delete(`${environment.apiUrl}/patients/${id}`);
  }

  getPatientsByName(firstName: string, lastName: string) {
    const params = new URLSearchParams();
    if (firstName) params.append('firstName', firstName);
    if (lastName) params.append('lastName', lastName);
    return this.http.get<Patient[]>(`${environment.apiUrl}/patients/getPatientsByName?${params.toString()}`);
  }

  // Solo necesitas este método para obtener el string del resumen IA
  getLatestReportText(patientId: string): Observable<string> {
    return this.http.get(`${environment.apiUrl}/patients/latest/${patientId}/summary-text`, { responseType: 'text' });
  }

  getPendingVisits(patientId: string): Observable<MedicalVisit[]> {
    return this.http.get<MedicalVisit[]>(`${environment.apiUrl}/medical-visits/patient/${patientId}/pending`);
  }

  getAllVisits(patientId: string): Observable<MedicalVisit[]> {
    return this.http.get<MedicalVisit[]>(`${environment.apiUrl}/medical-visits/patient/${patientId}`);
  }

  searchPatientsByHospital(query: string, hospitalId: string) {
    return this.http.get<Patient[]>(`${environment.apiUrl}/hospitals/${hospitalId}/patients/search`, {
      params: { query }
    });
  }

  getLatestReportTextPatientFriendly(patientId: string): Observable<string> {
    return this.http.get(`${environment.apiUrl}/patients/latest/${patientId}/summary-text/patient-friendly`, { responseType: 'text' });
  }
}
