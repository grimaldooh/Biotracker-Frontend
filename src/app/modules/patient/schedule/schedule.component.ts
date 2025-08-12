import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HospitalService } from '../../../core/services/hospital.service';
import { LabAppointmentService, LabAppointmentCreationDTO } from '../../../core/services/lab-appointment.service';
import { AuthService } from '../../../shared/services/auth.service'; // Importa AuthService

interface Medic {
  id: string;
  name: string;
  specialty: string | null;
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {
  appointmentForm: FormGroup;
  medics: Medic[] = [];
  filteredMedics: Medic[] = [];
  specialties: string[] = [];
  loading = false;
  loadingMedics = false;
  showSuccessModal = false;
  successMessage = '';

  // IDs dinámicos
  patientId: string | null = null;
  hospitalId: string | null = null;

  visitTypes = [
    { value: 'CONSULTATION', label: 'Consulta' },
    { value: 'FOLLOW_UP', label: 'Seguimiento' },
    { value: 'EMERGENCY', label: 'Emergencia' },
    { value: 'ROUTINE_CHECK', label: 'Chequeo de rutina' }
  ];

  sampleTypes = [
    { value: 'BLOOD', label: 'Sangre', icon: '🩸' },
    { value: 'DNA', label: 'ADN', icon: '🧬' },
    { value: 'TISSUE', label: 'Tejido', icon: '🔬' },
    { value: 'SALIVA', label: 'Saliva', icon: '💧' },
    { value: 'URINE', label: 'Orina', icon: '🧪' },
    { value: 'MUTATIONS', label: 'Mutaciones', icon: '⚡' }
  ];

  constructor(
    private fb: FormBuilder,
    private hospitalService: HospitalService,
    private labAppointmentService: LabAppointmentService,
    private authService: AuthService // Inyecta AuthService
  ) {
    this.appointmentForm = this.fb.group({
      appointmentType: ['', Validators.required],
      // Campos para cita médica
      specialty: [''],
      medicId: [''],
      visitType: [''],
      // Campos para cita de laboratorio
      sampleType: [''],
      // Campos comunes
      visitDate: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    // Obtener IDs dinámicamente del AuthService y localStorage
    this.patientId = this.authService.getCurrentUserId();
    const hospitalInfo = this.authService.getHospitalInfo();
    this.hospitalId = hospitalInfo?.id || null;

    if (!this.hospitalId) {
      this.loadingMedics = false;
      return;
    }

    this.loadingMedics = true;
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

  onAppointmentTypeChange(): void {
    const appointmentType = this.appointmentForm.get('appointmentType')?.value;
    // Limpiar campos cuando cambie el tipo
    this.appointmentForm.patchValue({
      specialty: '',
      medicId: '',
      visitType: '',
      sampleType: ''
    });

    // Configurar validaciones según el tipo
    if (appointmentType === 'medical') {
      this.appointmentForm.get('specialty')?.setValidators([Validators.required]);
      this.appointmentForm.get('medicId')?.setValidators([Validators.required]);
      this.appointmentForm.get('visitType')?.setValidators([Validators.required]);
      this.appointmentForm.get('sampleType')?.clearValidators();
    } else if (appointmentType === 'laboratory') {
      this.appointmentForm.get('sampleType')?.setValidators([Validators.required]);
      this.appointmentForm.get('specialty')?.clearValidators();
      this.appointmentForm.get('medicId')?.clearValidators();
      this.appointmentForm.get('visitType')?.clearValidators();
    }

    // Actualizar validaciones
    this.appointmentForm.get('specialty')?.updateValueAndValidity();
    this.appointmentForm.get('medicId')?.updateValueAndValidity();
    this.appointmentForm.get('visitType')?.updateValueAndValidity();
    this.appointmentForm.get('sampleType')?.updateValueAndValidity();

    // Limpiar médicos filtrados
    this.filteredMedics = [];
  }

  onSpecialtyChange(): void {
    const selectedSpecialty = this.appointmentForm.get('specialty')?.value;
    this.filteredMedics = this.medics.filter(medic => medic.specialty === selectedSpecialty);
    this.appointmentForm.patchValue({ medicId: '' });
  }

  getSubmitButtonText(): string {
    const appointmentType = this.appointmentForm.get('appointmentType')?.value;
    return appointmentType === 'laboratory' ? 'Agendar Cita de Laboratorio' : 'Agendar Cita Médica';
  }

  submit(): void {
    if (this.appointmentForm.valid) {
      this.loading = true;
      const appointmentType = this.appointmentForm.get('appointmentType')?.value;

      if (appointmentType === 'medical') {
        this.createMedicalVisit();
      } else if (appointmentType === 'laboratory') {
        this.createLabAppointment();
      }
    } else {
      Object.keys(this.appointmentForm.controls).forEach(key => {
        this.appointmentForm.get(key)?.markAsTouched();
      });
    }
  }

  private createMedicalVisit(): void {
    if (!this.patientId || !this.hospitalId) return;

    const body = {
      patientId: { id: this.patientId },
      doctorId: { id: this.appointmentForm.value.medicId },
      visitDate: this.appointmentForm.value.visitDate,
      type: this.appointmentForm.value.visitType,
      medicalArea: this.appointmentForm.value.specialty,
      notes: this.appointmentForm.value.notes || ''
    };

    this.hospitalService.createMedicalVisit(this.hospitalId, body).subscribe({
      next: () => {
        this.successMessage = 'cita médica';
        this.showSuccessModal = true;
        this.resetForm();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        console.error('Error al crear la cita médica');
      }
    });
  }

  private createLabAppointment(): void {
    if (!this.patientId || !this.hospitalId) return;

    const appointment: LabAppointmentCreationDTO = {
      medicalEntityId: this.hospitalId,
      doctorId: null,
      patientId: this.patientId,
      sampleType: this.appointmentForm.value.sampleType,
      notes: this.appointmentForm.value.notes || ''
    };

    this.labAppointmentService.create(appointment).subscribe({
      next: () => {
        this.successMessage = 'cita de laboratorio';
        this.showSuccessModal = true;
        this.resetForm();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        console.error('Error al crear la cita de laboratorio');
      }
    });
  }

  private resetForm(): void {
    this.appointmentForm.reset();
    this.filteredMedics = [];
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.successMessage = '';
  }
}
