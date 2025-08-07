import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorService, MedicalVisit, VisitAdvanceDto } from '../../../core/services/doctors.service';
import { PatientService } from '../../../core/services/patient.service';
import { SampleService } from '../../../core/services/sample.service';
import { Sample, StudyReport } from '../../../core/interfaces/sample.interface'; // Removemos AIReport de aquí
import { HttpClient } from '@angular/common/http';

interface Medication {
  id: string;
  name: string;
  brand: string;
  activeSubstance: string;
  indication: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedById: string;
  prescribedBy: string;
  isActive: boolean;
}

interface MedicationOperation {
  operation: 'ADD' | 'REMOVE';
  medicationId?: string; // Para REMOVE
  name?: string; // Para ADD
  brand?: string;
  activeSubstance?: string;
  indication?: string;
  dosage?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
  prescribedById?: string;
}

interface MedicationUpdateRequest {
  operations: MedicationOperation[];
}

interface Patient {
  nombre: string;
  fechaNacimiento: string;
  curp: string;
}

interface HistorialMedico {
  fechaVisita: string;
  diagnostico: string | null;
  recomendaciones: string[] | null;
  notas: string;
}

interface ReporteEstudio {
  fechaEstudio: string;
  tipoMuestra: string;
  idMuestra: string;
  modeloAnalizador: string;
  hallazgosPrincipales: string;
}

interface EvidenciaRespaldo {
  enfermedad: string;
  idMuestraRespaldo: string;
  hallazgoEspecifico: string;
}

interface PatronIdentificado {
  patron: string;
  evidenciaRespaldo: Array<{
    idMuestra: string;
    hallazgo: string;
  }>;
  fechasRelevantes: string[];
}

interface HallazgoNoExplicado {
  hallazgo: string;
  idMuestra: string | null;
  recomendacionInvestigacion: string;
}

interface CorrelacionesClinicas {
  analisisProgresion: string;
  patronesIdentificados: PatronIdentificado[];
  hallazgosNoExplicados: HallazgoNoExplicado[];
}

interface TrazabilidadEvidencia {
  muestrasAnalizadas: string[];
  visitasMedicasReferenciadas: string[];
  nivelConfianzaResumen: string;
}

interface Resumen {
  texto: string;
  enfermedadesDetectadas: string[];
  evidenciaRespalda: EvidenciaRespaldo[];
}

interface ReporteMedico {
  paciente: Patient;
  historialMedico: HistorialMedico[];
  reportesEstudiosRecientes: ReporteEstudio[];
  resumen: Resumen;
  recomendaciones: string[];
  correlacionesClinitas: CorrelacionesClinicas;
  trazabilidadEvidencia: TrazabilidadEvidencia;
}

// Esta es la interfaz que necesitas, definida localmente
interface AIReport {
  reporteMedico: ReporteMedico;
}

@Component({
  selector: 'app-visit-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './visit-management.component.html',
})
export class VisitManagementComponent implements OnInit {
  visitForm: FormGroup;
  medicationForm: FormGroup;
  currentVisit: MedicalVisit | null = null;
  patientSamples: Sample[] = [];
  patientVisits: MedicalVisit[] = [];
  patientMedications: Medication[] = [];
  aiReport: AIReport | null = null; // Ahora usa la interfaz local
  
  // Modal states
  showVisitModal = false;
  showSampleModal = false;
  showMedicationModal = false;
  selectedVisit: MedicalVisit | null = null;
  selectedSample: Sample | null = null;
  
  loading = true;
  submitting = false;
  medicationLoading = false;
  medicationSubmitting = false;
  showAllSamples = false;
  showAllVisits = false;
  showAllMedications = false;
  showAIReport = false;
  
  visitId: string = '';
  visitData: MedicalVisit | null = null;

  // Nuevas propiedades para el modal
  showPostConsultationModal = false;
  consultationCompleted = false;

  // Medicamentos a agregar y remover
  medicationsToAdd: MedicationOperation[] = [];
  medicationsToRemove: string[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService,
    private patientService: PatientService,
    private sampleService: SampleService,
    private http: HttpClient
  ) {
    this.visitForm = this.fb.group({
      notes: ['', [Validators.required, Validators.minLength(10)]],
      diagnosis: ['', [Validators.required, Validators.minLength(5)]],
      recommendations: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.medicationForm = this.fb.group({
      name: ['', Validators.required],
      brand: ['', Validators.required],
      activeSubstance: ['', Validators.required],
      indication: ['', Validators.required],
      dosage: ['', Validators.required],
      frequency: ['', Validators.required],
      startDate: [new Date().toISOString().split('T')[0], Validators.required],
      endDate: ['']
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
      // Cargar muestras
      this.sampleService.getSamplesByPatient(patientId).subscribe({
        next: (samples) => {
          this.patientSamples = samples.slice(0, 3);
        },
        error: (error) => console.error('Error loading samples:', error)
      });

      // Cargar visitas
      this.patientService.getAllVisits(patientId).subscribe({
        next: (visits) => {
          this.patientVisits = visits.slice(0, 3);
        },
        error: (error) => console.error('Error loading visits:', error)
      });

      // Cargar medicamentos
      this.loadPatientMedications(patientId);
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

  openFullAIReport() {
    if (this.aiReport) {
      // Guardar el reporte en sessionStorage
      sessionStorage.setItem('currentAIReport', JSON.stringify(this.aiReport));
      
      // Abrir en nueva ventana/pestaña
      window.open('/doctors/ai-report', '_blank');
    }
  }

  goBack() {
    this.router.navigate(['/doctors/schedule-appointments']);
  }

  // ========== MÉTODOS DE MEDICAMENTOS ==========

  loadPatientMedications(patientId: string) {
    this.medicationLoading = true;
    
    this.http.get<Medication[]>(`http://localhost:8080/api/medications/patient/${patientId}`)
      .subscribe({
        next: (medications) => {
          this.patientMedications = this.showAllMedications ? medications : medications.slice(0, 3);
          this.medicationLoading = false;
        },
        error: (error) => {
          console.error('Error loading medications:', error);
          this.medicationLoading = false;
        }
      });
  }

  openMedicationModal() {
    this.showMedicationModal = true;
    this.medicationForm.reset({
      startDate: new Date().toISOString().split('T')[0]
    });
  }

  closeMedicationModal() {
    this.showMedicationModal = false;
    this.medicationForm.reset();
  }

  addMedicationToList() {
    if (this.medicationForm.invalid) {
      this.markMedicationFormTouched();
      return;
    }

    const formValue = this.medicationForm.value;
    const newMedication: MedicationOperation = {
      operation: 'ADD',
      name: formValue.name,
      brand: formValue.brand,
      activeSubstance: formValue.activeSubstance,
      indication: formValue.indication,
      dosage: formValue.dosage,
      frequency: formValue.frequency,
      startDate: formValue.startDate,
      endDate: formValue.endDate || undefined,
      prescribedById: 'c332337f-ea0f-48b1-a1a6-9dac44364343' // ID del doctor actual
    };

    this.medicationsToAdd.push(newMedication);
    this.closeMedicationModal();
  }

  removeMedicationFromList(medicationId: string) {
    if (confirm('¿Está seguro de que desea remover este medicamento?')) {
      this.medicationsToRemove.push(medicationId);
      
      // Remover visualmente de la lista actual
      this.patientMedications = this.patientMedications.filter(med => med.id !== medicationId);
    }
  }

  removePendingMedication(index: number) {
    this.medicationsToAdd.splice(index, 1);
  }

  undoRemoveMedication(medicationId: string) {
    this.medicationsToRemove = this.medicationsToRemove.filter(id => id !== medicationId);
    
    // Recargar medicamentos para mostrar el que se "deshizo"
    if (this.currentVisit) {
      const patientId = this.extractPatientId(this.currentVisit);
      this.loadPatientMedications(patientId);
    }
  }

  submitMedicationChanges() {
    if (this.medicationsToAdd.length === 0 && this.medicationsToRemove.length === 0) {
      alert('No hay cambios en medicamentos para enviar');
      return;
    }

    if (!this.currentVisit) return;

    this.medicationSubmitting = true;
    const patientId = this.extractPatientId(this.currentVisit);

    // Crear las operaciones
    const operations: MedicationOperation[] = [
      ...this.medicationsToAdd,
      ...this.medicationsToRemove.map(id => ({
        operation: 'REMOVE' as const,
        medicationId: id
      }))
    ];

    const request: MedicationUpdateRequest = { operations };

    this.http.patch(`http://localhost:8080/api/medications/patient/${patientId}`, request)
      .subscribe({
        next: (response) => {
          console.log('Medications updated successfully:', response);
          alert('Medicamentos actualizados exitosamente');
          
          // Limpiar las listas de cambios pendientes
          this.medicationsToAdd = [];
          this.medicationsToRemove = [];
          
          // Recargar la lista de medicamentos
          this.loadPatientMedications(patientId);
          
          this.medicationSubmitting = false;
        },
        error: (error) => {
          console.error('Error updating medications:', error);
          alert('Error al actualizar medicamentos');
          this.medicationSubmitting = false;
        }
      });
  }

  toggleShowAllMedications() {
    this.showAllMedications = !this.showAllMedications;
    if (this.showAllMedications && this.currentVisit) {
      const patientId = this.extractPatientId(this.currentVisit);
      this.loadPatientMedications(patientId);
    } else {
      this.patientMedications = this.patientMedications.slice(0, 3);
    }
  }

  private markMedicationFormTouched() {
    Object.keys(this.medicationForm.controls).forEach(key => {
      this.medicationForm.get(key)?.markAsTouched();
    });
  }

  isMedicationFieldInvalid(fieldName: string): boolean {
    const field = this.medicationForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getMedicationFieldError(fieldName: string): string {
    const field = this.medicationForm.get(fieldName);
    if (field?.errors?.['required']) {
      return `${fieldName} es requerido`;
    }
    return '';
  }

  isMedicationMarkedForRemoval(medicationId: string): boolean {
    return this.medicationsToRemove.includes(medicationId);
  }

  // Método helper para obtener evidencia de una condición específica
  getEvidenciaForCondition(condition: string): EvidenciaRespaldo[] {
    if (!this.aiReport?.reporteMedico?.resumen?.evidenciaRespalda) {
      return [];
    }
    
    return this.aiReport.reporteMedico.resumen.evidenciaRespalda.filter(
      evidencia => evidencia.enfermedad === condition
    );
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

  getCurrentDate(): Date {
    return new Date();
  }
}