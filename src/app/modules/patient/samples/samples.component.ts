import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SampleService } from '../../../core/services/sample.service';
import { StatusColorPipe } from '../../../core/pipes/status-color.pipe'; // Ajusta la ruta
import { PatientReport, ReportsService } from '../../../core/services/reports.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-patient-samples',
  standalone: true,
  templateUrl: './samples.component.html',
  styleUrl: './samples.component.css',
  imports: [CommonModule, StatusColorPipe]
})
export class SamplesComponent implements OnInit {
  samples: any[] = [];
  loading = true;
  selectedSample: any = null;
  reports : PatientReport[] = [];
  patientId: string = 'default-patient-id'; // Valor por defecto


  constructor(
    private sampleService: SampleService,
    private reportsService: ReportsService,
    private router: Router,
    private authService: AuthService 
  ) {
    // Obtén el patientId dinámicamente del usuario autenticado
    this.patientId = this.authService.getCurrentUserId() || this.patientId;
  }
  
  ngOnInit(): void {
    this.loadSamples();
    this.loadReports();
  }

  loadSamples() {
    this.loading = true;
    this.sampleService.getSamplesByPatient(this.patientId).subscribe({
      next: (data) => {
        this.samples = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

   loadReports(): void {
    this.reportsService.getPatientReports(this.patientId).subscribe({
      next: (reports) => {
        this.reports = reports;
      },
      error: () => {
        console.error('Error loading reports');
      }
    });
  }

  showDetails(sample: any) {
    this.selectedSample = sample;
  }

  closeModal() {
    this.selectedSample = null;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'COMPLETED':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'PROCESSING':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  }

  getReportForSample(sampleId: string): PatientReport | undefined {
    return this.reports.find(report => report.sampleId === sampleId);
  }

  hasPatientFriendlyReport(sampleId: string): boolean {
    const report = this.getReportForSample(sampleId);
    return !!(report?.s3UrlPatient);
  }

  hasMedicalReport(sampleId: string): boolean {
    const report = this.getReportForSample(sampleId);
    return !!(report?.s3Url);
  }

  viewPatientReport(sampleId: string): void {
    const report = this.getReportForSample(sampleId);
    if (report?.s3UrlPatient) {
      this.router.navigate(['/patient/report'], {
        queryParams: {
          sampleId: sampleId,
          s3Url: report.s3UrlPatient,
          isPatientFriendly: 'true'
        }
      });
    }
  }

  viewMedicalReport(sampleId: string): void {
    const report = this.getReportForSample(sampleId);
    if (report?.s3Url) {
      this.router.navigate(['/patient/report'], {
        queryParams: {
          sampleId: sampleId,
          s3Url: report.s3Url,
          isPatientFriendly: 'false'
        }
      });
    }
  }

// Métodos para parsear los enums y mejorar la UI

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

getStatusLabel(status: string): string {
  const labels: { [key: string]: string } = {
    'PENDING': 'Pendiente',
    'IN_ANALYSIS': 'En Análisis',
    'COMPLETED': 'Completado'
  };
  return labels[status] || status;
}

getStatusStyle(status: string): string {
  const styles: { [key: string]: string } = {
    'PENDING': 'bg-amber-100 text-amber-800 border-amber-200',
    'IN_ANALYSIS': 'bg-blue-100 text-blue-800 border-blue-200',
    'COMPLETED': 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };
  return styles[status] || 'bg-slate-100 text-slate-800 border-slate-200';
}

getSampleTypeIcon(type: string): { icon: string, bgColor: string, textColor: string } {
  const icons: { [key: string]: { icon: string, bgColor: string, textColor: string } } = {
    'BLOOD': {
      icon: 'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600'
    },
    'DNA': {
      icon: 'M4,2H20A2,2 0 0,1 22,4V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V4A2,2 0 0,1 4,2M4,4V20H20V4H4M6,6H18V8H6V6M6,10H18V12H6V10M6,14H18V16H6V14M6,18H18V20H6V18Z',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
    'TISSUE': {
      icon: 'M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600'
    },
    'SALIVA': {
      icon: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z',
      bgColor: 'bg-cyan-100',
      textColor: 'text-cyan-600'
    },
    'URINE': {
      icon: 'M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600'
    },
    'MUTATIONS': {
      icon: 'M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-600'
    }
  };
  return icons[type] || {
    icon: 'M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-600'
  };
}

// Método para parsear y organizar los datos de análisis de sangre
getBloodDataSections(bloodData: any): any[] {
  if (!bloodData) return [];

  const sections = [
    {
      title: 'Química Sanguínea',
      icon: 'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      fields: [
        { key: 'glucoseMgDl', label: 'Glucosa', unit: 'mg/dL', normalRange: '70-100' },
        { key: 'cholesterolTotalMgDl', label: 'Colesterol Total', unit: 'mg/dL', normalRange: '<200' },
        { key: 'cholesterolHdlMgDl', label: 'Colesterol HDL (Bueno)', unit: 'mg/dL', normalRange: '>40 (H), >50 (M)' },
        { key: 'cholesterolLdlMgDl', label: 'Colesterol LDL (Malo)', unit: 'mg/dL', normalRange: '<100' },
        { key: 'triglyceridesMgDl', label: 'Triglicéridos', unit: 'mg/dL', normalRange: '<150' }
      ]
    },
    {
      title: 'Función Renal',
      icon: 'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      fields: [
        { key: 'creatinineMgDl', label: 'Creatinina', unit: 'mg/dL', normalRange: '0.6-1.3' },
        { key: 'ureaMgDl', label: 'Urea', unit: 'mg/dL', normalRange: '7-20' },
        { key: 'bunMgDl', label: 'BUN (Nitrógeno Ureico)', unit: 'mg/dL', normalRange: '7-20' },
        { key: 'gfrMlMin', label: 'Tasa de Filtración Glomerular', unit: 'mL/min', normalRange: '>60' }
      ]
    },
    {
      title: 'Hematología',
      icon: 'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      fields: [
        { key: 'hemoglobinGDl', label: 'Hemoglobina', unit: 'g/dL', normalRange: '12-17' },
        { key: 'hematocritPercent', label: 'Hematocrito', unit: '%', normalRange: '36-50' },
        { key: 'redBloodCellsMillionUl', label: 'Glóbulos Rojos', unit: 'mill/μL', normalRange: '4.2-5.8' },
        { key: 'whiteBloodCellsThousandUl', label: 'Glóbulos Blancos', unit: 'K/μL', normalRange: '4.5-11.0' },
        { key: 'plateletsThousandUl', label: 'Plaquetas', unit: 'K/μL', normalRange: '150-450' }
      ]
    },
    {
      title: 'Función Hepática',
      icon: 'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
      fields: [
        { key: 'altSgptUL', label: 'ALT (SGPT)', unit: 'U/L', normalRange: '7-35' },
        { key: 'astSgotUL', label: 'AST (SGOT)', unit: 'U/L', normalRange: '8-40' },
        { key: 'bilirubinTotalMgDl', label: 'Bilirrubina Total', unit: 'mg/dL', normalRange: '0.2-1.2' },
        { key: 'alkalinePhosphataseUL', label: 'Fosfatasa Alcalina', unit: 'U/L', normalRange: '44-147' }
      ]
    },
    {
      title: 'Proteínas',
      icon: 'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
      fields: [
        { key: 'totalProteinGDl', label: 'Proteína Total', unit: 'g/dL', normalRange: '6.0-8.3' },
        { key: 'albuminGDl', label: 'Albúmina', unit: 'g/dL', normalRange: '3.5-5.0' }
      ]
    },
    {
      title: 'Electrolitos',
      icon: 'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      textColor: 'text-cyan-700',
      fields: [
        { key: 'sodiumMeqL', label: 'Sodio', unit: 'mEq/L', normalRange: '136-145' },
        { key: 'potassiumMeqL', label: 'Potasio', unit: 'mEq/L', normalRange: '3.5-5.0' },
        { key: 'chlorideMeqL', label: 'Cloruro', unit: 'mEq/L', normalRange: '98-107' }
      ]
    },
    {
      title: 'Marcadores Inflamatorios',
      icon: 'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      fields: [
        { key: 'cReactiveProteinMgL', label: 'Proteína C Reactiva', unit: 'mg/L', normalRange: '<3.0' },
        { key: 'esrMmHr', label: 'Velocidad de Sedimentación', unit: 'mm/hr', normalRange: '<15' }
      ]
    },
    {
      title: 'Análisis Genético',
      icon: 'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      textColor: 'text-indigo-700',
      fields: [
        { key: 'geneticMarkersDetected', label: 'Marcadores Genéticos Detectados', unit: '', normalRange: 'Variable' },
        { key: 'geneticQualityScore', label: 'Puntuación de Calidad Genética', unit: '%', normalRange: '>95' }
      ]
    }
  ];

  // Filtrar solo las secciones que tienen datos
  return sections.filter(section => 
    section.fields.some(field => bloodData[field.key] !== undefined && bloodData[field.key] !== null)
  ).map(section => ({
    ...section,
    fields: section.fields.filter(field => 
      bloodData[field.key] !== undefined && bloodData[field.key] !== null
    ).map(field => ({
      ...field,
      value: bloodData[field.key]
    }))
  }));
}

// Método para determinar si un valor está dentro del rango normal (simplificado)
isValueNormal(value: number, normalRange: string): 'normal' | 'high' | 'low' | 'unknown' {
  // Esta es una implementación simplificada
  // En un caso real, necesitarías parsing más sofisticado de los rangos
  if (!value || !normalRange) return 'unknown';
  
  // Ejemplo básico para algunos rangos
  if (normalRange.includes('<')) {
    const limit = parseFloat(normalRange.replace('<', ''));
    return value <= limit ? 'normal' : 'high';
  }
  
  if (normalRange.includes('>')) {
    const limit = parseFloat(normalRange.replace('>', ''));
    return value >= limit ? 'normal' : 'low';
  }
  
  if (normalRange.includes('-')) {
    const [min, max] = normalRange.split('-').map(v => parseFloat(v));
    if (value < min) return 'low';
    if (value > max) return 'high';
    return 'normal';
  }
  
  return 'unknown';
}

getValueStatusStyle(status: 'normal' | 'high' | 'low' | 'unknown'): string {
  switch (status) {
    case 'normal':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'high':
      return 'text-red-700 bg-red-50 border-red-200';
    case 'low':
      return 'text-blue-700 bg-blue-50 border-blue-200';
    default:
      return 'text-slate-700 bg-slate-50 border-slate-200';
  }
}

getValueStatusIcon(status: 'normal' | 'high' | 'low' | 'unknown'): string {
  switch (status) {
    case 'normal':
      return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
    case 'high':
      return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
    case 'low':
      return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    default:
      return 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
  }
}
}
