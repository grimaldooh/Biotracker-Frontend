import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

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

interface RecentSample {
  id: string;
  type: string;
  status: string;
  collectionDate: string;
  patientName?: string;
}

@Component({
  selector: 'app-lab-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  hospitalId: string = '';
  hospitalName: string = '';
  hospitalAddress: string = '';
  
  stats = {
    todaySamples: 0,
    pendingAppointments: 0,
    completedAnalysis: 0,
    mutations: 0
  };

  recentSamples: RecentSample[] = [];
  todayAppointments: LabAppointment[] = [];
  
  loadingRecentSamples = false;
  loadingTodayAppointments = false;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    // Obtener hospitalInfo de localStorage de forma segura
    const hospitalInfo = localStorage.getItem('hospitalInfo');
    if (hospitalInfo) {
      try {
        const hospital = JSON.parse(hospitalInfo);
        this.hospitalId = hospital.id || '';
        this.hospitalName = hospital.name || '';
        this.hospitalAddress = hospital.fullAddress || '';
      } catch {
        this.hospitalId = '';
        this.hospitalName = '';
        this.hospitalAddress = '';
      }
    }
  }

  ngOnInit() {
    this.loadRecentSamples();
    this.loadTodayAppointments();
    this.loadStats();
  }

  loadRecentSamples() {
    if (!this.hospitalId) return;
    this.loadingRecentSamples = true;
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    this.http.get<RecentSample[]>(
      `${environment.apiUrl}/samples/hospital/${this.hospitalId}/latest`,
      { headers }
    ).subscribe({
      next: (samples) => {
        this.recentSamples = samples;
        this.loadingRecentSamples = false;
      },
      error: (error) => {
        console.error('Error loading recent samples:', error);
        this.loadingRecentSamples = false;
      }
    });
  }

  loadTodayAppointments() {
    if (!this.hospitalId) return;
    this.loadingTodayAppointments = true;
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    this.http.get<LabAppointment[]>(
      `${environment.apiUrl}/lab-appointments/hospital/${this.hospitalId}/solicited`,
      { headers }
    ).subscribe({
      next: (appointments) => {
        const today = new Date();
        this.todayAppointments = appointments.filter(apt => {
          const aptDate = new Date(apt.createdAt);
          return aptDate.toDateString() === today.toDateString();
        }).slice(0, 5);

        this.stats.pendingAppointments = appointments.length;
        this.loadingTodayAppointments = false;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.loadingTodayAppointments = false;
      }
    });
  }

  loadStats() {
    // Aquí puedes cargar estadísticas adicionales si tienes endpoints específicos
  }

  goToRegisterSample() {
    this.router.navigate(['/lab/register-sample']);
  }

  goToUploadMutations() {
    this.router.navigate(['/lab/upload-mutations']);
  }

  goToPendingAppointments() {
    this.router.navigate(['/lab/pending-appointments']);
  }

  editSample(sample: RecentSample) {
    this.router.navigate(['/lab/edit-sample', sample.id]);
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
      'COMPLETED': 'bg-green-100 text-green-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'SOLICITADA': 'bg-yellow-100 text-yellow-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }
}
