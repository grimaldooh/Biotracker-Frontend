import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../patient.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patients-list.component.html',
  styleUrl: './patients-list.component.css'
})
export class PatientsListComponent implements OnInit {
  patients: Patient[] = [];
  loading = true;
  hospitalId = '00d79e66-4457-4d27-9228-fe467823ce8e'; // Usa el id que ya tienes
  searchTerm = '';

  constructor(private patientService: PatientService, private router: Router) {}

  ngOnInit() {
    this.patientService.getPatientsByHospital(this.hospitalId).subscribe({
      next: (data) => {
        console.log('Pacientes cargados:', data);
        this.patients = data;
        this.loading = false;
      },
      error: () => {
        console.error('Error al cargar pacientes');
        this.loading = false;
      }
    });
  }

  get filteredPatients() {
    if (!this.searchTerm) return this.patients;
    const term = this.searchTerm.toLowerCase();
    return this.patients.filter(p =>
      p.firstName.toLowerCase().includes(term) ||
      p.lastName.toLowerCase().includes(term) 
    );
  }

  deletePatient(id: string) {
    if (!confirm('¿Seguro que deseas eliminar este paciente?')) return;
    this.patientService.deletePatient(id).subscribe({
      next: () => {
        this.patients = this.patients.filter(p => p.id !== id);
      },
      error: () => {
        alert('Error al eliminar paciente');
      }
    });
  }

  viewPatientVisits(patientId: string) {
    this.router.navigate(['/medical-visits/patient', patientId]);
  }

  viewPatientSamples(patientId: string) {
    this.router.navigate(['/samples/patient', patientId]);
  }
}
