import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HospitalService } from '../../../core/services/hospital.service';
import { MedicalVisitDTO } from '../medical-visit.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointments-list.component.html',
  styleUrl: './appointments-list.component.css'
})
export class AppointmentsListComponent implements OnInit {
  medicalEntityId = '00d79e66-4457-4d27-9228-fe467823ce8e'; // Usa el id que ya tienes
  visits: MedicalVisitDTO[] = [];
  loading = true;

  constructor(private hospitalService: HospitalService, private router: Router) {}

  ngOnInit() {
    this.hospitalService.getMedicalVisitsByHospital(this.medicalEntityId).subscribe({
      next: (data) => {
        this.visits = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get upcomingVisits() {
    return this.visits.filter(v => !v.visitCompleted);
  }

  get pastVisits() {
    return this.visits.filter(v => v.visitCompleted);
  }

  goToCreateAppointment() {
    this.router.navigate(['/appointments/create']);
  }
}
