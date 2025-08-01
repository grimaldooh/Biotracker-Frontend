import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../../core/services/patient.service';
import { CommonModule } from '@angular/common';

interface MedicalVisit {
  fechaVisita: string;
  diagnostico: string | null;
  recomendaciones: string[] | null;
  notas: string | null;
}

interface StudyReport {
  fechaEstudio: string;
  tipoMuestra: string;
  modeloAnalizador: string;
  hallazgosPrincipales: string;
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
  patientName = '';
  birthDate = '';
  curp = '';
  visits: MedicalVisit[] = [];
  studies: StudyReport[] = [];
  summaryText = '';
  detectedConditions: string[] = [];
  recommendations: string[] = [];

  patientId = '95f34129-c894-4574-8914-be012053e7c7'; // Reemplaza por el id real

  constructor(private patientService: PatientService) {}

  ngOnInit() {
    this.patientService.getLatestReportText(this.patientId).subscribe({
      next: (text) => {
        this.parseReport(text);
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el reporte.';
        this.loading = false;
      }
    });
  }

  parseReport(text: string) {
    try {
      const json = JSON.parse(text);
      const reporte = json.reporteMedico;

      // Datos paciente
      this.patientName = reporte.paciente?.nombre || '';
      this.birthDate = reporte.paciente?.fechaNacimiento || '';
      this.curp = reporte.paciente?.curp || '';

      // Historial médico
      this.visits = Array.isArray(reporte.historialMedico)
        ? (reporte.historialMedico as MedicalVisit[]).filter((v: MedicalVisit) => v.diagnostico || v.recomendaciones || v.notas)
        : [];

      // Estudios recientes
      this.studies = Array.isArray(reporte.reportesEstudiosRecientes)
        ? reporte.reportesEstudiosRecientes
        : [];

      // Resumen
      this.summaryText = reporte.resumen?.texto || '';
      this.detectedConditions = Array.isArray(reporte.resumen?.enfermedadesDetectadas)
        ? reporte.resumen.enfermedadesDetectadas
        : [];

      // Recomendaciones
      this.recommendations = Array.isArray(reporte.recomendaciones)
        ? reporte.recomendaciones
        : [];
    } catch (e) {
      this.error = 'El formato del reporte no es válido.';
    }
  }
}
