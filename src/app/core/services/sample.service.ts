import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SampleDTO } from '../../modules/samples/sample.model'

interface GeneticReport {
  reportId: string;
  geneticSample: {
    id: string;
    type: string;
    status: string;
    medicalEntityId: string;
    collectionDate: string;
    notes: string;
    createdAt: string;
    confidenceScore: number;
    processingSoftware: string;
    referenceGenome: string;
  };
  sample: any;
  s3Url: string;
  s3UrlPatient: string | null;
}

@Injectable({ providedIn: 'root' })
export class SampleService {
  private apiUrl = 'http://localhost:8080/api';

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

  getSampleById(id: string): Observable<SampleDTO> {
    return this.http.get<SampleDTO>(`http://localhost:8080/api/samples/${id}`);
  }
  
  getGeneticSamples(patientId: string): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/api/genetic-samples/patient/${patientId}`);
  }

  getGeneticReports(patientId: string): Observable<GeneticReport[]> {
    return this.http.get<GeneticReport[]>(`${this.apiUrl}/reports/patient/${patientId}/genetic`);
  }

  getGeneticReportFromUrl(s3Url: string, isPatientFriendly: boolean = false): Observable<any> {
    const url = `${this.apiUrl}/reports/genetic-report-from-url?s3Url=${encodeURIComponent(s3Url)}${isPatientFriendly ? '&isPatientFriendly=true' : ''}`;
    return this.http.get<any>(url);
  }
}