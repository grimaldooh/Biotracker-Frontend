import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../core/services/patient.service';
import { HospitalService } from '../../../core/services/hospital.service';

interface Medic {
  id: string;
  name: string;
  specialty: string | null;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
}

@Component({
  selector: 'app-create-appointment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-appointment.component.html',
  styleUrl: './create-appointment.component.css'
})
export class CreateAppointmentComponent implements OnInit {
  hospitalId = '46f163c3-c5ff-4301-ba5f-6e348e982a8a';
  medics: Medic[] = [];
  specialties: string[] = [];
  filteredMedics: Medic[] = [];
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  searchPatientTerm = '';
  loadingMedics = true;
  loadingPatients = false;
  appointmentForm: FormGroup;
  visitTypes = [
    { value: 'CONSULTATION', label: 'Consulta' },
    { value: 'FOLLOW_UP', label: 'Seguimiento' },
    { value: 'SURGERY', label: 'Cirugía' },
    { value: 'EMERGENCY', label: 'Emergencia' },
    { value: 'OTHER', label: 'Otro' }
  ];

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private patientService: PatientService,
    private hospitalService: HospitalService
  ) {
    this.appointmentForm = this.fb.group({
      specialty: ['', Validators.required],
      medicId: ['', Validators.required],
      patientId: ['', Validators.required],
      visitType: ['', Validators.required],
      visitDate: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit() {
    this.hospitalService.getMedicsByHospital(this.hospitalId).subscribe({
      next: (data) => {
        this.medics = data;
        this.specialties = Array.from(new Set(data.map(m => m.specialty).filter((s): s is string => typeof s === 'string')));
        this.loadingMedics = false;
      },
      error: () => {
        this.loadingMedics = false;
      }
    });
  }

  onSpecialtyChange() {
    const specialty = this.appointmentForm.value.specialty;
    this.filteredMedics = this.medics.filter(m => m.specialty === specialty);
    this.appointmentForm.patchValue({ medicId: '' });
  }

  searchPatients() {
    if (!this.searchPatientTerm.trim()) {
      this.filteredPatients = [];
      return;
    }
    this.loadingPatients = true;
    const [firstName, ...lastNameArr] = this.searchPatientTerm.trim().split(' ');
    const lastName = lastNameArr.join(' ');
    this.patientService.getPatientsByName(firstName, lastName).subscribe({
      next: (data) => {
        this.filteredPatients = data;
        this.loadingPatients = false;
      },
      error: () => {
        this.loadingPatients = false;
      }
    });
  }

  selectPatient(patient: Patient) {
    this.appointmentForm.patchValue({ patientId: patient.id });
    this.filteredPatients = [];
    this.searchPatientTerm = `${patient.firstName} ${patient.lastName}`;
  }

  submit() {
    if (this.appointmentForm.invalid) return;
    const body = {
      patientId: { id: this.appointmentForm.value.patientId },
      doctorId: { id: this.appointmentForm.value.medicId },
      visitDate: this.appointmentForm.value.visitDate,
      type: this.appointmentForm.value.visitType,
      medicalArea: this.appointmentForm.value.specialty,
      notes: this.appointmentForm.value.notes
    };
    this.hospitalService.createMedicalVisit(this.hospitalId, body).subscribe({
      next: () => {
        alert('Cita médica creada exitosamente');
        this.appointmentForm.reset();
      },
      error: () => {
        alert('Error al crear la cita médica');
      }
    });
  }
}
