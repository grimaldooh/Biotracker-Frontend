import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SampleService } from '../../../core/services/sample.service';

@Component({
  selector: 'app-genetic-report-viewer',
  standalone: true,
  templateUrl: './genetic-report-viewer.component.html',
  styleUrl: './genetic-report-viewer.component.css',
  imports: [CommonModule]
})
export class GeneticReportViewerComponent implements OnInit {
  loading = true;
  error = '';
  reportData: any = null;
  reportType: 'technical' | 'patient' = 'technical';
  s3Url = '';

  constructor(
    private route: ActivatedRoute,
    private sampleService: SampleService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.s3Url = params['url'];
      this.reportType = params['type'] || 'technical';
      
      if (this.s3Url) {
        this.loadReport();
      } else {
        this.error = 'URL del reporte no proporcionada';
        this.loading = false;
      }
    });
  }

  loadReport() {
    const isPatientFriendly = this.reportType === 'patient';
    
    this.sampleService.getGeneticReportFromUrl(this.s3Url, isPatientFriendly).subscribe({
      next: (data) => {
        this.reportData = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar el reporte genético';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  goBack() {
    window.close();
  }

  printReport() {
    window.print();
  }

  getVariantConcernLevel(level: string): string {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  }

  getPathogenicityColor(classification: string): string {
    if (classification?.toLowerCase().includes('pathogenic')) {
      return 'text-red-600';
    } else if (classification?.toLowerCase().includes('likely')) {
      return 'text-amber-600';
    } else if (classification?.toLowerCase().includes('benign')) {
      return 'text-emerald-600';
    }
    return 'text-slate-600';
  }
}