import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../../core/services/patient.service';
import { CommonModule } from '@angular/common';

interface PatientInfo {
  nombre: string;
  fecha_nacimiento: string;
  edad_aproximada: string;
}

interface HealthSummary {
  mensaje_principal: string;
  que_se_analizo: string;
  periodo_analizado: string;
  hallazgos_importantes: string;
}

interface RecentVisit {
  fecha: string;
  motivo_consulta: string;
  que_encontraron: string;
  recomendaciones_principales: string;
}

interface MedicalHistory {
  visitas_recientes: RecentVisit[];
  progreso_de_tu_salud: string;
}

interface StudyResult {
  fecha_estudio: string;
  tipo_estudio: string;
  que_midieron: string;
  resultados_principales: string;
  que_significa_para_ti: string;
}

interface StudyResults {
  estudios_realizados: StudyResult[];
  tendencias_importantes: string;
}

interface IdentifiedCondition {
  nombre_condicion: string;
  que_significa: string;
  como_te_afecta: string;
  evidencia_que_lo_respalda: string;
  nivel_preocupacion: string;
}

interface IdentifiedConditions {
  condiciones_actuales: IdentifiedCondition[];
  areas_de_atencion: string;
}

interface ImmediateAction {
  accion: string;
  por_que_es_importante: string;
  cuando_hacerlo: string;
}

interface LifestyleChange {
  recomendacion: string;
  beneficio_esperado: string;
  facilidad_implementacion: string;
}

interface CarePlan {
  acciones_inmediatas: ImmediateAction[];
  cambios_estilo_vida: LifestyleChange[];
  seguimiento_medico: string;
}

interface DoctorQuestions {
  preguntas_sugeridas: string[];
  temas_a_discutir: string;
}

interface SupportResources {
  mensaje_de_apoyo: string;
  proximos_pasos: string;
  cuando_buscar_ayuda: string;
}

interface ImportantNotes {
  limitaciones: string;
  actualizacion: string;
  confidencialidad: string;
}

interface PatientReport {
  informacion_paciente: PatientInfo;
  resumen_de_tu_salud: HealthSummary;
  tu_historial_medico: MedicalHistory;
  resultados_de_estudios: StudyResults;
  condiciones_identificadas: IdentifiedConditions;
  plan_de_cuidados: CarePlan;
  preguntas_para_tu_doctor: DoctorQuestions;
  apoyo_y_recursos: SupportResources;
  notas_importantes: ImportantNotes;
}

@Component({
  selector: 'app-smart-report',
  standalone: true,
  templateUrl: './smart-report.component.html',
  styleUrl: './smart-report.component.css',
  imports: [CommonModule]
})
export class SmartReportComponent implements OnInit {
  loading = true;
  error = '';
  report: PatientReport | null = null;
  
  patientId = '60ede05e-702c-442a-aba1-4507bb2fe542';

  constructor(private patientService: PatientService) {}

  ngOnInit() {
    this.patientService.getLatestReportTextPatientFriendly(this.patientId).subscribe({
      next: (text) => {
        this.parseReport(text);
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el reporte de salud.';
        this.loading = false;
      }
    });
  }

  parseReport(text: string) {
    try {
      const json = JSON.parse(text);
      this.report = json.resumen_clinico_paciente;
    } catch (e) {
      this.error = 'El formato del reporte no es válido.';
    }
  }

  getConcernLevelStyle(level: string): string {
    switch (level.toLowerCase()) {
      case 'bajo':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'medio':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'alto':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  }

  getImplementationDifficultyStyle(difficulty: string): string {
    switch (difficulty.toLowerCase()) {
      case 'fácil':
        return 'bg-emerald-50 text-emerald-700';
      case 'moderado':
        return 'bg-amber-50 text-amber-700';
      case 'difícil':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-slate-50 text-slate-700';
    }
  }
}
