import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HospitalService } from '../../../core/services/hospital.service';

export interface MedicalVisitDTO {
  id: string;
  patientName: string;
  doctorName: string;
  visitDate: string;
  notes: string;
  diagnosis: string;
  recommendations: string;
  medicalEntityId: string;
  visitCompleted: boolean;
  type: string;
}

@Component({
  selector: 'app-patient-visits',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-visits.component.html',
  styleUrl: './patient-visits.component.css'
})
export class PatientVisitsComponent implements OnInit {
  visits: MedicalVisitDTO[] = [];
  loading = true;
  patientId = '';

  constructor(private route: ActivatedRoute, private hospitalService: HospitalService) {}

  ngOnInit() {
    this.patientId = this.route.snapshot.paramMap.get('patientId') || '';
    this.hospitalService.getPatientVisits(this.patientId).subscribe({
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
