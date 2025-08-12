import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SampleService } from '../../../core/services/sample.service';
import { AuthService } from '../../../shared/services/auth.service';

interface Mutation {
  id: string;
  gene: string;
  chromosome: string;
  type: string;
  relevance: string;
  comment: string;
  geneticSampleId: string;
}

interface GeneticSample {
  id: string;
  patientId: string;
  registeredById: string;
  type: string;
  status: string;
  medicalEntityId: string;
  collectionDate: string;
  notes: string;
  createdAt: string;
  mutations: Mutation[];
  confidenceScore: number;
  processingSoftware: string;
  referenceGenome: string;
  mutationCount: number;
}

interface GeneticReport {
  reportId: string;
  geneticSample: {
    id: string;
    type: string;
    status: string;
    medicalEntityId: string;
    collectionDate: string;
    notes: string;
    createdAt: string;
    confidenceScore: number;
    processingSoftware: string;
    referenceGenome: string;
  };
  sample: any;
  s3Url: string;
  s3UrlPatient: string | null;
}

@Component({
  selector: 'app-genetic-tests',
  standalone: true,
  templateUrl: './genetic-tests.component.html',
  styleUrl: './genetic-tests.component.css',
  imports: [CommonModule, FormsModule]
})
export class GeneticTestsComponent implements OnInit {
  loading = true;
  error = '';
  geneticSamples: GeneticSample[] = [];
  geneticReports: GeneticReport[] = [];
  selectedSample: GeneticSample | null = null;
  showDetailModal = false;
  
  patientId = '60ede05e-702c-442a-aba1-4507bb2fe542';

  // Filtros
  selectedType = 'ALL';
  selectedRelevance = 'ALL';
  searchTerm = '';

  constructor(
    private http: HttpClient,
    private sampleService: SampleService,
    private authService : AuthService
  ) {this.patientId = this.authService.getCurrentUserId() || ''; }

  ngOnInit() {
    this.loadGeneticSamples();
    this.loadGeneticReports();
  }

  loadGeneticSamples() {
    this.http.get<GeneticSample[]>(`http://localhost:8080/api/genetic-samples/patient/${this.patientId}`)
      .subscribe({
        next: (samples) => {
          this.geneticSamples = samples.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          this.loading = false;
        },
        error: () => {
          this.error = 'No se pudieron cargar las pruebas genéticas.';
          this.loading = false;
        }
      });
  }

  loadGeneticReports() {
    this.sampleService.getGeneticReports(this.patientId).subscribe({
      next: (reports) => {
        this.geneticReports = reports;
      },
      error: (error) => {
        console.error('Error loading genetic reports:', error);
      }
    });
  }

  getReportsForSample(sampleId: string): GeneticReport[] {
    return this.geneticReports.filter(report => report.geneticSample.id === sampleId);
  }

  hasTechnicalReport(sampleId: string): boolean {
    const reports = this.getReportsForSample(sampleId);
    return reports.some(report => report.s3Url);
  }

  hasPatientFriendlyReport(sampleId: string): boolean {
    const reports = this.getReportsForSample(sampleId);
    return reports.some(report => report.s3UrlPatient);
  }

  openTechnicalReport(sampleId: string) {
    const reports = this.getReportsForSample(sampleId);
    const reportWithTechnical = reports.find(report => report.s3Url);
    
    if (reportWithTechnical) {
      // Navegar al componente de reporte técnico
      window.open(`/patient/genetic-report?url=${encodeURIComponent(reportWithTechnical.s3Url)}&type=technical`, '_blank');
    }
  }

  openPatientFriendlyReport(sampleId: string) {
    const reports = this.getReportsForSample(sampleId);
    const reportWithPatient = reports.find(report => report.s3UrlPatient);
    
    if (reportWithPatient) {
      // Navegar al componente de reporte amigable
      window.open(`/patient/genetic-report?url=${encodeURIComponent(reportWithPatient.s3UrlPatient!)}&type=patient`, '_blank');
    }
  }

  getFilteredSamples(): GeneticSample[] {
    return this.geneticSamples.filter(sample => {
      const matchesType = this.selectedType === 'ALL' || sample.type === this.selectedType;
      const matchesSearch = this.searchTerm === '' || 
        sample.notes.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        sample.mutations.some(m => m.gene.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      return matchesType && matchesSearch;
    });
  }

  getHighRelevanceMutations(sample: GeneticSample): Mutation[] {
    return sample.mutations.filter(m => m.relevance === 'HIGH');
  }

  getHighRiskSampleCount(): number {
    return this.getFilteredSamples().filter(s => s.mutations.some(m => m.relevance === 'HIGH')).length;
  }

  getMutationsByRelevance(sample: GeneticSample): { [key: string]: Mutation[] } {
    const grouped = sample.mutations.reduce((acc, mutation) => {
      if (!acc[mutation.relevance]) {
        acc[mutation.relevance] = [];
      }
      acc[mutation.relevance].push(mutation);
      return acc;
    }, {} as { [key: string]: Mutation[] });

    return grouped;
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'DNA': 'Análisis de ADN',
      'MUTATIONS': 'Análisis de Mutaciones',
      'GENOMIC': 'Análisis Genómico'
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

  getRelevanceStyle(relevance: string): string {
    switch (relevance) {
      case 'HIGH':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LOW':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  }

  getMutationTypeIcon(type: string): string {
    switch (type) {
      case 'SNV':
        return 'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z';
      case 'DELETION':
        return 'M19,13H5V11H19V13Z';
      case 'INSERTION':
        return 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z';
      case 'DUPLICATION':
        return 'M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z';
      default:
        return 'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2';
    }
  }

  getConfidenceColor(score: number): string {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 70) return 'text-amber-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  }

  openSampleDetail(sample: GeneticSample) {
    this.selectedSample = sample;
    this.showDetailModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.showDetailModal = false;
    this.selectedSample = null;
    document.body.style.overflow = 'auto';
  }

  getUniqueGenes(sample: GeneticSample): string[] {
    return [...new Set(sample.mutations.map(m => m.gene))];
  }

  getUniqueChromosomes(sample: GeneticSample): string[] {
    return [...new Set(sample.mutations.map(m => m.chromosome))].sort((a, b) => {
      const aNum = parseInt(a);
      const bNum = parseInt(b);
      if (isNaN(aNum) || isNaN(bNum)) return a.localeCompare(b);
      return aNum - bNum;
    });
  }
}