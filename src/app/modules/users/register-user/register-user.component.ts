import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService, RegisterUserDTO } from '../../../core/services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register-user.component.html',
  styleUrl: './register-user.component.css'
})
export class RegisterUserComponent {
  hospitalId = '46f163c3-c5ff-4301-ba5f-6e348e982a8a';
  userForm: FormGroup;
  roles = ['MEDIC', 'TECHNICIAN', 'ADMIN'];

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required],
      specialty: ['']
    });
  }

  submit() {
    if (this.userForm.invalid) return;
    const user: RegisterUserDTO = this.userForm.value;
    this.userService.registerUser(this.hospitalId, user).subscribe({
      next: () => {
        alert('Usuario registrado exitosamente');
        this.userForm.reset();
      },
      error: () => {
        alert('Error al registrar usuario');
      }
    });
  }
}
