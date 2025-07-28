import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SampleService } from '../../../core/services/sample.service';
import { SampleDTO } from '../sample.model';

@Component({
  selector: 'app-patient-samples',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-samples.component.html',
  styleUrl: './patient-samples.component.css'
})
export class PatientSamplesComponent implements OnInit {
  samples: SampleDTO[] = [];
  loading = true;
  patientId = '';
  selectedSample: SampleDTO | null = null;

  constructor(private route: ActivatedRoute, private sampleService: SampleService) {}

  ngOnInit() {
    this.patientId = this.route.snapshot.paramMap.get('patientId') || '';
    this.sampleService.getSamplesByPatient(this.patientId).subscribe({
      next: (data) => {
        console.log('Muestras del paciente cargadas:', data);
        this.samples = data;
        this.loading = false;
      },
      error: () => {
        console.error('Error al cargar muestras del paciente');
        this.loading = false;
      }
    });
  }

  showDetails(sample: SampleDTO) {
    this.selectedSample = sample;
  }

  closeModal() {
    this.selectedSample = null;
  }
}
