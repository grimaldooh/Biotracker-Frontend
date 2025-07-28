import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
    return this.http.post(`http://localhost:8080/api/hospitals/register-user/${hospitalId}`, user);
  }
}