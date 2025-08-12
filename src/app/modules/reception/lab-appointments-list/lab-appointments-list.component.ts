import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LabAppointmentService, LabAppointmentDTO } from '../../../core/services/lab-appointment.service';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../patients/patient.model';

@Component({
  selector: 'app-lab-appointments-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lab-appointments-list.component.html',
})
export class LabAppointmentsListComponent implements OnInit {
  appointments: LabAppointmentDTO[] = [];
  filteredAppointments: LabAppointmentDTO[] = [];
  loading = false;
  loadingPatients = false;
  searchPatientTerm = '';
  filteredPatients: Patient[] = [];
  selectedPatient: Patient | null = null;
  hospitalId = '';

  constructor(
    private labAppointmentService: LabAppointmentService,
    private patientService: PatientService
  ) {
    // Hospital dinámico
    const hospitalInfo = localStorage.getItem('hospitalInfo');
    if (hospitalInfo) {
      try {
        const hospital = JSON.parse(hospitalInfo);
        this.hospitalId = hospital.id || '';
      } catch {
        this.hospitalId = '';
      }
    }
  }

  ngOnInit(): void {
    // No cargamos todas las citas por defecto, esperamos a que seleccionen un paciente
  }

  searchPatients(): void {
    if (this.searchPatientTerm.trim().length < 2) {
      this.filteredPatients = [];
      return;
    }

    this.loadingPatients = true;
    this.patientService.searchPatientsByHospital(this.searchPatientTerm, this.hospitalId).subscribe({
      next: (patients) => {
        this.filteredPatients = patients;
        this.loadingPatients = false;
      },
      error: () => {
        this.loadingPatients = false;
        this.filteredPatients = [];
      }
    });
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient = patient;
    this.filteredPatients = [];
    this.searchPatientTerm = '';
    this.loadAppointments(patient.id);
  }

  clearSelectedPatient(): void {
    this.selectedPatient = null;
    this.searchPatientTerm = '';
    this.filteredPatients = [];
    this.appointments = [];
    this.filteredAppointments = [];
  }

  loadAppointments(patientId: string): void {
    this.loading = true;
    this.labAppointmentService.findByPatient(patientId).subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.filteredAppointments = appointments;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.appointments = [];
        this.filteredAppointments = [];
      }
    });
  }

  getTotalSolicitadoAppointments(): number {
  return this.appointments?.filter(a => a.status === 'SOLICITADO')?.length ?? 0;
  }

  getTotalCompletedAppointments(): number {
  return this.appointments?.filter(a => a.status === 'COMPLETADA')?.length || 0;
  }

  getSampleTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
      'BLOOD': 'Sangre',
      'DNA': 'ADN',
      'TISSUE': 'Tejido',
      'SALIVA': 'Saliva',
      'URINE': 'Orina',
      'MUTATIONS': 'Mutaciones'
    };
    return types[type] || type;
  }

  getSampleTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'BLOOD': '🩸',
      'DNA': '🧬',
      'TISSUE': '🔬',
      'SALIVA': '💧',
      'URINE': '🧪',
      'MUTATIONS': '⚡'
    };
    return icons[type] || '🧪';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'SOLICITADO':
        return 'bg-amber-100 text-amber-800';
      case 'COMPLETADA':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'SOLICITADO':
        return 'Solicitado';
      case 'COMPLETADA':
        return 'Completada';
      default:
        return status;
    }
  }
}