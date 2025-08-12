import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Verificar rutas específicas por rol
    const url = route.url.join('/');
    const user = this.authService.getCurrentUser();

    if (url.startsWith('patient/') && !this.authService.isPatient()) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    if (url.startsWith('admin/') && !this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}