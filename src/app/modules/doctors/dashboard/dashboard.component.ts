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
  doctorId = '';
  doctorName = '';
  
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
  ) {
    // Obtener datos dinámicos del usuario autenticado (localStorage)
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.doctorId = user.userId || user.id || '';
        this.doctorName = user.name || '';
      } catch {
        this.doctorId = '';
        this.doctorName = '';
      }
    }
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    
    forkJoin({
      stats: this.doctorService.getDoctorStats(this.doctorId),
      allVisits: this.doctorService.getAllVisits(this.doctorId),
      pendingVisits: this.doctorService.getPendingVisits(this.doctorId)
    }).subscribe({
      next: (data) => {
        this.stats = data.stats;
        this.allVisits = data.allVisits;
        this.pendingVisits = data.pendingVisits;
        this.processMedicalVisits();
        this.loading = false;
      },
      error: () => {
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

    this.todayAppointments = this.pendingVisits.filter(visit => {
      const visitDate = new Date(visit.visitDate);
      visitDate.setHours(0, 0, 0, 0);
      return visitDate.getTime() === today.getTime();
    }).sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime());

    this.upcomingAppointments = this.pendingVisits.filter(visit => {
      const visitDate = new Date(visit.visitDate);
      visitDate.setHours(0, 0, 0, 0);
      return visitDate.getTime() >= tomorrow.getTime();
    }).sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime())
    .slice(0, 5);
  }

  private setFallbackData() {
    this.stats = {
      totalPatients: 142,
      todayAppointments: 3,
      upcomingAppointments: 23,
      completedAppointments: 156
    };

    this.todayAppointments = [
      {
        id: '1',
        patientName: 'María González',
        patientId: '60ede05e-702c-442a-aba1-4507bb2fe542',
        doctorName: this.doctorName,
        visitDate: '2025-01-08T10:30:00',
        type: 'CONSULTATION',
        notes: 'Control rutinario',
        diagnosis: null,
        recommendations: null,
        medicalEntityId: '123',
        visitCompleted: false,
        medicalArea: 'Medicina General',
        patientVisitsCount: 5
      },
      {
        id: '2',
        patientName: 'Juan Pérez',
        patientId: '60ede05e-702c-442a-aba1-4507bb2fe543',
        doctorName: this.doctorName,
        visitDate: '2025-01-08T11:15:00',
        type: 'FOLLOW_UP',
        notes: 'Seguimiento post-operatorio',
        diagnosis: null,
        recommendations: null,
        medicalEntityId: '123',
        visitCompleted: false,
        medicalArea: 'Cirugía',
        patientVisitsCount: 12
      }
    ];

    this.upcomingAppointments = [
      {
        id: '3',
        patientName: 'Ana Rodríguez',
        patientId: '60ede05e-702c-442a-aba1-4507bb2fe544',
        doctorName: this.doctorName,
        visitDate: '2025-01-09T09:00:00',
        type: 'CONSULTATION',
        notes: 'Primera consulta',
        diagnosis: null,
        recommendations: null,
        medicalEntityId: '123',
        visitCompleted: false,
        medicalArea: 'Cardiología',
        patientVisitsCount: 1
      },
      {
        id: '4',
        patientName: 'Carlos López',
        patientId: '60ede05e-702c-442a-aba1-4507bb2fe545',
        doctorName: this.doctorName,
        visitDate: '2025-01-09T14:30:00',
        type: 'FOLLOW_UP',
        notes: 'Revisión de exámenes',
        diagnosis: null,
        recommendations: null,
        medicalEntityId: '123',
        visitCompleted: false,
        medicalArea: 'Medicina Interna',
        patientVisitsCount: 3
      }
    ];
  }

  goToPatients() {
    this.router.navigate(['/doctor/patients']);
  }

  goToAppointments() {
    this.router.navigate(['/doctor/schedule-appointments']);
  }

  goToAppointmentHistory() {
    this.router.navigate(['/doctors/visit-history']);
  }

  goToReports() {
    this.router.navigate(['/doctor/reports']);
  }

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
