import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService, RegisterUserDTO } from '../../../core/services/user.service';
import { AuthService, SignupUserRequest } from '../../../shared/services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register-user.component.html',
  styleUrl: './register-user.component.css'
})
export class RegisterUserComponent {
  hospitalId = '00d79e66-4457-4d27-9228-fe467823ce8e';
  userForm: FormGroup;

  // Variables para el estado del formulario
  showPassword: boolean = false;
  showSpecialtyField: boolean = false;
  loading: boolean = false;

  // Arrays de datos
  roles = [
    { value: 'MEDIC', label: 'Médico' },
    { value: 'NURSE', label: 'Enfermero/a' },
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'RECEPTIONIST', label: 'Recepcionista' },
    { value: 'TECHNICIAN', label: 'Técnico' }
  ];

  specialties = [
    'Cardiología',
    'Dermatología',
    'Endocrinología',
    'Gastroenterología',
    'Ginecología',
    'Neurología',
    'Oncología',
    'Pediatría',
    'Psiquiatría',
    'Radiología',
    'Urología',
    'Medicina General'
  ];

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required],
      specialty: ['']
    });
  }

  // Métodos
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onRoleChange(): void {
    const selectedRole = this.userForm.get('role')?.value;
    this.showSpecialtyField = selectedRole === 'MEDIC';
    
    if (!this.showSpecialtyField) {
      this.userForm.get('specialty')?.setValue('');
      this.userForm.get('specialty')?.clearValidators();
    } else {
      this.userForm.get('specialty')?.setValidators([Validators.required]);
    }
    this.userForm.get('specialty')?.updateValueAndValidity();
  }

  submit(): void {
    if (this.userForm.valid) {
      this.loading = true;
      const user: RegisterUserDTO = this.userForm.value;
      this.userService.registerUser(this.hospitalId, user).subscribe({
        next: () => {
          alert('Usuario registrado exitosamente');
          this.userForm.reset();
          this.loading = false;
          this.router.navigate(['/login']);
        },
        error: () => {
          alert('Error al registrar usuario');
          this.loading = false;
        }
      });
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
    }
  }
}
