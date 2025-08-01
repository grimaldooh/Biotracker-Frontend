import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusColor',
  standalone: true
})
export class StatusColorPipe implements PipeTransform {
  transform(status: string): string {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'COMPLETADO':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  }
}