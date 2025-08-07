import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorService, MedicalVisit, VisitAdvanceDto } from '../../../core/services/doctors.service';
import { PatientService } from '../../../core/services/patient.service';
import { SampleService } from '../../../core/services/sample.service';
import { Sample, AIReport, StudyReport } from '../../../core/interfaces/sample.interface';

@Component({
  selector: 'app-visit-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './visit-management.component.html',
})
export class VisitManagementComponent implements OnInit {
  visitForm: FormGroup;
  currentVisit: MedicalVisit | null = null;
  patientSamples: Sample[] = [];
  patientVisits: MedicalVisit[] = [];
  aiReport: AIReport | null = null;
  
  // Modal states
  showVisitModal = false;
  showSampleModal = false;
  selectedVisit: MedicalVisit | null = null;
  selectedSample: Sample | null = null;
  
  loading = true;
  submitting = false;
  showAllSamples = false;
  showAllVisits = false;
  showAIReport = false;
  
  visitId: string = '';
  visitData: MedicalVisit | null = null;

  // Nuevas propiedades para el modal
  showPostConsultationModal = false;
  consultationCompleted = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService,
    private patientService: PatientService,
    private sampleService: SampleService
  ) {
    this.visitForm = this.fb.group({
      notes: ['', [Validators.required, Validators.minLength(10)]],
      diagnosis: ['', [Validators.required, Validators.minLength(5)]],
      recommendations: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit() {
    this.visitId = this.route.snapshot.paramMap.get('id') || '';
    this.loadVisitData();
  }

  async loadVisitData() {
    this.loading = true;
    try {
      this.visitData = this.getVisitFromStorage();
      
      if (this.visitData) {
        this.currentVisit = this.visitData;
        await this.loadPatientData();
      }
    } catch (error) {
      console.error('Error loading visit data:', error);
    } finally {
      this.loading = false;
    }
  }

  private getVisitFromStorage(): MedicalVisit | null {
    const storedVisit = localStorage.getItem('currentVisit');
    return storedVisit ? JSON.parse(storedVisit) : null;
  }

  private async loadPatientData() {
    if (!this.currentVisit) return;
    
    const patientId = this.extractPatientId(this.currentVisit);
    if (!patientId) return;

    try {
      this.sampleService.getSamplesByPatient(patientId).subscribe({
        next: (samples) => {
          this.patientSamples = samples.slice(0, 3);
        },
        error: (error) => console.error('Error loading samples:', error)
      });

      this.patientService.getAllVisits(patientId).subscribe({
        next: (visits) => {
          this.patientVisits = visits.slice(0, 3);
        },
        error: (error) => console.error('Error loading visits:', error)
      });
    } catch (error) {
      console.error('Error loading patient data:', error);
    }
  }

  private extractPatientId(visit: MedicalVisit): string {
    return '60ede05e-702c-442a-aba1-4507bb2fe542';
  }

  // Modal methods
  openVisitModal(visit: MedicalVisit) {
    this.selectedVisit = visit;
    this.showVisitModal = true;
  }

  openSampleModal(sample: Sample) {
    this.selectedSample = sample;
    this.showSampleModal = true;
  }

  closeModals() {
    this.showVisitModal = false;
    this.showSampleModal = false;
    this.selectedVisit = null;
    this.selectedSample = null;
  }

  onSubmitVisit() {
    if (this.visitForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting = true;
    const formData: VisitAdvanceDto = this.visitForm.value;
    formData.type = this.currentVisit?.type || 'CONSULTATION';

    this.doctorService.submitVisitAdvance(this.visitId, formData).subscribe({
      next: (response) => {
        this.consultationCompleted = true;
        this.submitting = false;
        this.showPostConsultationModal = true;
      },
      error: (error) => {
        console.error('Error submitting visit:', error);
        alert('Error al actualizar la cita');
        this.submitting = false;
      }
    });
  }

  // Nuevos métodos para el modal
  closePostConsultationModal() {
    this.showPostConsultationModal = false;
    this.router.navigate(['/doctors/dashboard']);
  }

  scheduleNewAppointment(withSameDoctor: boolean = false) {
    if (this.currentVisit) {
      const appointmentData = {
        patientId: this.extractPatientId(this.currentVisit),
        patientName: this.currentVisit.patientName,
        withSameDoctor: withSameDoctor,
        doctorId: withSameDoctor ? '00d79e66-4457-4d27-9228-fe467823ce8e' : null, // ID del doctor actual
        specialty: withSameDoctor ? this.currentVisit.medicalArea : null
      };
      
      localStorage.setItem('newAppointmentData', JSON.stringify(appointmentData));
      this.router.navigate(['/doctors/new-appointment']);
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.visitForm.controls).forEach(key => {
      this.visitForm.get(key)?.markAsTouched();
    });
  }

  toggleShowAllSamples() {
    this.showAllSamples = !this.showAllSamples;
    if (this.showAllSamples && this.currentVisit) {
      const patientId = this.extractPatientId(this.currentVisit);
      this.sampleService.getSamplesByPatient(patientId).subscribe({
        next: (samples) => {
          this.patientSamples = samples;
        }
      });
    } else {
      this.patientSamples = this.patientSamples.slice(0, 3);
    }
  }

  toggleShowAllVisits() {
    this.showAllVisits = !this.showAllVisits;
    if (this.showAllVisits && this.currentVisit) {
      const patientId = this.extractPatientId(this.currentVisit);
      this.patientService.getAllVisits(patientId).subscribe({
        next: (visits) => {
          this.patientVisits = visits;
        }
      });
    } else {
      this.patientVisits = this.patientVisits.slice(0, 3);
    }
  }

  loadAIReport() {
    if (!this.currentVisit) return;
    
    const patientId = this.extractPatientId(this.currentVisit);
    this.showAIReport = true;
    
    this.patientService.getLatestReportText(patientId).subscribe({
      next: (reportText) => {
        try {
          this.aiReport = JSON.parse(reportText);
        } catch (error) {
          console.error('Error parsing AI report:', error);
        }
      },
      error: (error) => {
        console.error('Error loading AI report:', error);
      }
    });
  }

  goBack() {
    this.router.navigate(['/doctors/schedule-appointments']);
  }

  // Utility methods
  getVisitTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'CONSULTATION': 'Consulta',
      'FOLLOW_UP': 'Seguimiento',
      'SURGERY': 'Cirugía',
      'EMERGENCY': 'Emergencia',
      'OTHER': 'Otro'
    };
    return labels[type] || type;
  }

  getSampleTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'BLOOD': 'Sangre',
      'URINE': 'Orina',
      'SALIVA': 'Saliva',
      'TISSUE': 'Tejido',
      'OTHER': 'Otro'
    };
    return labels[type] || type;
  }

  getSampleStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'Pendiente',
      'IN_PROGRESS': 'En Proceso',
      'COMPLETED': 'Completado',
      'CANCELLED': 'Cancelado'
    };
    return labels[status] || status;
  }

  getSampleStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-700',
      'IN_PROGRESS': 'bg-blue-100 text-blue-700',
      'COMPLETED': 'bg-green-100 text-green-700',
      'CANCELLED': 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.visitForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.visitForm.get(fieldName);
    if (field?.errors?.['required']) {
      return `${fieldName} es requerido`;
    }
    if (field?.errors?.['minlength']) {
      return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    }
    return '';
  }
}