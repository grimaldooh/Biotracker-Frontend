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
  
  loading = true;
  submitting = false;
  showAllSamples = false;
  showAllVisits = false;
  showAIReport = false;
  
  visitId: string = '';

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
      // Cargar datos de la cita actual (desde el localStorage o servicio)
      const visitData = this.getVisitFromStorage();
      if (visitData) {
        this.currentVisit = visitData;
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
      // Cargar muestras del paciente
      this.sampleService.getSamplesByPatient(patientId).subscribe({
        next: (samples) => {
          this.patientSamples = samples.slice(0, 3); // Solo primeros 3
        },
        error: (error) => console.error('Error loading samples:', error)
      });

      // Cargar historial de visitas
      this.patientService.getAllVisits(patientId).subscribe({
        next: (visits) => {
          this.patientVisits = visits.slice(0, 3); // Solo primeras 3
        },
        error: (error) => console.error('Error loading visits:', error)
      });
    } catch (error) {
      console.error('Error loading patient data:', error);
    }
  }

  private extractPatientId(visit: MedicalVisit): string {
    // Extraer patientId de la visita - esto dependerá de tu estructura de datos
    // Por ahora uso un ID fijo, pero deberías obtenerlo de la visita
    return '95f34129-c894-4574-8914-be012053e7c7';
  }

  onSubmitVisit() {
    if (this.visitForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting = true;
    const formData: VisitAdvanceDto = this.visitForm.value;

    this.doctorService.submitVisitAdvance(this.visitId, formData).subscribe({
      next: (response) => {
        // Éxito - mostrar mensaje y redirigir
        alert('Cita actualizada exitosamente');
        this.router.navigate(['/doctors/schedule-appointments']);
      },
      error: (error) => {
        console.error('Error submitting visit:', error);
        alert('Error al actualizar la cita');
        this.submitting = false;
      }
    });
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