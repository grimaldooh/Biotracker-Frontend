import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportsService, PatientFriendlyReport, MedicalReport } from '../../../core/services/reports.service';

@Component({
  selector: 'app-report-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-viewer.component.html',
})
export class ReportViewerComponent implements OnInit {
  reportData: PatientFriendlyReport | MedicalReport | null = null;
  isPatientFriendly: boolean = false;
  sampleId: string = '';
  loading = false;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reportsService: ReportsService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const s3Url = params['s3Url'];
      this.isPatientFriendly = params['isPatientFriendly'] === 'true';
      this.sampleId = params['sampleId'] || '';

      if (s3Url) {
        this.loadReport(s3Url, this.isPatientFriendly);
      }
    });
  }

  loadReport(s3Url: string, isPatientFriendly: boolean): void {
    this.loading = true;
    this.error = false;

    this.reportsService.fetchReportFromS3(s3Url, isPatientFriendly).subscribe({
      next: (data) => {
        this.reportData = data;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/patient/samples']);
  }

  get patientReport(): PatientFriendlyReport | null {
    return this.isPatientFriendly ? this.reportData as PatientFriendlyReport : null;
  }

  get medicalReport(): MedicalReport | null {
    return !this.isPatientFriendly ? this.reportData as MedicalReport : null;
  }
}