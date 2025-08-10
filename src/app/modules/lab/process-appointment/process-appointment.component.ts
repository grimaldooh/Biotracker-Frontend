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
  medicalEntityId: string = '00d79e66-4457-4d27-9228-fe467823ce8e'; // ID de la entidad médica predefinida

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
      console.log('Loaded appointment data:', this.appointmentData);
      this.sampleForm.patchValue({
        patientId: this.appointmentData.patientId,
        type: this.appointmentData.sampleType,
        registeredById: 'c332337f-ea0f-48b1-a1a6-9dac44364343',
        collectionDate: new Date().toISOString().split('T')[0],
        notes: this.appointmentData.notes || ''
      });
    } else {
      this.router.navigate(['/lab/dashboard']);
    }
  }

  private initializeForm() {
    this.sampleForm = this.fb.group({
      patientId: [null, Validators.required],
      registeredById: [null, Validators.required],
      type: [null, Validators.required],
      status: [null],
      collectionDate: [null, Validators.required],
      notes: [null],
      medicalEntityId: [null],
      
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
        labReferenceValues: [null],
        analyzerModel: [null],
        centrifugationSpeedRpm: [null],
        storageTemperatureCelsius: [null]
      }),
      
      // Datos completos de DNA
      dnaData: this.fb.group({
        concentrationNgUl: [null],
        purity260280Ratio: [null],
        purity260230Ratio: [null],
        integrityNumber: [null],
        extractionMethod: [null],
        extractionDate: [null],
        extractionTechnician: [null],
        storageBuffer: [null],
        aliquotVolumeUl: [null],
        freezerLocation: [null],
        sequencingPlatform: [null],
        sequencingDepth: [null],
        libraryPrepProtocol: [null],
        totalReads: [null],
        mappedReads: [null],
        mappingQualityScore: [null],
        variantsDetected: [null],
        snpsDetected: [null],
        indelsDetected: [null],
        fastqR1Url: [null],
        fastqR2Url: [null],
        vcfFileUrl: [null],
        bamFileUrl: [null]
      }),
      
      // Datos completos de saliva
      salivaData: this.fb.group({
        volumeMl: [null],
        phLevel: [null],
        viscosity: [null],
        dnaYieldNg: [null],
        cellCountPerMl: [null],
        collectionMethod: [null],
        fastingStatus: [null],
        contaminationLevel: [null],
        preservativeUsed: [null],
        timeToProcessingHours: [null]
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
    formData.medicalEntityId = this.medicalEntityId;
    console.log('Submitting sample data:', formData);

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
