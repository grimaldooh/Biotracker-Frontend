import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule , FormsModule} from '@angular/forms';
import { SampleService } from '../../../core/services/sample.service';
import { CommonModule } from '@angular/common';
import { Patient } from '../../patients/patient.model';
import { PatientService } from '../../../core/services/patient.service';

@Component({
  selector: 'app-register-sample',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './register-sample.component.html',
  styleUrl: './register-sample.component.css'
})
export class RegisterSampleComponent {
  sampleType: 'BLOOD' | 'DNA' | 'SALIVA' | '' = '';
  sampleForm: FormGroup;
  loading = false;

  searchPatientTerm = '';
  filteredPatients: Patient[] = [];
  loadingPatients = false;

  constructor(private fb: FormBuilder, private sampleService: SampleService, private patientService: PatientService) {
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
        timeToProcessingHours: ['']
      })
    });
  }

  selectType(type: 'BLOOD' | 'DNA' | 'SALIVA') {
    this.sampleType = type;
    this.sampleForm.patchValue({ type });
  }

  submit() {
    if (this.sampleForm.invalid) return;
    this.loading = true;
    const value = this.sampleForm.value;
    // Solo envía el objeto correspondiente según el tipo
    const payload: any = {
      patientId: value.patientId,
      registeredById: value.registeredById,
      type: value.type,
      status: value.status,
      collectionDate: value.collectionDate,
      notes: value.notes
    };
    if (value.type === 'BLOOD') payload.bloodData = value.bloodData;
    if (value.type === 'DNA') payload.dnaData = value.dnaData;
    if (value.type === 'SALIVA') payload.salivaData = value.salivaData;

    this.sampleService.registerSample(payload).subscribe({
      next: () => {
        alert('Muestra registrada exitosamente');
        this.sampleForm.reset();
        this.sampleType = '';
        this.loading = false;
      },
      error: () => {
        alert('Error al registrar muestra');
        this.loading = false;
      }
    });
  }

  searchPatients() {
    if (!this.searchPatientTerm.trim()) {
      this.filteredPatients = [];
      return;
    }
    this.loadingPatients = true;
    const [firstName, ...lastNameArr] = this.searchPatientTerm.trim().split(' ');
    const lastName = lastNameArr.join(' ');
    this.patientService.getPatientsByName(firstName, lastName).subscribe({
      next: (data) => {
        this.filteredPatients = data;
        this.loadingPatients = false;
      },
      error: () => {
        this.loadingPatients = false;
      }
    });
  }

  selectPatient(patient: Patient) {
    this.sampleForm.patchValue({ patientId: patient.id });
    this.filteredPatients = [];
    this.searchPatientTerm = `${patient.firstName} ${patient.lastName}`;
  }

  get bloodGroup(): FormGroup {
    return this.sampleForm.get('bloodData') as FormGroup;
  }
  get dnaGroup(): FormGroup {
    return this.sampleForm.get('dnaData') as FormGroup;
  }
  get salivaGroup(): FormGroup {
    return this.sampleForm.get('salivaData') as FormGroup;
  }
}
