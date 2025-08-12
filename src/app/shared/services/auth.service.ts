import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, switchMap } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: string; 
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

export interface HospitalInfo {
  id: string;
  name: string;
  fullAddress: string;
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
        }),
        switchMap(response => {
          // Después del login exitoso, obtener información del hospital
          return this.loadUserHospitalInfo(response);
        })
      );
  }

  signupUser(userData: SignupUserRequest, hospitalId?: string): Observable<AuthResponse> {
    const endpoint = hospitalId 
      ? `${this.apiUrl}/signup/user/${hospitalId}`
      : `${this.apiUrl}/signup/user`;
      
    return this.http.post<AuthResponse>(endpoint, userData)
      .pipe(
        tap(response => {
          this.setCurrentUser(response);
        }),
        switchMap(response => {
          // Después del signup exitoso, obtener información del hospital
          return this.loadUserHospitalInfo(response);
        })
      );
  }

  signupPatient(patientData: SignupPatientRequest, hospitalId?: string): Observable<AuthResponse> {
    const endpoint = hospitalId 
      ? `${this.apiUrl}/signup/patient/${hospitalId}`
      : `${this.apiUrl}/signup/patient`;
      
    return this.http.post<AuthResponse>(endpoint, patientData)
      .pipe(
        tap(response => {
          // Solo establecer usuario si no se proporcionó hospitalId (modo signup directo)
          if (!hospitalId) {
            this.setCurrentUser(response);
          }
        }),
        switchMap(response => {
          // Si es modo signup directo, cargar info del hospital
          if (!hospitalId) {
            return this.loadUserHospitalInfo(response);
          }
          // Si es modo recepción, solo retornar la respuesta
          return new Observable<AuthResponse>(observer => {
            observer.next(response);
            observer.complete();
          });
        })
      );
  }

  private loadUserHospitalInfo(user: AuthResponse): Observable<AuthResponse> {
    return new Observable(observer => {
      // Primero extraer el userId del token JWT o usar otro método
      const userId = user.id
      
      if (!userId) {
        console.error('No se pudo extraer el userId');
        observer.next(user);
        observer.complete();
        return;
      }

      // Determinar el endpoint según el tipo de usuario
      const endpoint = user.role === 'PATIENT' 
        ? `http://localhost:8080/api/patients/${userId}/primary-hospital`
        : `http://localhost:8080/api/users/${userId}/primary-hospital`;

      this.http.get<HospitalInfo>(endpoint).subscribe({
        next: (hospitalInfo) => {
          // Guardar información del hospital en localStorage
          localStorage.setItem('hospitalInfo', JSON.stringify(hospitalInfo));
          
          // Actualizar usuario con el ID
          const updatedUser = { ...user, userId };
          this.setCurrentUser(updatedUser);
          
          observer.next(updatedUser);
          observer.complete();
        },
        error: (error) => {
          console.error('Error loading hospital info:', error);
          // Continuar sin información del hospital
          const updatedUser = { ...user, userId };
          this.setCurrentUser(updatedUser);
          observer.next(updatedUser);
          observer.complete();
        }
      });
    });
  }

  private extractUserIdFromToken(token: string): string | null {
    try {
      // Decodificar el payload del JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Asumir que el userId está en el campo 'sub' o 'userId'
      return payload.sub || payload.userId || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
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

  getCurrentUserId(): string | null {
    const user = this.getCurrentUser();
    return user?.id || null;
  }

  getHospitalInfo(): HospitalInfo | null {
    const hospitalData = localStorage.getItem('hospitalInfo');
    if (hospitalData) {
      try {
        return JSON.parse(hospitalData);
      } catch (error) {
        console.error('Error parsing hospital data:', error);
        return null;
      }
    }
    return null;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('hospitalInfo');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
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
    }else if (user?.role === 'MEDIC') {
      this.router.navigate(['/doctors/dashboard']);
    }
    else if (user?.role === 'RECEPTIONIST') {
      this.router.navigate(['/reception/dashboard']);
    } else if (user?.role === 'LAB_TECHNICIAN') {
      this.router.navigate(['/lab/dashboard']);
    }
    else {
      this.router.navigate(['/']);
    }
  }
}