import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HospitalService } from '../../../core/services/hospital.service';
import { PatientService } from '../../../core/services/patient.service';
import { LabService, LabAppointmentRequest } from '../../../core/services/lab.service';

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
  selector: 'app-new-appointment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './new-appointment.component.html',
  styleUrl: './new-appointment.component.css'
})
export class NewAppointmentComponent implements OnInit {
  hospitalId = '46f163c3-c5ff-4301-ba5f-6e348e982a8a';
  currentDoctorId = '1a042737-3406-4aa5-a7e6-948b4c136778';
  
  // Formularios
  appointmentForm!: FormGroup;
  labForm!: FormGroup;
  
  // Datos del paciente y cita previa
  appointmentData: any = null;
  
  // Datos para formularios
  medics: Medic[] = [];
  specialties: string[] = [];
  filteredMedics: Medic[] = [];
  filteredPatients: Patient[] = [];
  searchPatientTerm = '';
  
  // Estados
  loadingMedics = false;
  loadingPatients = false;
  submittingAppointment = false;
  submittingLab = false;
  showLabForm = false;
  
  // Opciones
  visitTypes = [
    { value: 'CONSULTATION', label: 'Consulta' },
    { value: 'FOLLOW_UP', label: 'Seguimiento' },
    { value: 'SURGERY', label: 'Cirugía' },
    { value: 'EMERGENCY', label: 'Emergencia' },
    { value: 'OTHER', label: 'Otro' }
  ];

  sampleTypes = [
    { value: 'BLOOD', label: 'Sangre' },
    { value: 'URINE', label: 'Orina' },
    { value: 'SALIVA', label: 'Saliva' },
    { value: 'TISSUE', label: 'Tejido' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private hospitalService: HospitalService,
    private patientService: PatientService,
    private labService: LabService
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadAppointmentData();
    this.loadMedics();

    // Si la cita es con el mismo doctor, marca los campos como touched y dirty y actualiza el estado del formulario
    setTimeout(() => {
      if (this.appointmentData?.withSameDoctor) {
        this.appointmentForm.get('specialty')?.markAsTouched();
        this.appointmentForm.get('specialty')?.markAsDirty();
        this.appointmentForm.get('medicId')?.markAsTouched();
        this.appointmentForm.get('medicId')?.markAsDirty();
        this.appointmentForm.get('patientId')?.markAsTouched();
        this.appointmentForm.get('patientId')?.markAsDirty();
        this.appointmentForm.updateValueAndValidity();
      }
    }, 0);
  }

  private initializeForms() {
    this.appointmentForm = this.fb.group({
      specialty: ['', Validators.required],
      medicId: ['', Validators.required],
      patientId: ['', Validators.required],
      visitType: ['', Validators.required],
      visitDate: ['', Validators.required],
      notes: ['']
    });

    this.labForm = this.fb.group({
      patientId: ['', Validators.required],
      sampleType: ['BLOOD', Validators.required],
      notes: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  private loadAppointmentData() {
    const storedData = localStorage.getItem('newAppointmentData');
    if (storedData) {
      this.appointmentData = JSON.parse(storedData);
      
      // Pre-llenar formularios con datos existentes
      this.appointmentForm.patchValue({
        patientId: this.appointmentData.patientId
      });

      this.labForm.patchValue({
        patientId: this.appointmentData.patientId
      });

      this.searchPatientTerm = this.appointmentData.patientName || '';

      // Si es con el mismo doctor, pre-llenar especialidad y doctor Y remover validators
      if (this.appointmentData.withSameDoctor) {
        this.appointmentForm.patchValue({
          specialty: this.appointmentData.specialty,
          medicId: this.appointmentData.doctorId
        });
        
        // Remover validators de campos ocultos
        this.appointmentForm.get('specialty')?.clearValidators();
        this.appointmentForm.get('medicId')?.clearValidators();
        this.appointmentForm.get('specialty')?.updateValueAndValidity();
        this.appointmentForm.get('medicId')?.updateValueAndValidity();
      }
    }
  }

  private loadMedics() {
    this.loadingMedics = true;
    this.hospitalService.getMedicsByHospital(this.hospitalId).subscribe({
      next: (data) => {
        this.medics = data;
        this.specialties = Array.from(new Set(
          data.map(m => m.specialty).filter((s): s is string => typeof s === 'string')
        ));
        
        // Si es con el mismo doctor, filtrar médicos de esa especialidad
        if (this.appointmentData?.withSameDoctor && this.appointmentData.specialty) {
          this.onSpecialtyChange();
        }
        
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
    
    // Si no es con el mismo doctor, limpiar selección de médico
    if (!this.appointmentData?.withSameDoctor) {
      this.appointmentForm.patchValue({ medicId: '' });
    }
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
    this.labForm.patchValue({ patientId: patient.id });
    this.filteredPatients = [];
    this.searchPatientTerm = `${patient.firstName} ${patient.lastName}`;
  }

  submitAppointment() {
    if (this.appointmentForm.invalid) {
      this.markFormGroupTouched(this.appointmentForm);
      return;
    }
   //
    this.submittingAppointment = true;
    const formData = this.appointmentForm.value;
    
    const body = {
      patientId: { id: formData.patientId },
      doctorId: { id: this.currentDoctorId },
      visitDate: formData.visitDate,
      type: formData.visitType,
      medicalArea: formData.specialty,
      notes: formData.notes
    };

    console.log('Submitting appointment:', body);
    this.hospitalService.createMedicalVisit(this.hospitalId, body).subscribe({
      next: () => {
        alert('Cita médica creada exitosamente');
        this.appointmentForm.reset();
        this.submittingAppointment = false;
        this.clearStoredData();
      },
      error: () => {
        alert('Error al crear la cita médica');
        this.submittingAppointment = false;
      }
    });
  }

  submitLabRequest() {
    if (this.labForm.invalid) {
      this.markFormGroupTouched(this.labForm);
      return;
    }

    this.submittingLab = true;
    const formData = this.labForm.value;
    
    const request: LabAppointmentRequest = {
      doctorId: this.currentDoctorId,
      patientId: formData.patientId,
      sampleType: formData.sampleType,
      notes: formData.notes
    };

    console.log('Lab request data:', request);

    this.labService.createLabAppointment(request).subscribe({
      next: () => {
        alert('Solicitud de estudio de laboratorio enviada exitosamente');
        this.labForm.reset();
        this.submittingLab = false;
        this.showLabForm = false;
      },
      error: () => {
        alert('Error al enviar la solicitud de laboratorio');
        this.submittingLab = false;
      }
    });
  }

  toggleLabForm() {
    this.showLabForm = !this.showLabForm;
    if (this.showLabForm && this.appointmentData?.patientId) {
      this.labForm.patchValue({
        patientId: this.appointmentData.patientId
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key)?.markAsTouched();
    });
  }

  private clearStoredData() {
    localStorage.removeItem('newAppointmentData');
  }

  goBack() {
    this.clearStoredData();
    this.router.navigate(['/doctors/dashboard']);
  }

  // Utility methods
  isFieldInvalid(formGroup: FormGroup, fieldName: string): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(formGroup: FormGroup, fieldName: string): string {
    const field = formGroup.get(fieldName);
    if (field?.errors?.['required']) {
      return `${fieldName} es requerido`;
    }
    if (field?.errors?.['minlength']) {
      return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    }
    return '';
  }

  getSampleTypeLabel(value: string): string {
    const type = this.sampleTypes.find(t => t.value === value);
    return type ? type.label : value;
  }
}
