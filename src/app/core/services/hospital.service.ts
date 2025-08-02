import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MedicalVisitDTO } from '../../modules/appointments/medical-visit.model';


interface Medic {
  id: string;
  name: string;
  specialty: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class HospitalService {
  constructor(private http: HttpClient) {}

  getMedicalVisitsByHospital(medicalEntityId: string): Observable<MedicalVisitDTO[]> {
    return this.http.get<MedicalVisitDTO[]>(`http://localhost:8080/api/medical-visits/hospital/${medicalEntityId}`);
  }

  getPatientVisits(patientId: string) {
    return this.http.get<MedicalVisitDTO[]>(`http://localhost:8080/api/medical-visits/patient/${patientId}`);
  }

  getMedicsByHospital(hospitalId: string): Observable<Medic[]> {
    return this.http.get<Medic[]>(`http://localhost:8080/api/users/hospital/${hospitalId}/medics`);
  }

  createMedicalVisit(hospitalId: string, visitData: any): Observable<any> {
    return this.http.post(`http://localhost:8080/api/medical-visits/${hospitalId}`, visitData);
  }
}