import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-process-appointment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './process-appointment.component.html',
  styleUrl: './process-appointment.component.css'
})
export class ProcessAppointmentComponent implements OnInit {
  sampleForm!: FormGroup;
  appointmentData: any = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadAppointmentData();
  }

  private loadAppointmentData() {
    const storedData = localStorage.getItem('labAppointmentData');
    if (storedData) {
      this.appointmentData = JSON.parse(storedData);
      
      this.sampleForm.patchValue({
        patientId: this.appointmentData.patientId,
        type: this.appointmentData.sampleType,
        registeredById: '550e8400-e29b-41d4-a716-446655440000',
        collectionDate: new Date().toISOString().split('T')[0],
        notes: this.appointmentData.notes || ''
      });
    } else {
      this.router.navigate(['/lab/dashboard']);
    }
  }

  private initializeForm() {
    this.sampleForm = this.fb.group({
      patientId: ['', Validators.required],
      registeredById: ['', Validators.required],
      type: ['', Validators.required],
      status: ['PENDING'],
      collectionDate: ['', Validators.required],
      notes: [''],
      medicalEntityId: ['46f163c3-c5ff-4301-ba5f-6e348e982a8a'],
      
      // Datos completos de sangre
      bloodData: this.fb.group({
        glucoseMgDl: [null],
        cholesterolTotalMgDl: [null],
        cholesterolHdlMgDl: [null],
        cholesterolLdlMgDl: [null],
        triglyceridesMgDl: [null],
        creatinineMgDl: [null],
        ureaMgDl: [null],
        hemoglobinGDl: [null],
        hematocritPercent: [null],
        redBloodCellsMillionUl: [null],
        whiteBloodCellsThousandUl: [null],
        plateletsThousandUl: [null],
        altSgptUL: [null],
        astSgotUL: [null],
        bilirubinTotalMgDl: [null],
        alkalinePhosphataseUL: [null],
        bunMgDl: [null],
        gfrMlMin: [null],
        totalProteinGDl: [null],
        albuminGDl: [null],
        sodiumMeqL: [null],
        potassiumMeqL: [null],
        chlorideMeqL: [null],
        cReactiveProteinMgL: [null],
        esrMmHr: [null],
        geneticMarkersDetected: [null],
        geneticQualityScore: [null],
        labReferenceValues: [''],
        analyzerModel: [''],
        centrifugationSpeedRpm: [null],
        storageTemperatureCelsius: [null]
      }),
      
      // Datos completos de DNA
      dnaData: this.fb.group({
        concentrationNgUl: [null],
        purity260280Ratio: [null],
        purity260230Ratio: [null],
        integrityNumber: [null],
        extractionMethod: [''],
        extractionDate: [''],
        extractionTechnician: [''],
        storageBuffer: [''],
        aliquotVolumeUl: [null],
        freezerLocation: [''],
        sequencingPlatform: [''],
        sequencingDepth: [null],
        libraryPrepProtocol: [''],
        totalReads: [null],
        mappedReads: [null],
        mappingQualityScore: [null],
        variantsDetected: [null],
        snpsDetected: [null],
        indelsDetected: [null],
        fastqR1Url: [''],
        fastqR2Url: [''],
        vcfFileUrl: [''],
        bamFileUrl: ['']
      }),
      
      // Datos completos de saliva
      salivaData: this.fb.group({
        volumeMl: [null],
        phLevel: [null],
        viscosity: [''],
        dnaYieldNg: [null],
        cellCountPerMl: [null],
        collectionMethod: [''],
        storageTemperatureCelsius: [null]
      })
    });
  }

  onSubmit() {
    if (this.sampleForm.invalid) {
      return;
    }

    this.loading = true;
    const formData = this.sampleForm.value;
    formData.doctorReferedId = this.appointmentData.doctorId;
    formData.medicalEntityId = this.appointmentData.medicalEntityId;

    this.http.post('http://localhost:8080/api/samples', formData)
      .subscribe({
        next: (response) => {
          alert('Muestra registrada exitosamente');
          localStorage.removeItem('labAppointmentData');
          this.router.navigate(['/lab/dashboard']);
        },
        error: (error) => {
          console.error('Error registering sample:', error);
          alert('Error al registrar la muestra');
          this.loading = false;
        }
      });
  }

  goBack() {
    this.router.navigate(['/lab/pending-appointments']);
  }

  getSampleTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'BLOOD': 'Sangre',
      'DNA': 'ADN',
      'SALIVA': 'Saliva',
      'URINE': 'Orina',
      'TISSUE': 'Tejido'
    };
    return labels[type] || type;
  }
}
