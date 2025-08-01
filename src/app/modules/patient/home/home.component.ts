import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  imports: []
})
export class HomeComponent {
  patientName: string = 'Paciente'; // Puedes cargar el nombre real desde un servicio de usuario

  constructor(private router: Router) {}

  goToStudies() {
    this.router.navigate(['/patient/samples']);
  }

  goToIaReports() {
    this.router.navigate(['/patient/smart-report']);
  }

  goToCreateAppointment() {
    this.router.navigate(['/appointments/create']);
  }

  goToUpcomingAppointments() {
    this.router.navigate(['/patient/appointments-historial']);
  }
}
