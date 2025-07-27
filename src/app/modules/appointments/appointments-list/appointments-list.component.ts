import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HospitalService } from '../../../core/services/hospital.service';
import { MedicalVisitDTO } from '../medical-visit.model';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointments-list.component.html',
  styleUrl: './appointments-list.component.css'
})
export class AppointmentsListComponent implements OnInit {
  medicalEntityId = '46f163c3-c5ff-4301-ba5f-6e348e982a8a'; // Usa el id que ya tienes
  visits: MedicalVisitDTO[] = [];
  loading = true;

  constructor(private hospitalService: HospitalService) {}

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
}
