import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../core/services/patient.service';
import { HospitalService } from '../../../core/services/hospital.service';

interface Medic {
  id: string;
  name: string;
  specialty: string | null;
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css'
})
export class ScheduleComponent implements OnInit {
  hospitalId = '00d79e66-4457-4d27-9228-fe467823ce8e';
  patientId = '95f34129-c894-4574-8914-be012053e7c7'; // ID del paciente logueado
  medics: Medic[] = [];
  specialties: string[] = [];
  filteredMedics: Medic[] = [];
  loadingMedics = true;
  appointmentForm: FormGroup;
  
  visitTypes = [
    { value: 'CONSULTATION', label: 'Consulta' },
    { value: 'FOLLOW_UP', label: 'Seguimiento' },
    { value: 'SURGERY', label: 'Cirugía' },
    { value: 'EMERGENCY', label: 'Emergencia' },
    { value: 'OTHER', label: 'Otro' }
  ];

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private hospitalService: HospitalService
  ) {
    this.appointmentForm = this.fb.group({
      specialty: ['', Validators.required],
      medicId: ['', Validators.required],
      visitType: ['', Validators.required],
      visitDate: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit() {
    // Se traen los médicos existentes para obtener las especialidades
    this.hospitalService.getMedicsByHospital(this.hospitalId).subscribe({
      next: (data) => {
        console.log('Médicos cargados:', data);
        this.medics = data;
        // Se obtienen las especialidades únicas de los médicos
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

  submit() {
    if (this.appointmentForm.invalid) return;
    
    const body = {
      patientId: { id: this.patientId },
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
