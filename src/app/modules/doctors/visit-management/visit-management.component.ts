import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorService, MedicalVisit, VisitAdvanceDto } from '../../../core/services/doctors.service';
import { PatientService } from '../../../core/services/patient.service';
import { SampleService } from '../../../core/services/sample.service';
import { Sample, StudyReport } from '../../../core/interfaces/sample.interface'; // Removemos AIReport de aquí
import { HttpClient } from '@angular/common/http';

//Modales

import { SampleDetailModalComponent } from '../../samples/sample-detail-modal/sample-detail-modal.component';

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

interface MedicationCompatibilityRequest {
  patientId: string;
  medications: Medication[];
}

interface DrugInteraction {
  interaction_type: string;
  medications_involved: string[];
  mechanism: string;
  clinical_significance: string;
  severity_level: string;
  recommendations: string;
}

interface MonitoringRecommendation {
  parameter: string;
  frequency: string;
  rationale: string;
  target_values: string;
}

interface ImmediateAction {
  priority: string;
  action: string;
  timeframe: string;
  rationale: string;
}

interface SafetyScore {
  overall_score: string;
  interaction_risk_score: string;
  appropriateness_score: string;
  monitoring_compliance_score: string;
}

interface RecommendationsSummary {
  continue_medications: string[];
  modify_medications: string[];
  discontinue_medications: string[];
  add_medications: string[];
  specialist_referral_needed: string;
}

interface AnalysisSummary {
  total_medications_analyzed: number;
  analysis_date: string;
  overall_safety_assessment: string;
  key_concerns: string;
}

interface ClinicalContextAnalysis {
  medication_appropriateness: string;
  therapeutic_gaps: string;
  polypharmacy_assessment: string;
}

interface MedicationCompatibilityReport {
  analysis_summary: AnalysisSummary;
  drug_interactions: DrugInteraction[];
  contraindications: any[];
  dosage_concerns: any[];
  clinical_context_analysis: ClinicalContextAnalysis;
  monitoring_recommendations: MonitoringRecommendation[];
  immediate_actions: ImmediateAction[];
  safety_score: SafetyScore;
  recommendations_summary: RecommendationsSummary;
  disclaimer: string;
}

interface CompatibilityResponse {
  medication_compatibility_report: MedicationCompatibilityReport;
}

@Component({
  selector: 'app-visit-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SampleDetailModalComponent],
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

  // Nuevas propiedades para análisis de compatibilidad
  showCompatibilityAnalysis = false;
  compatibilityLoading = false;
  compatibilityReport: CompatibilityResponse | null = null;

  // Nueva propiedad para almacenar TODOS los medicamentos
  allPatientMedications: Medication[] = [];

  // Nueva propiedad para el ID del doctor actual
  currentDoctorId: string = '';

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

    // Obtener doctorId dinámico
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentDoctorId = user.userId || user.id || '';
      } catch {
        this.currentDoctorId = '';
      }
    }
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

  // CORREGIR: Cargar TODOS los medicamentos desde el inicio
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

      // CORREGIR: Cargar TODOS los medicamentos desde el inicio
      this.loadAllPatientMedications(patientId);
    } catch (error) {
      console.error('Error loading patient data:', error);
    }
  }

  // NUEVO MÉTODO: Cargar TODOS los medicamentos
  loadAllPatientMedications(patientId: string) {
    this.medicationLoading = true;
    
    this.http.get<Medication[]>(`http://localhost:8080/api/medications/patient/${patientId}`)
      .subscribe({
        next: (medications) => {
          // Guardar TODOS los medicamentos
          this.allPatientMedications = medications;
          // Mostrar solo los primeros 3 en la UI
          this.patientMedications = this.showAllMedications ? medications : medications.slice(0, 3);
          this.medicationLoading = false;
        },
        error: (error) => {
          console.error('Error loading medications:', error);
          this.medicationLoading = false;
        }
      });
  }

  // CORREGIR: Usar allPatientMedications en lugar de patientMedications
  loadPatientMedications(patientId: string) {
    this.medicationLoading = true;
    
    this.http.get<Medication[]>(`http://localhost:8080/api/medications/patient/${patientId}`)
      .subscribe({
        next: (medications) => {
          this.allPatientMedications = medications;
          this.patientMedications = this.showAllMedications ? medications : medications.slice(0, 3);
          this.medicationLoading = false;
        },
        error: (error) => {
          console.error('Error loading medications:', error);
          this.medicationLoading = false;
        }
      });
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
        console.log('Visit submitted successfully:', response);
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
        doctorId: withSameDoctor ? this.currentDoctorId : null, // ID del doctor actual dinámico
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

  // loadPatientMedications(patientId: string) {
  //   this.medicationLoading = true;
    
  //   this.http.get<Medication[]>(`http://localhost:8080/api/medications/patient/${patientId}`)
  //     .subscribe({
  //       next: (medications) => {
  //         this.allPatientMedications = medications;
  //         this.patientMedications = this.showAllMedications ? medications : medications.slice(0, 3);
  //         this.medicationLoading = false;
  //       },
  //       error: (error) => {
  //         console.error('Error loading medications:', error);
  //         this.medicationLoading = false;
  //       }
  //     });
  // }

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
      prescribedById: this.currentDoctorId // ID del doctor actual dinámico
    };

    this.medicationsToAdd.push(newMedication);
    this.closeMedicationModal();
  }

  removeMedicationFromList(medicationId: string) {
    if (confirm('¿Está seguro de que desea remover este medicamento?')) {
      this.medicationsToRemove.push(medicationId);
      
      // Actualizar AMBAS listas
      this.allPatientMedications = this.allPatientMedications.filter(med => med.id !== medicationId);
      this.patientMedications = this.patientMedications.filter(med => med.id !== medicationId);
    }
  }

  removePendingMedication(index: number) {
    this.medicationsToAdd.splice(index, 1);
  }

  undoRemoveMedication(medicationId: string) {
    this.medicationsToRemove = this.medicationsToRemove.filter(id => id !== medicationId);
    
    // Recargar TODOS los medicamentos
    if (this.currentVisit) {
      const patientId = this.extractPatientId(this.currentVisit);
      this.loadAllPatientMedications(patientId);
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
          
          this.medicationsToAdd = [];
          this.medicationsToRemove = [];
          
          // Recargar TODOS los medicamentos
          this.loadAllPatientMedications(patientId);
          
          this.medicationSubmitting = false;
        },
        error: (error) => {
          console.error('Error updating medications:', error);
          alert('Error al actualizar medicamentos');
          this.medicationSubmitting = false;
        }
      });
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

  // Método para verificar si un medicamento está marcado para ser removido
  isMedicationMarkedForRemoval(medicationId: string): boolean {
    return this.medicationsToRemove.includes(medicationId);
  }

  // CORREGIR: Método para obtener todos los medicamentos activos
  getActiveMedications(): Medication[] {
    // Usar allPatientMedications en lugar de patientMedications
    const existingMedications = this.allPatientMedications.filter(
      med => !this.isMedicationMarkedForRemoval(med.id)
    );

    // Convertir medicamentos pendientes de agregar a formato Medication
    const newMedications: Medication[] = this.medicationsToAdd.map((med, index) => ({
      id: `temp-${index}`,
      name: med.name!,
      brand: med.brand!,
      activeSubstance: med.activeSubstance!,
      indication: med.indication!,
      dosage: med.dosage!,
      frequency: med.frequency!,
      startDate: med.startDate!,
      endDate: med.endDate,
      prescribedById: med.prescribedById!,
      prescribedBy: 'Dr. Actual',
      isActive: true
    }));

    return [...existingMedications, ...newMedications];
  }

  // CORREGIR: Método para ejecutar análisis de compatibilidad SIN polling
  async runCompatibilityAnalysis() {
    if (!this.currentVisit) {
      alert('No se puede ejecutar el análisis sin información de la visita');
      return;
    }

    const activeMedications = this.getActiveMedications();
    
    if (activeMedications.length < 2) {
      alert('Se necesitan al menos 2 medicamentos para realizar el análisis de compatibilidad');
      return;
    }

    this.compatibilityLoading = true;
    this.showCompatibilityAnalysis = true;

    const patientId = this.extractPatientId(this.currentVisit);
    
    const request: MedicationCompatibilityRequest = {
      patientId: patientId,
      medications: activeMedications
    };

    try {
      console.log('Enviando solicitud de análisis de compatibilidad...');
      
      // El backend devuelve el JSON como string directamente
      const response = await this.http.post(
        'http://localhost:8080/api/medications/compatibility-analysis',
        request,
        { 
          responseType: 'text', // Importante: recibir como texto
          headers: {
            'Content-Type': 'application/json'
          }
        }
      ).toPromise();

      if (response) {
        console.log('Respuesta recibida del backend');
        
        try {
          // Parsear el JSON del string
          this.compatibilityReport = JSON.parse(response);
          this.compatibilityLoading = false;
          console.log('Reporte de compatibilidad cargado:', this.compatibilityReport);
        } catch (parseError) {
          console.error('Error parseando JSON:', parseError);
          console.log('Respuesta raw:', response);
          throw new Error('Error parseando la respuesta del servidor');
        }
      } else {
        throw new Error('No se recibió respuesta del servidor');
      }

    } catch (error) {
      console.error('Error en análisis de compatibilidad:', error);
      alert('Error al generar el análisis de compatibilidad. Por favor, intenta nuevamente.');
      this.compatibilityLoading = false;
      this.showCompatibilityAnalysis = false;
    }
  }

  // Método para cerrar el análisis de compatibilidad
  closeCompatibilityAnalysis() {
    this.showCompatibilityAnalysis = false;
    this.compatibilityReport = null;
    this.compatibilityLoading = false;
  }

  // Método para abrir reporte completo (modal o nueva ventana)
  openFullCompatibilityReport() {
    if (this.compatibilityReport) {
      // Guardar el reporte en sessionStorage para abrirlo en una nueva ventana
      sessionStorage.setItem('currentCompatibilityReport', JSON.stringify(this.compatibilityReport));
      // Por ahora, mostramos el alert de que la funcionalidad estará disponible
      alert('Funcionalidad de reporte completo disponible próximamente');
      // Alternativa: window.open('/doctors/compatibility-report', '_blank');
    }
  }

    // Método helper para obtener color de severidad
  getSeverityColor(severity: string): string {
    switch (severity?.toUpperCase()) {
      case 'HIGH':
        return 'border-red-500 bg-red-50';
      case 'MEDIUM':
        return 'border-yellow-500 bg-yellow-50';
      case 'LOW':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  }

  // Método helper para obtener color de prioridad
  getPriorityColor(priority: string): string {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  private markMedicationFormTouched() {
    Object.keys(this.medicationForm.controls).forEach(key => {
      this.medicationForm.get(key)?.markAsTouched();
    });
  }

  // AGREGAR: Métodos faltantes para validación de medicamentos
  isMedicationFieldInvalid(fieldName: string): boolean {
    const field = this.medicationForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getMedicationFieldError(fieldName: string): string {
    const field = this.medicationForm.get(fieldName);
    if (field?.errors?.['required']) {
      const fieldLabels: Record<string, string> = {
        'name': 'El nombre del medicamento',
        'brand': 'La marca',
        'activeSubstance': 'La sustancia activa',
        'indication': 'La indicación',
        'dosage': 'La dosis',
        'frequency': 'La frecuencia',
        'startDate': 'La fecha de inicio'
      };
      return `${fieldLabels[fieldName] || fieldName} es requerido`;
    }
    if (field?.errors?.['minlength']) {
      return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    }
    return '';
  }

  // CORREGIR: Método para mostrar/ocultar medicamentos en la UI
  toggleShowAllMedications() {
    this.showAllMedications = !this.showAllMedications;
    // Solo cambiar la vista, no recargar datos
    this.patientMedications = this.showAllMedications ? 
      this.allPatientMedications : 
      this.allPatientMedications.slice(0, 3);
  }

  // AGREGAR: Método faltante para abrir modal de sample
  openSampleDetail(sampleId: string) {
    this.sampleService.getSampleById(sampleId).subscribe({
      next: sample => {
        this.selectedSample = sample;
        this.showSampleModal = true;
      },
      error: err => {
        console.error('Error fetching sample', err);
      }
    });
  }
}