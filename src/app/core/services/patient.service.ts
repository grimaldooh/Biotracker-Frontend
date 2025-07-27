import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Patient } from '../../modules/patients/patient.model';
import { Observable } from 'rxjs';
import { MedicalVisitDTO } from '../../modules/appointments/medical-visit.model';

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

}
