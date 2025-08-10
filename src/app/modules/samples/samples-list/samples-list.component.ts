import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SampleService } from '../../../core/services/sample.service';
import { SampleDTO } from '../sample.model';

@Component({
  selector: 'app-samples-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './samples-list.component.html',
  styleUrl: './samples-list.component.css'
})
export class SamplesListComponent implements OnInit {
  hospitalId = '00d79e66-4457-4d27-9228-fe467823ce8e';
  searchTerm: string = '';

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

  getTypeColor(type: string): string {
    switch (type) {
      case 'BLOOD':
        return 'bg-red-100 text-red-800';
      case 'SALIVA':
        return 'bg-blue-100 text-blue-800';
      case 'DNA':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'BLOOD':
        return 'Sangre';
      case 'SALIVA':
        return 'Saliva';
      case 'DNA':
        return 'ADN';
      default:
        return type;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'PROCESSING':
        return 'En Proceso';
      case 'COMPLETED':
        return 'Completado';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  }

  getPendingSamples(): number {
    return this.samples.filter(s => s.status === 'PENDING' || s.status === 'PROCESSING').length;
  }

  getCompletedSamples(): number {
    return this.samples.filter(s => s.status === 'COMPLETED').length;
  }

  getTodaySamples(): number {
    const today = new Date();
    return this.samples.filter(s => {
      const sampleDate = new Date(s.collectionDate);
      return sampleDate.toDateString() === today.toDateString();
    }).length;
  }
}
