import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface SampleDTO {
  id: string;
  patientId: string;
  registeredById: string;
  type: string;
  status: string;
  collectionDate: string;
  notes: string;
  doctorReferedId?: string;
  medicalEntityId: string;
  bloodData?: any;
  dnaData?: any;
  salivaData?: any;
}

@Component({
  selector: 'app-edit-sample',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-sample.component.html',
})
export class EditSampleComponent implements OnInit {
  sampleForm!: FormGroup;
  sampleId: string = '';
  sample: SampleDTO | null = null;
  loading = false;
  saving = false;

  sampleTypes = [
    { value: 'BLOOD', label: 'Sangre' },
    { value: 'DNA', label: 'ADN' },
    { value: 'SALIVA', label: 'Saliva' },
    { value: 'URINE', label: 'Orina' },
    { value: 'TISSUE', label: 'Tejido' }
  ];

  sampleStatuses = [
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'IN_PROGRESS', label: 'En Progreso' },
    { value: 'COMPLETED', label: 'Completado' },
    { value: 'CANCELLED', label: 'Cancelado' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.sampleId = this.route.snapshot.paramMap.get('id') || '';
    if (this.sampleId) {
      this.loadSample();
    } else {
      this.router.navigate(['/lab/dashboard']);
    }
  }

  private initializeForm() {
    this.sampleForm = this.fb.group({
      id: [null],
      patientId: [null, Validators.required],
      registeredById: [null, Validators.required],
      type: [null, Validators.required],
      status: [null, Validators.required],
      collectionDate: [null, Validators.required],
      notes: [null],
      doctorReferedId: [null],
      medicalEntityId: ['46f163c3-c5ff-4301-ba5f-6e348e982a8a'],
      
      // Datos específicos de sangre - campos exactos de BloodSampleDataDTO
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
      
      // Datos específicos de DNA - campos exactos de DnaSampleDataDTO
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
      
      // Datos específicos de saliva - campos exactos de SalivaSampleDataDTO
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

  loadSample() {
    this.loading = true;
    this.http.get<SampleDTO>(`http://localhost:8080/api/samples/${this.sampleId}`)
      .subscribe({
        next: (sample) => {
          this.sample = sample;
          this.populateForm(sample);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading sample:', error);
          alert('Error al cargar la muestra');
          this.router.navigate(['/lab/dashboard']);
        }
      });
  }

  private populateForm(sample: SampleDTO) {
    this.sampleForm.patchValue({
      id: sample.id,
      patientId: sample.patientId,
      registeredById: sample.registeredById,
      type: sample.type,
      status: sample.status,
      collectionDate: sample.collectionDate,
      notes: sample.notes,
      doctorReferedId: sample.doctorReferedId,
      medicalEntityId: sample.medicalEntityId
    });

    // Poblar datos específicos según el tipo
    if (sample.bloodData) {
      this.sampleForm.get('bloodData')?.patchValue(sample.bloodData);
    }
    if (sample.dnaData) {
      this.sampleForm.get('dnaData')?.patchValue(sample.dnaData);
    }
    if (sample.salivaData) {
      this.sampleForm.get('salivaData')?.patchValue(sample.salivaData);
    }
  }

  onSubmit() {
    if (this.sampleForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.saving = true;
    const formData = this.sampleForm.value;
    console.log('Form Data:', formData);

    this.http.put(`http://localhost:8080/api/samples/${this.sampleId}`, formData)
      .subscribe({
        next: (response) => {
          alert('Muestra actualizada exitosamente');
          this.router.navigate(['/lab/dashboard']);
        },
        error: (error) => {
          console.error('Error updating sample:', error);
          alert('Error al actualizar la muestra');
          this.saving = false;
        }
      });
  }

  private markFormGroupTouched() {
    Object.keys(this.sampleForm.controls).forEach(key => {
      const control = this.sampleForm.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(nestedKey => {
          control.get(nestedKey)?.markAsTouched();
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/lab/dashboard']);
  }

  getSampleTypeLabel(type: string): string {
    const typeObj = this.sampleTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  }

  getStatusLabel(status: string): string {
    const statusObj = this.sampleStatuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.sampleForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isNestedFieldInvalid(groupName: string, fieldName: string): boolean {
    const field = this.sampleForm.get(`${groupName}.${fieldName}`);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}