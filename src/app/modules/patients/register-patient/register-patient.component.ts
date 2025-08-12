import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { PatientService } from '../../../core/services/patient.service';
import { AuthService, SignupPatientRequest } from '../../../shared/services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

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
  registrationMode: 'reception' | 'signup' = 'reception'; // Por defecto modo recepción

  patientForm: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.patientForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthDate: ['', Validators.required],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: ['', Validators.required],
      curp: ['']
    });

    // Detectar si es modo signup (desde auth) o recepción
    this.registrationMode = this.router.url.includes('/auth/') ? 'signup' : 'reception';
  }

  submit() {
    if (this.patientForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    const formData = this.patientForm.value;

    if (this.registrationMode === 'reception') {
      // Registro con autenticación automática
      const signupData: SignupPatientRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        birthDate: formData.birthDate,
        gender: formData.gender,
        curp: formData.curp || undefined
      };

      const hospitalId = '00d79e66-4457-4d27-9228-fe467823ce8e'; // Usa el hospitalId correcto aquí

      this.authService.signupPatient(signupData, hospitalId).subscribe({
        next: (response) => {
          console.log('Registro exitoso:', response);
          this.snackBar.open('Cuenta creada exitosamente', 'Cerrar', { duration: 3000 });
          //this.authService.redirectAfterLogin();
          this.loading = false;
        },
        error: (error) => {
          this.handleError(error);
          this.loading = false;
        }
      });
    } else {
      // Registro tradicional por recepción
      this.patientService.registerPatient(formData).subscribe({
        next: () => {
          console.log('Paciente registrado exitosamente con registro tradicional');
          this.snackBar.open('Paciente registrado exitosamente', 'Cerrar', { duration: 3000 });
          this.patientForm.reset();
          this.loading = false;
        },
        error: (error) => {
          this.handleError(error);
          this.loading = false;
        }
      });
    }
  }

  private handleError(error: any): void {
    if (error.status === 400) {
      this.snackBar.open('El email ya está registrado o los datos son inválidos', 'Cerrar', { duration: 4000 });
    } else {
      this.snackBar.open('Error al registrar paciente', 'Cerrar', { duration: 3000 });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.patientForm.controls).forEach(key => {
      this.patientForm.get(key)?.markAsTouched();
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
