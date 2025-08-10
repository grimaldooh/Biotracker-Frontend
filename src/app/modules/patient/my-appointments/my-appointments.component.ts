import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../../core/services/patient.service';

export interface MedicalVisit {
  id: string;
  patientName: string;
  doctorName: string;
  visitDate: string;
  notes: string | null;
  diagnosis: string | null;
  recommendations: string | null;
  medicalEntityId: string;
  visitCompleted: boolean;
  type: string;
  medicalArea: string | null;
}

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-appointments.component.html',
})
export class MyAppointmentsComponent implements OnInit {
  allVisits: MedicalVisit[] = [];
  pendingVisits: MedicalVisit[] = [];
  loading = false;
  activeTab: 'all' | 'pending' = 'pending';
  
  // ID hardcodeado del paciente
  patientId = '60ede05e-702c-442a-aba1-4507bb2fe542';

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    
    // Cargar citas pendientes
    this.patientService.getPendingVisits(this.patientId).subscribe({
      next: (visits) => {
        this.pendingVisits = visits;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });

    // Cargar todas las citas
    this.patientService.getAllVisits(this.patientId).subscribe({
      next: (visits) => {
        this.allVisits = visits;
      },
      error: () => {
        console.error('Error loading all visits');
      }
    });
  }

  setActiveTab(tab: 'all' | 'pending'): void {
    this.activeTab = tab;
  }

  getVisitTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
      'CONSULTATION': 'Consulta',
      'FOLLOW_UP': 'Seguimiento',
      'EMERGENCY': 'Emergencia',
      'ROUTINE_CHECK': 'Chequeo de rutina'
    };
    return types[type] || type;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'COMPLETED':
        return 'Completada';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return status;
    }
  }

  navigateToNewAppointment(): void {
    // Navegar a la página de agendar nueva cita
    window.location.href = '/patient/schedule';
  }
  
}