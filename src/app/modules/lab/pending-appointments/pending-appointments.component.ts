import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface LabAppointment {
  id: string;
  medicalEntityId: string;
  doctorName: string;
  doctorId: string;
  patientName: string;
  patientId: string;
  createdAt: string;
  status: string;
  sampleType: string;
  notes: string;
}

@Component({
  selector: 'app-pending-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pending-appointments.component.html',
})
export class PendingAppointmentsComponent implements OnInit {
  hospitalId = '46f163c3-c5ff-4301-ba5f-6e348e982a8a';
  appointments: LabAppointment[] = [];
  filteredAppointments: LabAppointment[] = [];
  loading = false;
  
  searchTerm = '';
  selectedStatus = 'ALL';
  selectedType = 'ALL';

  sampleTypes = ['BLOOD', 'DNA', 'SALIVA', 'URINE', 'TISSUE'];

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.loading = true;
    this.http.get<LabAppointment[]>(`http://localhost:8080/api/lab-appointments/hospital/${this.hospitalId}/solicited`)
      .subscribe({
        next: (appointments) => {
          this.appointments = appointments.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading appointments:', error);
          this.loading = false;
        }
      });
  }

  applyFilters() {
    let filtered = [...this.appointments];

    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(apt =>
        apt.patientName.toLowerCase().includes(search) ||
        apt.doctorName.toLowerCase().includes(search) ||
        apt.notes.toLowerCase().includes(search)
      );
    }

    if (this.selectedStatus !== 'ALL') {
      filtered = filtered.filter(apt => apt.status === this.selectedStatus);
    }

    if (this.selectedType !== 'ALL') {
      filtered = filtered.filter(apt => apt.sampleType === this.selectedType);
    }

    this.filteredAppointments = filtered;
  }

  processAppointment(appointment: LabAppointment) {
    const appointmentData = {
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName,
      sampleType: appointment.sampleType,
      notes: appointment.notes,
      appointmentId: appointment.id
    };
    
    localStorage.setItem('labAppointmentData', JSON.stringify(appointmentData));
    this.router.navigate(['/lab/process-appointment']);
  }

  goBack() {
    this.router.navigate(['/lab/dashboard']);
  }

  getSampleTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'BLOOD': 'Sangre',
      'DNA': 'ADN',
      'SALIVA': 'Saliva',
      'URINE': 'Orina',
      'TISSUE': 'Tejido'
    };
    return labels[type] || type;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'SOLICITADA': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'EN_PROCESO': 'bg-blue-100 text-blue-800 border-blue-200',
      'COMPLETADA': 'bg-green-100 text-green-800 border-green-200'
    };
    return classes[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  }
}