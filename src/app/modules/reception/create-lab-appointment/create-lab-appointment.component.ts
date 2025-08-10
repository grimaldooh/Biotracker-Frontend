import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LabAppointmentService, LabAppointmentCreationDTO } from '../../../core/services/lab-appointment.service';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../patients/patient.model'

@Component({
  selector: 'app-create-lab-appointment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-lab-appointment.component.html',
})
export class CreateLabAppointmentComponent {
  appointmentForm: FormGroup;
  hospitalId = '00d79e66-4457-4d27-9228-fe467823ce8e';
  loading = false;
  loadingPatients = false;
  searchPatientTerm = '';
  filteredPatients: Patient[] = [];
  selectedPatient: Patient | null = null;

  sampleTypes = [
    { value: 'BLOOD', label: 'Sangre', icon: '' },
    { value: 'DNA', label: 'ADN', icon: '' },
    { value: 'TISSUE', label: 'Tejido', icon: '' },
    { value: 'SALIVA', label: 'Saliva', icon: '' },
    { value: 'URINE', label: 'Orina', icon: '' },
    { value: 'MUTATIONS', label: 'Mutaciones', icon: '' }
  ];

  constructor(
    private fb: FormBuilder,
    private labAppointmentService: LabAppointmentService,
    private patientService: PatientService
  ) {
    this.appointmentForm = this.fb.group({
      patientId: ['', Validators.required],
      sampleType: ['', Validators.required],
      notes: ['']
    });
  }

  searchPatients(): void {
    console.log('Searching patients with term:', this.searchPatientTerm);
  if (this.searchPatientTerm.trim().length < 2) {
    this.filteredPatients = [];
    console.log('Search term too short, clearing results');
    return;
  }

  this.loadingPatients = true;
  this.patientService.searchPatientsByHospital(this.searchPatientTerm, this.hospitalId).subscribe({
    next: (patients) => {
      this.filteredPatients = patients;
      this.loadingPatients = false;
    },
    error: (e) => {
      this.loadingPatients = false;
      this.filteredPatients = [];
    }
  });
}

  selectPatient(patient: Patient): void {
    this.selectedPatient = patient;
    this.appointmentForm.patchValue({ patientId: patient.id });
    this.filteredPatients = [];
    this.searchPatientTerm = '';
  }

  clearSelectedPatient(): void {
    this.selectedPatient = null;
    this.searchPatientTerm = '';
    this.filteredPatients = [];
    this.appointmentForm.patchValue({ patientId: '' });
  }

  submit(): void {
    if (this.appointmentForm.valid && this.selectedPatient) {
      this.loading = true;
      
      const appointment: LabAppointmentCreationDTO = {
        medicalEntityId: this.hospitalId,
        doctorId: null,
        patientId: this.appointmentForm.value.patientId,
        sampleType: this.appointmentForm.value.sampleType,
        notes: this.appointmentForm.value.notes || ''
      };

      this.labAppointmentService.create(appointment).subscribe({
        next: () => {
          alert('Cita de laboratorio creada exitosamente');
          this.appointmentForm.reset();
          this.selectedPatient = null;
          this.loading = false;
        },
        error: () => {
          alert('Error al crear la cita de laboratorio');
          this.loading = false;
        }
      });
    } else {
      Object.keys(this.appointmentForm.controls).forEach(key => {
        this.appointmentForm.get(key)?.markAsTouched();
      });
    }
  }
}