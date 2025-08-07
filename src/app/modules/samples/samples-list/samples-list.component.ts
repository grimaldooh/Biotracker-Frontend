import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SampleService } from '../../../core/services/sample.service';
import { SampleDTO } from '../sample.model';

@Component({
  selector: 'app-samples-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './samples-list.component.html',
  styleUrl: './samples-list.component.css'
})
export class SamplesListComponent implements OnInit {
  hospitalId = '00d79e66-4457-4d27-9228-fe467823ce8e';
  samples: SampleDTO[] = [];
  loading = true;
  selectedSample: SampleDTO | null = null;

  constructor(private sampleService: SampleService) {}

  ngOnInit() {
    this.sampleService.getSamplesByHospital(this.hospitalId).subscribe({
      next: (data) => {
        this.samples = data;
        this.loading = false;
      },
      error: () => {
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
