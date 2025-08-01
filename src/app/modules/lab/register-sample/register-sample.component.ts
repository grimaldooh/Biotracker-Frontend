import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

import { SampleService } from '../../../core/services/sample.service';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../patients/patient.model';

@Component({
  selector: 'app-register-sample',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './register-sample.component.html',
  styleUrl: './register-sample.component.css'
})
export class RegisterSampleComponent implements OnInit {
  sampleType: 'BLOOD' | 'DNA' | 'SALIVA' | '' = '';
  sampleForm!: FormGroup;
  loading = false;

  // Patient search
  searchPatientTerm = '';
  filteredPatients: Patient[] = [];
  loadingPatients = false;
  private searchSubject = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private sampleService: SampleService,
    private patientService: PatientService
  ) {
    this.initializeForm();
    this.setupPatientSearch();
  }

  ngOnInit(): void {
    // Any initialization logic can go here
  }

  private initializeForm(): void {
    this.sampleForm = this.fb.group({
      patientId: ['', Validators.required],
      registeredById: ['', Validators.required],
      type: ['', Validators.required],
      status: ['PENDING', Validators.required],
      collectionDate: ['', Validators.required],
      notes: [''],
      bloodData: this.fb.group({
        glucoseMgDl: [''],
        cholesterolTotalMgDl: [''],
        cholesterolHdlMgDl: [''],
        cholesterolLdlMgDl: [''],
        triglyceridesMgDl: [''],
        creatinineMgDl: [''],
        ureaMgDl: [''],
        hemoglobinGDl: [''],
        hematocritPercent: [''],
        redBloodCellsMillionUl: [''],
        whiteBloodCellsThousandUl: [''],
        plateletsThousandUl: [''],
        altSgptUL: [''],
        astSgotUL: [''],
        bilirubinTotalMgDl: [''],
        alkalinePhosphataseUL: [''],
        bunMgDl: [''],
        gfrMlMin: [''],
        totalProteinGDl: [''],
        albuminGDl: [''],
        sodiumMeqL: [''],
        potassiumMeqL: [''],
        chlorideMeqL: [''],
        cReactiveProteinMgL: [''],
        esrMmHr: [''],
        geneticMarkersDetected: [''],
        geneticQualityScore: [''],
        labReferenceValues: [''],
        analyzerModel: [''],
        centrifugationSpeedRpm: [''],
        storageTemperatureCelsius: ['']
      }),
      dnaData: this.fb.group({
        concentrationNgUl: [''],
        purity260280Ratio: [''],
        purity260230Ratio: [''],
        integrityNumber: [''],
        extractionMethod: [''],
        extractionDate: [''],
        extractionTechnician: [''],
        storageBuffer: [''],
        aliquotVolumeUl: [''],
        freezerLocation: [''],
        sequencingPlatform: [''],
        sequencingDepth: [''],
        libraryPrepProtocol: [''],
        totalReads: [''],
        mappedReads: [''],
        mappingQualityScore: [''],
        variantsDetected: [''],
        snpsDetected: [''],
        indelsDetected: [''],
        fastqR1Url: [''],
        fastqR2Url: [''],
        vcfFileUrl: [''],
        bamFileUrl: ['']
      }),
      salivaData: this.fb.group({
        volumeMl: [''],
        phLevel: [''],
        viscosity: [''],
        dnaYieldNg: [''],
        cellCountPerMl: [''],
        collectionMethod: [''],
        fastingStatus: [false],
        contaminationLevel: [''],
        preservativeUsed: [''],
        timeToProcessingHours: [''],
        storageTemperatureCelsius: ['']
      })
    });
  }

  private setupPatientSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.performPatientSearch(searchTerm);
    });
  }

  selectSampleType(type: 'BLOOD' | 'DNA' | 'SALIVA'): void {
    this.sampleType = type;
    this.sampleForm.patchValue({ type });
  }

  getSampleTitle(): string {
    const titles = {
      'BLOOD': 'Datos de análisis sanguíneo',
      'DNA': 'Datos de análisis genético',
      'SALIVA': 'Datos de análisis de saliva'
    };
    return (this.sampleType && titles.hasOwnProperty(this.sampleType))
      ? titles[this.sampleType as keyof typeof titles]
      : '';
  }

  onSearchPatients(): void {
    this.searchSubject.next(this.searchPatientTerm);
  }

  private performPatientSearch(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredPatients = [];
      return;
    }

    this.loadingPatients = true;
    const [firstName, ...lastNameArr] = searchTerm.trim().split(' ');
    const lastName = lastNameArr.join(' ');

    this.patientService.getPatientsByName(firstName, lastName).subscribe({
      next: (data) => {
        this.filteredPatients = data;
        this.loadingPatients = false;
      },
      error: (error) => {
        console.error('Error searching patients:', error);
        this.filteredPatients = [];
        this.loadingPatients = false;
      }
    });
  }

  selectPatient(patient: Patient): void {
    this.sampleForm.patchValue({ patientId: patient.id });
    this.filteredPatients = [];
    this.searchPatientTerm = `${patient.firstName} ${patient.lastName}`;
  }

  onSubmit(): void {
    if (this.sampleForm.invalid || !this.sampleType) {
      this.markFormGroupTouched(this.sampleForm);
      return;
    }

    this.loading = true;
    const formValue = this.sampleForm.value;

    // Create payload with only relevant data based on sample type
    const payload: any = {
      patientId: formValue.patientId,
      registeredById: formValue.registeredById,
      type: formValue.type,
      status: formValue.status,
      collectionDate: formValue.collectionDate,
      notes: formValue.notes
    };

    // Add type-specific data
    switch (formValue.type) {
      case 'BLOOD':
        payload.bloodData = this.cleanFormData(formValue.bloodData);
        break;
      case 'DNA':
        payload.dnaData = this.cleanFormData(formValue.dnaData);
        break;
      case 'SALIVA':
        payload.salivaData = this.cleanFormData(formValue.salivaData);
        break;
    }

    this.sampleService.registerSample(payload).subscribe({
      next: (response) => {
        this.showSuccessMessage('Muestra registrada exitosamente');
        this.resetForm();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error registering sample:', error);
        this.showErrorMessage('Error al registrar muestra. Por favor, inténtelo de nuevo.');
        this.loading = false;
      }
    });
  }

  private cleanFormData(data: any): any {
    // Remove empty string values and keep only meaningful data
    const cleaned: any = {};
    Object.keys(data).forEach(key => {
      if (data[key] !== '' && data[key] !== null && data[key] !== undefined) {
        cleaned[key] = data[key];
      }
    });
    return cleaned;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  private resetForm(): void {
    this.sampleForm.reset();
    this.sampleForm.patchValue({ status: 'PENDING' });
    this.sampleType = '';
    this.searchPatientTerm = '';
    this.filteredPatients = [];
  }

  private showSuccessMessage(message: string): void {
    // You can replace this with a proper notification service
    alert(message);
  }

  private showErrorMessage(message: string): void {
    // You can replace this with a proper notification service
    alert(message);
  }

  // Getter methods for form groups (used in template)
  get bloodGroup(): FormGroup {
    return this.sampleForm.get('bloodData') as FormGroup;
  }

  get dnaGroup(): FormGroup {
    return this.sampleForm.get('dnaData') as FormGroup;
  }

  get salivaGroup(): FormGroup {
    return this.sampleForm.get('salivaData') as FormGroup;
  }

  // Helper method to check if form control has error and is touched
  hasError(controlName: string): boolean {
    const control = this.sampleForm.get(controlName);
    return !!(control?.invalid && control?.touched);
  }

  // Helper method to get error message for a control
  getErrorMessage(controlName: string): string {
    const control = this.sampleForm.get(controlName);
    if (control?.errors?.['required']) {
      return 'Este campo es requerido';
    }
    return '';
  }
}