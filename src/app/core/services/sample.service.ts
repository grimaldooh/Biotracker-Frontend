import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SampleDTO } from '../../modules/samples/sample.model'

@Injectable({ providedIn: 'root' })
export class SampleService {
  constructor(private http: HttpClient) {}

  getSamplesByHospital(hospitalId: string): Observable<SampleDTO[]> {
    return this.http.get<SampleDTO[]>(`http://localhost:8080/api/hospitals/${hospitalId}/samples`);
  }

  getSamplesByPatient(patientId: string) {
    return this.http.get<SampleDTO[]>(`http://localhost:8080/api/samples/patient/${patientId}`);
  }

  registerSample(sample: any) {
    return this.http.post('http://localhost:8080/api/samples', sample);
  }
  
}