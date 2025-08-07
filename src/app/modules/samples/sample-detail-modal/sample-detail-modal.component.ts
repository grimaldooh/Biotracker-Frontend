import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sample } from '../../../core/interfaces/sample.interface';

@Component({
  selector: 'app-sample-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sample-detail-modal.component.html',
})
export class SampleDetailModalComponent {
  @Input() sample: Sample | null = null;
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  getSampleTypeLabel(type: string): string {
    const types: Record<string, string> = {
      BLOOD: 'Sangre',
      DNA: 'ADN',
      SALIVA: 'Saliva',
      MUTATIONS: 'Mutaciones'
    };
    return types[type] || type;
  }

  getSampleStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'COMPLETED': return 'Completado';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  }

  getSampleStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
