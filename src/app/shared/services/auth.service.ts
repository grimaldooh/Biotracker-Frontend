import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  gender: string | null;
  specialty: string | null;
  role: string;
  token: string;
}

export interface SignupUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  specialty?: string;
}

export interface SignupPatientRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  birthDate: string;
  gender: string;
  curp?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Verificar si hay un usuario guardado en localStorage al inicializar
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('currentUser');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.logout();
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.setCurrentUser(response);
        })
      );
  }

  signupUser(userData: SignupUserRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup/user`, userData)
      .pipe(
        tap(response => {
          this.setCurrentUser(response);
        })
      );
  }

  signupPatient(patientData: SignupPatientRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup/patient`, patientData)
      .pipe(
        tap(response => {
          this.setCurrentUser(response);
        })
      );
  }

  private setCurrentUser(user: AuthResponse): void {
    localStorage.setItem('token', user.token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getCurrentUserRole(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.role : '';
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isPatient(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'PATIENT';
  }

  isDoctor(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'DOCTOR';
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  getUserType(): 'USER' | 'PATIENT' | null {
    const user = this.getCurrentUser();
    return user?.role === 'PATIENT' ? 'PATIENT' : 'USER';
  }

  redirectAfterLogin(): void {
    const user = this.getCurrentUser();
    if (user?.role === 'PATIENT') {
      this.router.navigate(['/patient/home']);
    } else {
      // Para DOCTOR, ADMIN, RECEPTIONIST, LAB_TECHNICIAN
      this.router.navigate(['/dashboard']);
    }
  }
}