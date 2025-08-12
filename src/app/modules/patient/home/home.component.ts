import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  imports: []
})
export class HomeComponent {
  patientName: string = 'Paciente';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    // Cargar el nombre real del paciente desde AuthService
    const user = this.authService.getCurrentUser();
    if (user) {
      this.patientName = user.firstName
        ? `${user.firstName}`.trim()
        : (user.name ?? 'Paciente');
    }
  }

  goToStudies() {
    this.router.navigate(['/patient/samples']);
  }

  goToIaReports() {
    this.router.navigate(['/patient/smart-report']);
  }

  goToCreateAppointment() {
    this.router.navigate(['/patient/schedule']);
  }

  goToUpcomingAppointments() {
    this.router.navigate(['/patient/appointments-historial']);
  }
}
