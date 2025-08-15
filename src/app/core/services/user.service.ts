import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RegisterUserDTO {
  name: string;
  phoneNumber: string;
  email: string;
  password: string;
  role: string;
  specialty?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  registerUser(hospitalId: string, user: RegisterUserDTO): Observable<any> {
    // Nuevo endpoint y payload según lo solicitado
    return this.http.post(
      `${environment.apiUrl}/auth/signup/user/${hospitalId}`,
      user
    );
  }
}