import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DoctorService, DoctorStats, MedicalVisit } from '../../../core/services/doctors.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  doctorId = '1a042737-3406-4aa5-a7e6-948b4c136778'; // Obtener del servicio de autenticación
  doctorName = 'Dr. García'; // Obtener del servicio de autenticación
  
  stats: DoctorStats = {
    totalPatients: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0
  };
  
  allVisits: MedicalVisit[] = [];
  pendingVisits: MedicalVisit[] = [];
  todayAppointments: MedicalVisit[] = [];
  upcomingAppointments: MedicalVisit[] = [];
  loading = true;

  constructor(
    private router: Router,
    private doctorService: DoctorService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    
    // Cargar todas las citas y las pendientes en paralelo
    forkJoin({
      stats: this.doctorService.getDoctorStats(this.doctorId),
      allVisits: this.doctorService.getAllVisits(this.doctorId),
      pendingVisits: this.doctorService.getPendingVisits(this.doctorId)
    }).subscribe({
      next: (data) => {
        this.stats = data.stats;
        this.allVisits = data.allVisits;
        this.pendingVisits = data.pendingVisits;
        
        // Procesar las citas para obtener las de hoy y próximas
        this.processMedicalVisits();
        this.loading = false;
      },
      error: () => {
        // Datos de ejemplo en caso de error
        this.setFallbackData();
        this.loading = false;
      }
    });
  }

  private processMedicalVisits() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Filtrar citas de hoy (pendientes)
    this.todayAppointments = this.pendingVisits.filter(visit => {
      const visitDate = new Date(visit.visitDate);
      visitDate.setHours(0, 0, 0, 0);
      return visitDate.getTime() === today.getTime();
    }).sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime());

    // Filtrar próximas citas (pendientes, no de hoy)
    this.upcomingAppointments = this.pendingVisits.filter(visit => {
      const visitDate = new Date(visit.visitDate);
      visitDate.setHours(0, 0, 0, 0);
      return visitDate.getTime() >= tomorrow.getTime();
    }).sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime())
    .slice(0, 5); // Solo las próximas 5
  }

  private setFallbackData() {
    this.stats = {
      totalPatients: 142,
      todayAppointments: 3,
      upcomingAppointments: 23,
      completedAppointments: 156
    };

    // Datos de ejemplo para citas
    this.todayAppointments = [
      {
        id: '1',
        patientName: 'María González',
        doctorName: 'Dr. García',
        visitDate: '2025-01-08T10:30:00',
        type: 'CONSULTATION',
        notes: 'Control rutinario',
        diagnosis: null,
        recommendations: null,
        medicalEntityId: '123',
        visitCompleted: false,
        medicalArea: 'Medicina General'
      },
      {
        id: '2',
        patientName: 'Juan Pérez',
        doctorName: 'Dr. García',
        visitDate: '2025-01-08T11:15:00',
        type: 'FOLLOW_UP',
        notes: 'Seguimiento post-operatorio',
        diagnosis: null,
        recommendations: null,
        medicalEntityId: '123',
        visitCompleted: false,
        medicalArea: 'Cirugía'
      }
    ];

    this.upcomingAppointments = [
      {
        id: '3',
        patientName: 'Ana Rodríguez',
        doctorName: 'Dr. García',
        visitDate: '2025-01-09T09:00:00',
        type: 'CONSULTATION',
        notes: 'Primera consulta',
        diagnosis: null,
        recommendations: null,
        medicalEntityId: '123',
        visitCompleted: false,
        medicalArea: 'Cardiología'
      },
      {
        id: '4',
        patientName: 'Carlos López',
        doctorName: 'Dr. García',
        visitDate: '2025-01-09T14:30:00',
        type: 'FOLLOW_UP',
        notes: 'Revisión de exámenes',
        diagnosis: null,
        recommendations: null,
        medicalEntityId: '123',
        visitCompleted: false,
        medicalArea: 'Medicina Interna'
      }
    ];
  }

  // Navegación
  goToPatients() {
    this.router.navigate(['/doctor/patients']);
  }

  goToAppointments() {
    this.router.navigate(['/doctor/schedule-appointments']);
  }

  goToAppointmentHistory() {
    this.router.navigate(['/doctor/appointment-history']);
  }

  goToReports() {
    this.router.navigate(['/doctor/reports']);
  }

  // Utilidades
  getAppointmentTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'CONSULTATION': 'Consulta',
      'FOLLOW_UP': 'Seguimiento',
      'SURGERY': 'Cirugía',
      'EMERGENCY': 'Emergencia',
      'OTHER': 'Otro'
    };
    return labels[type] || type;
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  refresh() {
    this.loadDashboardData();
  }
}
