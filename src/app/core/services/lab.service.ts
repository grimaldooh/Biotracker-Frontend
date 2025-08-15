import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LabAppointmentRequest {
  doctorId: string;
  patientId: string;
  sampleType: string;
  notes: string;
}

@Injectable({
  providedIn: 'root'
})
export class LabService {
  private apiUrl = `${environment.apiUrl}/lab-appointments`;

  constructor(private http: HttpClient) {}

  createLabAppointment(request: LabAppointmentRequest): Observable<any> {
    return this.http.post(this.apiUrl, request);
  }
}