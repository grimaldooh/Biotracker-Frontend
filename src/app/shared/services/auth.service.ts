import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = {
    role: 'PATIENT' // Esto vendría de tu sistema de autenticación
  };

  getCurrentUserRole(): string {
    return this.currentUser.role;
  }

  // Métodos adicionales para login, logout, etc.
}