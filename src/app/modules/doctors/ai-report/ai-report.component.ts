import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

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

interface AIReport {
  reporteMedico: ReporteMedico;
}


@Component({
  selector: 'app-ai-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-report.component.html',
})
export class AiReportComponent implements OnInit {
  aiReport: AIReport | null = null;
  loading = true;
  public now: Date = new Date();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit() {
    this.loadReportData();
  }

  private loadReportData() {
    // Obtener el reporte desde sessionStorage o localStorage
    const reportData = sessionStorage.getItem('currentAIReport');
    if (reportData) {
      this.aiReport = JSON.parse(reportData);
    }
    this.loading = false;
  }

  goBack() {
    this.location.back();
  }

  getEvidenciaForCondition(condition: string): EvidenciaRespaldo[] {
    if (!this.aiReport?.reporteMedico?.resumen?.evidenciaRespalda) {
      return [];
    }
    
    return this.aiReport.reporteMedico.resumen.evidenciaRespalda.filter(
      evidencia => evidencia.enfermedad === condition
    );
  }

  getSampleTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
      'BLOOD': 'Sangre',
      'DNA': 'ADN',
      'SALIVA': 'Saliva',
      'MUTATIONS': 'Mutaciones'
    };
    return types[type] || type;
  }

  openSampleDetail(sampleId: string) {
    // Aquí implementarías la lógica para abrir el detalle de la muestra
    // Por ahora, guardamos el ID en sessionStorage y navegamos
    sessionStorage.setItem('selectedSampleId', sampleId);
    // Podrías abrir un modal o navegar a otra página
    console.log('Opening sample detail for:', sampleId);
  }

  printReport() {
    window.print();
  }

  exportReport() {
    // Implementar exportación del reporte
    console.log('Exporting report...');
  }
}