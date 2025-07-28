import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-recepcion',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardRecepcionComponent {
  constructor(private router: Router) {}

  goToRegisterPatient() {
    this.router.navigate(['/patients/register']);
  }

  goToPatientsList() {
    // Implementa la navegación a la lista de pacientes
    this.router.navigate(['/patients']);
  }

  goToAppointments() {
    // Implementa la navegación a citas del día
    this.router.navigate(['/appointments']);
  }

  goToSamples() {
    // Implementa la navegación a búsqueda de pacientes
    this.router.navigate(['/samples']);
  }

  goToCreateAppointment() {
    this.router.navigate(['/appointments/create']);
  }

  goToInventory() {
    this.router.navigate(['/inventory']);
  } 
}
