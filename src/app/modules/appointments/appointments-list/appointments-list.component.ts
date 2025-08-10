import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HospitalService } from '../../../core/services/hospital.service';
import { MedicalVisitDTO } from '../medical-visit.model';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments-list.component.html',
  styleUrl: './appointments-list.component.css'
})
export class AppointmentsListComponent implements OnInit {
  medicalEntityId = '00d79e66-4457-4d27-9228-fe467823ce8e'; // Usa el id que ya tienes
  visits: MedicalVisitDTO[] = [];
  loading = true;
  appointments: MedicalVisitDTO[] = [];

  // Variables para filtros
  searchTerm: string = '';
  statusFilter: string = '';
  dateFilter: string = '';

  constructor(private hospitalService: HospitalService, private router: Router) {}

  ngOnInit() {
    this.hospitalService.getMedicalVisitsByHospital(this.medicalEntityId).subscribe({
      next: (data) => {
        this.visits = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get upcomingVisits() {
    return this.visits.filter(v => !v.visitCompleted);
  }

  get pastVisits() {
    return this.visits.filter(v => v.visitCompleted);
  }

  goToCreateAppointment() {
    this.router.navigate(['/appointments/create']);
  }

  // Métodos para estadísticas
  getTotalAppointments(): number {
    return this.upcomingVisits.length + this.pastVisits.length;
  }

  getTodayAppointments(): number {
    const today = new Date();
    const allVisits = [...this.upcomingVisits, ...this.pastVisits];
    return allVisits.filter(visit => {
      const visitDate = new Date(visit.visitDate);
      return visitDate.toDateString() === today.toDateString();
    }).length;
  }

  // Métodos para colores y etiquetas de tipos de visita
  getVisitTypeColor(type: string): string {
    switch (type) {
      case 'CONSULTATION':
        return 'bg-blue-100 text-blue-800';
      case 'FOLLOW_UP':
        return 'bg-green-100 text-green-800';
      case 'EMERGENCY':
        return 'bg-red-100 text-red-800';
      case 'CHECKUP':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  }

  getVisitTypeLabel(type: string): string {
    switch (type) {
      case 'CONSULTATION':
        return 'Consulta';
      case 'FOLLOW_UP':
        return 'Seguimiento';
      case 'EMERGENCY':
        return 'Emergencia';
      case 'CHECKUP':
        return 'Revisión';
      default:
        return type;
    }
  }

  // Métodos para acciones
  viewAppointmentDetails(visit: any): void {
    // Implementar lógica para ver detalles
    console.log('Ver detalles de:', visit);
  }

  completeAppointment(visit: any): void {
    // Implementar lógica para completar cita
    console.log('Completar cita:', visit);
  }

  cancelAppointment(visit: any): void {
    // Implementar lógica para cancelar cita
    console.log('Cancelar cita:', visit);
  }

  viewMedicalReport(visit: any): void {
    // Implementar lógica para ver reporte médico
    console.log('Ver reporte médico:', visit);
  }
}
