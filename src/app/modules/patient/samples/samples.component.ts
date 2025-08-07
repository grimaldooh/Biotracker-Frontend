import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SampleService } from '../../../core/services/sample.service';
import { StatusColorPipe } from '../../../core/pipes/status-color.pipe'; // Ajusta la ruta

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
  patientId = '60ede05e-702c-442a-aba1-4507bb2fe542'; // Puedes obtenerlo de un servicio de sesión

  constructor(private sampleService: SampleService) {}

  ngOnInit() {
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
}
