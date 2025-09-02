import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InsuranceQuote, InsuranceQuoteRequest, InsuranceQuoteAction } from '../interfaces/insurance.interface';

@Injectable({
  providedIn: 'root'
})
export class InsuranceService {
  private baseUrl = `${environment.apiUrl}/insurance`;

  constructor(private http: HttpClient) {}

  // Solicitar nueva cotización
  requestQuote(quoteRequest: InsuranceQuoteRequest): Observable<InsuranceQuote> {
    return this.http.post<InsuranceQuote>(`${this.baseUrl}/quotes`, quoteRequest);
  }

  // Obtener cotizaciones de un paciente
  getPatientQuotes(patientId: string): Observable<InsuranceQuote[]> {
    return this.http.get<InsuranceQuote[]>(`${this.baseUrl}/quotes/patient/${patientId}`);
  }

  // Aceptar cotización
  acceptQuote(quoteId: string): Observable<InsuranceQuote> {
    return this.http.post<InsuranceQuote>(`${this.baseUrl}/quotes/${quoteId}/accept`, {});
  }

  // Rechazar cotización
  rejectQuote(quoteId: string): Observable<InsuranceQuote> {
    return this.http.post<InsuranceQuote>(`${this.baseUrl}/quotes/${quoteId}/reject`, {});
  }

  // Verificar salud del servicio Lambda
  checkLambdaHealth(): Observable<any> {
    return this.http.get(`${this.baseUrl}/lambda/health`);
  }
}