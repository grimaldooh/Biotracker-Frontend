import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../../core/services/patient.service';
import { SampleService } from '../../../core/services/sample.service';
import { AuthService } from '../../../shared/services/auth.service';
import { CommonModule } from '@angular/common';
import { SampleDetailModalComponent } from '../../samples/sample-detail-modal/sample-detail-modal.component';

interface PatientInfo {
  nombre: string;
  fechaNacimiento: string;
  curp: string;
}

interface MedicalVisit {
  fechaVisita: string;
  diagnostico: string | null;
  recomendaciones: string[] | null;
  notas: string;
}

interface StudyReport {
  fechaEstudio: string;
  tipoMuestra: string;
  idMuestra: string;
  modeloAnalizador: string;
  hallazgosPrincipales: string;
}

interface Evidence {
  enfermedad: string;
  idMuestraRespaldo: string;
  hallazgoEspecifico: string;
}

interface Summary {
  texto: string;
  enfermedadesDetectadas: string[];
  evidenciaRespalda: Evidence[];
}

interface PatternEvidence {
  idMuestra: string;
  hallazgo: string;
}

interface IdentifiedPattern {
  patron: string;
  evidenciaRespaldo: PatternEvidence[];
  fechasRelevantes: string[];
}

interface UnexplainedFinding {
  hallazgo: string;
  idMuestra: string;
  recomendacionInvestigacion: string;
}

interface ClinicalCorrelations {
  analisisProgresion: string;
  patronesIdentificados: IdentifiedPattern[];
  hallazgosNoExplicados: UnexplainedFinding[];
}

interface EvidenceTraceability {
  muestrasAnalizadas: string[];
  visitasMedicasReferenciadas: string[];
  nivelConfianzaResumen: string;
}

interface TechnicalReport {
  paciente: PatientInfo;
  historialMedico: MedicalVisit[];
  reportesEstudiosRecientes: StudyReport[];
  resumen: Summary;
  recomendaciones: string[];
  correlacionesClinitas: ClinicalCorrelations;
  trazabilidadEvidencia: EvidenceTraceability;
}

@Component({
  selector: 'app-technical-report',
  standalone: true,
  templateUrl: './technical-report.component.html',
  styleUrl: './technical-report.component.css',
  imports: [CommonModule, SampleDetailModalComponent]
})
export class TechnicalReportComponent implements OnInit {
  loading = true;
  error = '';
  report: TechnicalReport | null = null;
  noDataAvailable = false;
  
  // Modal states
  showSampleModal = false;
  selectedSample: any = null;
  
  // ID dinámico del paciente
  patientId: string | null = null;

  constructor(
    private patientService: PatientService,
    private sampleService: SampleService,
    private authService: AuthService
  ) {
    // Obtener el patientId dinámicamente del usuario autenticado
    this.patientId = this.authService.getCurrentUserId();
  }

  ngOnInit() {
    if (!this.patientId) {
      this.error = 'No se pudo obtener el ID del paciente. Inicia sesión nuevamente.';
      this.loading = false;
      return;
    }

    this.patientService.getLatestReportText(this.patientId).subscribe({
      next: (text) => {
        if (!text || text.trim() === '') {
          this.noDataAvailable = true;
        } else {
          this.parseReport(text);
        }
        this.loading = false;
      },
      error: (errorResponse) => {
        this.loading = false;
        
        // Manejo específico de errores
        if (errorResponse.status === 404 || errorResponse.status === 500) {
          this.noDataAvailable = true;
        } else if (errorResponse.status === 400 || errorResponse.status === 422) {
          this.noDataAvailable = true;
        
        } else {
          this.error = 'Error del servidor. Intenta nuevamente más tarde.';
        }
      }
    });
  }

  parseReport(text: string) {
    try {
      const json = JSON.parse(text);
      
      // Verificar si el reporte tiene la estructura válida
      if (!json.reporteMedico || 
          !json.reporteMedico.paciente || 
          !json.reporteMedico.resumen) {
        this.noDataAvailable = true;
        return;
      }
      
      this.report = json.reporteMedico;
    } catch (e) {
      console.error('Error parsing technical report:', e);
      this.noDataAvailable = true;
    }
  }

  getSampleTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'BLOOD': 'Análisis de Sangre',
      'DNA': 'Análisis de ADN',
      'TISSUE': 'Análisis de Tejido',
      'SALIVA': 'Análisis de Saliva',
      'URINE': 'Análisis de Orina',
      'MUTATIONS': 'Análisis de Mutaciones'
    };
    return labels[type] || type;
  }

  // CORREGIDO: Estados actualizados según los enums del backend
  getStatusStyle(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'IN_ANALYSIS':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'Completado';
      case 'PENDING':
        return 'Pendiente';
      case 'IN_ANALYSIS':
        return 'En Análisis';
      default:
        return status;
    }
  }

  getConfidenceLevelStyle(level: string): string {
    if (level.toLowerCase().includes('alto')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (level.toLowerCase().includes('medio')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    } else if (level.toLowerCase().includes('bajo')) {
      return 'bg-red-50 text-red-700 border-red-200';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200';
  }

  hasValidData(visit: MedicalVisit): boolean {
    return !!(visit.diagnostico || visit.notas || (visit.recomendaciones && visit.recomendaciones.length > 0));
  }

  isTestData(visit: MedicalVisit): boolean {
    const testIndicators = ['prueba', 'test', 'no tomar en cuenta', 'no tmar en cuenta'];
    const searchText = `${visit.diagnostico || ''} ${visit.notas || ''}`.toLowerCase();
    return testIndicators.some(indicator => searchText.includes(indicator));
  }

  getFilteredVisits(): MedicalVisit[] {
    if (!this.report?.historialMedico) return [];
    
    return this.report.historialMedico
      .filter(visit => this.hasValidData(visit) && !this.isTestData(visit))
      .sort((a, b) => new Date(b.fechaVisita).getTime() - new Date(a.fechaVisita).getTime());
  }

  // Método para abrir el modal de detalles de muestra
  openSampleDetail(sampleId: string) {
    console.log('Opening sample detail for:', sampleId); // Debug
    this.sampleService.getSampleById(sampleId).subscribe({
      next: s => {
        console.log('Sample loaded:', s); // Debug
        this.selectedSample = s;
        this.showSampleModal = true;
      },
      error: e => {
        console.error('Error loading sample', e);
        // Mostrar mensaje de error al usuario
        this.error = 'No se pudo cargar el detalle de la muestra.';
      }
    });
  }

  // Método para cerrar modales
  closeModals() {
    console.log('Closing modal'); // Debug
    this.showSampleModal = false;
    this.selectedSample = null;
    this.error = ''; // Limpiar errores
  }

  // Método para obtener el ID corto de la muestra para mostrar
  getShortSampleId(sampleId: string): string {
    return sampleId.substring(0, 8) + '...';
  }

  // Método para verificar si un ID de muestra es válido (formato UUID)
  isValidSampleId(sampleId: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(sampleId);
  }

  // Método para navegar a agendar cita
  scheduleAppointment(): void {
    window.location.href = '/patient/schedule';
  }

  // Método para recargar el reporte
  retryLoadReport(): void {
    this.loading = true;
    this.error = '';
    this.noDataAvailable = false;
    this.report = null;
    this.ngOnInit();
  }
}