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
  hospitalId = '46f163c3-c5ff-4301-ba5f-6e348e982a8a';
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
