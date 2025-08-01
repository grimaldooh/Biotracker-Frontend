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
  patientId = '95f34129-c894-4574-8914-be012053e7c7'; // Puedes obtenerlo de un servicio de sesión

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
}
