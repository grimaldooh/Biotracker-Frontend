import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DoctorService, MedicalVisit } from '../../../core/services/doctors.service';

interface AppointmentGroup {
  date: string;
  appointments: MedicalVisit[];
}

@Component({
  selector: 'app-schedule-appointments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule-appointments.component.html',
  styleUrl: './schedule-appointments.component.css'
})
export class ScheduleAppointmentsComponent implements OnInit {
  doctorId = 'c332337f-ea0f-48b1-a1a6-9dac44364343'; // Obtener del servicio de autenticación
  pendingVisits: MedicalVisit[] = [];
  groupedAppointments: AppointmentGroup[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private router: Router,
    private doctorService: DoctorService
  ) {}

  ngOnInit() {
    this.loadPendingAppointments();
  }

  loadPendingAppointments() {
    this.loading = true;
    this.error = null;

    this.doctorService.getPendingVisits(this.doctorId).subscribe({
      next: (visits) => {
        this.pendingVisits = visits;
        this.groupAppointmentsByDate();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las citas programadas';
        this.setFallbackData();
        this.loading = false;
      }
    });
  }

  private groupAppointmentsByDate() {
    const grouped = new Map<string, MedicalVisit[]>();

    // Agrupar por fecha
    this.pendingVisits.forEach(visit => {
      const date = new Date(visit.visitDate).toDateString();
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)?.push(visit);
    });

    // Convertir a array y ordenar
    this.groupedAppointments = Array.from(grouped.entries())
      .map(([date, appointments]) => ({
        date,
        appointments: appointments.sort((a, b) => 
          new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime()
        )
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private setFallbackData() {
    this.pendingVisits = [
      {
        id: '1',
        patientName: 'María González',
        doctorName: 'Dr. García',
        visitDate: '2025-01-08T10:30:00',
        type: 'CONSULTATION',
        notes: 'Control rutinario de presión arterial',
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
      },
      {
        id: '3',
        patientName: 'Ana Rodríguez',
        doctorName: 'Dr. García',
        visitDate: '2025-01-09T09:00:00',
        type: 'CONSULTATION',
        notes: 'Primera consulta cardiológica',
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
        visitDate: '2025-01-10T14:30:00',
        type: 'FOLLOW_UP',
        notes: 'Revisión de exámenes de laboratorio',
        diagnosis: null,
        recommendations: null,
        medicalEntityId: '123',
        visitCompleted: false,
        medicalArea: 'Medicina Interna'
      }
    ];
    this.groupAppointmentsByDate();
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

  getAppointmentTypeColor(type: string): string {
    const colors: Record<string, string> = {
      'CONSULTATION': 'bg-blue-100 text-blue-700 border-blue-200',
      'FOLLOW_UP': 'bg-green-100 text-green-700 border-green-200',
      'SURGERY': 'bg-red-100 text-red-700 border-red-200',
      'EMERGENCY': 'bg-orange-100 text-orange-700 border-orange-200',
      'OTHER': 'bg-purple-100 text-purple-700 border-purple-200'
    };
    return colors[type] || 'bg-slate-100 text-slate-700 border-slate-200';
  }

  formatDateHeader(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Mañana';
    } else {
      return date.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
    }
  }

  isToday(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isTomorrow(dateString: string): boolean {
    const date = new Date(dateString);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  }

  goBack() {
    this.router.navigate(['/doctors/dashboard']);
  }

  refreshAppointments() {
    this.loadPendingAppointments();
  }

  viewPatientDetails(appointment: MedicalVisit) {
    // Guardar la cita actual en localStorage para el componente de manejo
    localStorage.setItem('currentVisit', JSON.stringify(appointment));
    // Navegar al componente de manejo de visita
    this.router.navigate(['/doctors/visit-management', appointment.id]);
  }

  getAppointmentsCountForToday(): number {
    const group = this.groupedAppointments.find(g => this.isToday(g.date));
    return group ? group.appointments.length : 0;
  }

  getAppointmentsCountForTomorrow(): number {
    const group = this.groupedAppointments.find(g => this.isTomorrow(g.date));
    return group ? group.appointments.length : 0;
  }
}
