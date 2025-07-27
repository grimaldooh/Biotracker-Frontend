import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { PatientService } from '../../../core/services/patient.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-register-patient',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatSnackBarModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './register-patient.component.html',
  styleUrl: './register-patient.component.css'
})
export class RegisterPatientComponent {
  loading = false;

  patientForm: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private snackBar: MatSnackBar
  ) {
    this.patientForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthDate: ['', Validators.required],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      curp: ['']
    });
  }

  submit() {
    if (this.patientForm.invalid) return;
    console.log(this.patientForm.value);
    this.loading = true;
    this.patientService.registerPatient(this.patientForm.value).subscribe({
      next: () => {
        this.snackBar.open('Paciente registrado exitosamente', 'Cerrar', { duration: 3000 });
        this.patientForm.reset();
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Error al registrar paciente', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
