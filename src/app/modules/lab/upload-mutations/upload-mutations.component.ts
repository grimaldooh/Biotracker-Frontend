import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface Mutation {
  gene: string;
  chromosome: string;
  type: string;
  relevance: string;
  comment: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  identificationNumber: string;
  birthDate: string;  
}

interface MutationDTO {
  id?: string; // UUID, opcional para creación
  gene: string;
  chromosome: string;
  type: string;
  relevance: string; // Esto será un enum en el backend
  comment: string;
  geneticSampleId?: string; // UUID, se asigna en el backend
}

interface CreateGeneticSampleRequest {
  id?: string; // UUID, opcional para creación
  patientId: string;
  registeredById: string;
  type: string; // SampleType enum
  status: string; // SampleStatus enum
  medicalEntityId: string;
  collectionDate: string; // LocalDate
  notes: string;
  createdAt?: string; // LocalDate, se asigna en el backend
  mutations: MutationDTO[];
  confidenceScore: number; // BigDecimal
  processingSoftware: string;
  referenceGenome: string;
  mutationCount: number; // Integer
}

interface GeneticSampleResponse {
  id: string;
  patientId: string;
  registeredById: string;
  type: string;
  status: string;
  medicalEntityId: string;
  collectionDate: string;
  notes: string;
  createdAt: string;
  mutations: MutationDTO[];
  confidenceScore: number;
  processingSoftware: string;
  referenceGenome: string;
  mutationCount: number;
}

interface ResultFileDTO {
  id: string;
  fileName: string;
  s3Url: string;
  uploadedAt: string;
  sampleId: string;
}

@Component({
  selector: 'app-upload-mutations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './upload-mutations.component.html',
})
export class UploadMutationsComponent implements OnInit {
  sampleForm!: FormGroup;
  mutationsForm!: FormGroup;
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  selectedPatient: Patient | null = null;
  searchingPatients = false;
  showPatientDropdown = false;
  loading = false;
  submitting = false;
  processing = false;
  selectedFile: File | null = null;
  uploadMode: 'file' | 'manual' = 'manual';
  
  mutationTypes = ['SNV', 'DELETION', 'INSERTION', 'DUPLICATION', 'INVERSION'];
  relevanceLevels = ['HIGH', 'MEDIUM', 'LOW'];
  
  // Cromosomas válidos
  chromosomes = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
    '21', '22', 'X', 'Y', 'MT'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadPatients();
    this.setupPatientSearch();
  }

  private loadPatients() {
    this.loading = true;
    this.http.get<Patient[]>('http://localhost:8080/api/hospitals/00d79e66-4457-4d27-9228-fe467823ce8e/patients')
      .subscribe({
        next: (patients) => {
          this.patients = patients;
          this.loading = false;
        },
        error: (error) => {
          //console.error('Error loading patients:', error);
          this.loading = false;
          alert('Error al cargar los pacientes');
        }
      });
  }

  private initializeForms() {
    // Formulario para crear la muestra
    this.sampleForm = this.fb.group({
      patientSearch: ['', Validators.required],
      patientId: ['', Validators.required],
      collectionDate: [new Date().toISOString().split('T')[0], Validators.required],
      notes: [''],
      mutationsData: this.fb.group({
        mutationCount: [0, [Validators.required, Validators.min(1)]],
        analysisConfidenceScore: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
        processingSoftware: ['MutAnalyzer v2.1', Validators.required],
        referenceGenome: ['GRCh38', Validators.required]
      })
    });

    // Formulario para las mutaciones manuales
    this.mutationsForm = this.fb.group({
      mutations: this.fb.array([])
    });

    // Agregar una mutación inicial
    this.addMutation();
  }

  get mutationsArray(): FormArray {
    return this.mutationsForm.get('mutations') as FormArray;
  }

  private setupPatientSearch() {
    const patientSearchControl = this.sampleForm.get('patientSearch');
    
    if (patientSearchControl) {
      patientSearchControl.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe({
        next: (searchTerm) => {
          this.searchPatientsLocally(searchTerm);
        },
        error: (error) => {
          //console.error('Error in search:', error);
        }
      });
    }
  }

  private searchPatientsLocally(searchTerm: string) {
    if (searchTerm && searchTerm.length >= 2) {
      this.searchingPatients = true;
      
      // Simular delay para mejor UX
      setTimeout(() => {
        const term = searchTerm.toLowerCase().trim();
        
        this.filteredPatients = this.patients.filter(patient => {
          // Validar que las propiedades existan antes de hacer toLowerCase
          const firstName = patient.firstName?.toLowerCase() || '';
          const lastName = patient.lastName?.toLowerCase() || '';
          const fullName = `${firstName} ${lastName}`.trim();
          const birthDate = patient.birthDate?.toLowerCase() || '';
          
          return fullName.includes(term) || 
                 birthDate.includes(term) ||
                 firstName.includes(term) ||
                 lastName.includes(term);
        });
        
        this.showPatientDropdown = this.filteredPatients.length > 0;
        this.searchingPatients = false;
      }, 200);
    } else {
      this.filteredPatients = [];
      this.showPatientDropdown = false;
      this.searchingPatients = false;
    }
  }

  selectPatient(patient: Patient) {
    this.selectedPatient = patient;
    this.sampleForm.patchValue({
      patientSearch: this.getPatientLabel(patient),
      patientId: patient.id
    });
    this.showPatientDropdown = false;
    this.filteredPatients = [];
  }

  clearPatientSelection() {
    this.selectedPatient = null;
    this.sampleForm.patchValue({
      patientSearch: '',
      patientId: ''
    });
    this.showPatientDropdown = false;
    this.filteredPatients = [];
  }

  onPatientSearchFocus() {
    if (this.filteredPatients.length > 0) {
      this.showPatientDropdown = true;
    }
  }

  onPatientSearchBlur() {
    // Delay hiding dropdown to allow click selection
    setTimeout(() => {
      this.showPatientDropdown = false;
    }, 200);
  }

  addMutation() {
    const mutationGroup = this.fb.group({
      gene: ['', Validators.required],
      chromosome: ['', Validators.required],
      type: ['', Validators.required],
      relevance: ['', Validators.required],
      comment: ['', Validators.required]
    });

    this.mutationsArray.push(mutationGroup);
    
    // Actualizar el contador de mutaciones
    this.updateMutationCount();
  }

  removeMutation(index: number) {
    if (this.mutationsArray.length > 1) {
      this.mutationsArray.removeAt(index);
      this.updateMutationCount();
    }
  }

  private updateMutationCount() {
    const count = this.mutationsArray.length;
    this.sampleForm.get('mutationsData.mutationCount')?.setValue(count);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      this.selectedFile = file;
      
      // Contar líneas del archivo para estimar mutaciones
      this.countFileLines(file);
    } else {
      alert('Por favor selecciona un archivo CSV válido');
      event.target.value = '';
    }
  }

  private countFileLines(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      // Restar 1 por el header
      const mutationCount = Math.max(0, lines.length - 1);
      this.sampleForm.get('mutationsData.mutationCount')?.setValue(mutationCount);
    };
    reader.readAsText(file);
  }
  

  // Crear muestra con archivo CSV
  async createSampleWithFile() {
    if (this.sampleForm.invalid || !this.selectedFile) {
      this.markFormGroupTouched(this.sampleForm);
      alert('Por favor completa todos los campos requeridos y selecciona un archivo');
      return;
    }

    this.submitting = true;

    try {
      // 1. Parsear el archivo CSV para obtener las mutaciones
      const mutations = await this.parseCSVFile(this.selectedFile);
      
      // 2. Crear la muestra con las mutaciones incluidas
      const sampleData = this.prepareSampleData(mutations);
      //console.log('Datos de la muestra a crear:', sampleData);
      const createdSample = await this.http.post<GeneticSampleResponse>('http://localhost:8080/api/genetic-samples', sampleData).toPromise();
      //aqui si se estan creando bien las mutaciones 
      if (createdSample) {
        alert('Muestra genética creada exitosamente con las mutaciones del archivo CSV');
        this.resetForms();
      }
    } catch (error) {
      //console.error('Error creating genetic sample with file:', error);
      alert('Error al crear la muestra genética y procesar el archivo');
    } finally {
      this.submitting = false;
    }
  }

  // Crear muestra con mutaciones manuales
  async createSampleWithManualMutations() {
    if (this.sampleForm.invalid || this.mutationsForm.invalid) {
      this.markFormGroupTouched(this.sampleForm);
      this.markFormGroupTouched(this.mutationsForm);
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    this.submitting = true;

    try {
      // 1. Preparar las mutaciones desde el formulario
      const mutations = this.mutationsArray.value as MutationDTO[];
      //console.log('Mutations to be created:', mutations);
      
      // 2. Crear la muestra con las mutaciones incluidas
      const sampleData = this.prepareSampleData(mutations);
      //console.log('Sample data to be created:', sampleData);
      const createdSample = await this.http.post<GeneticSampleResponse>('http://localhost:8080/api/genetic-samples', sampleData).toPromise();
      
      if (createdSample) {
        alert('Muestra genética creada exitosamente con las mutaciones registradas');
        this.resetForms();
      }
    } catch (error) {
      //console.error('Error creating genetic sample:', error);
      alert('Error al crear la muestra genética');
    } finally {
      this.submitting = false;
    }
  }

  private prepareSampleData(mutations: MutationDTO[] = []): CreateGeneticSampleRequest {
    const formValue = this.sampleForm.value;
    
    // Preparar las mutaciones sin id ni geneticSampleId (se asignan en el backend)
    const preparedMutations = mutations.map(mutation => ({
      gene: mutation.gene,
      chromosome: mutation.chromosome,
      type: mutation.type,
      relevance: mutation.relevance,
      comment: mutation.comment
      // id y geneticSampleId se asignan automáticamente en el backend
    }));
    
    return {
      patientId: formValue.patientId,
      registeredById: 'c332337f-ea0f-48b1-a1a6-9dac44364343', // ID hardcodeado
      type: 'MUTATIONS', // SampleType enum
      status: 'PENDING', // SampleStatus enum
      medicalEntityId: '00d79e66-4457-4d27-9228-fe467823ce8e', // ID hardcodeado
      collectionDate: formValue.collectionDate,
      notes: formValue.notes || 'Sample for targeted mutation analysis',
      mutations: preparedMutations,
      confidenceScore: formValue.mutationsData.analysisConfidenceScore,
      processingSoftware: formValue.mutationsData.processingSoftware,
      referenceGenome: formValue.mutationsData.referenceGenome,
      mutationCount: formValue.mutationsData.mutationCount
      // id y createdAt se asignan automáticamente en el backend
    };
  }

  private async uploadFileForSample(sampleId: string, file?: File): Promise<void> {
    const fileToUpload = file || this.selectedFile;
    
    if (!fileToUpload) {
      throw new Error('No file to upload');
    }

    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('sampleId', sampleId);

    const resultFile = await this.http.post<ResultFileDTO>('http://localhost:8080/api/result-files/upload', formData).toPromise();
    
    if (resultFile) {
      await this.processMutations(resultFile.id);
    }
  }

  private generateCSV(mutations: Mutation[]): string {
    const headers = ['gene', 'chromosome', 'type', 'relevance', 'comment'];
    const csvRows = [
      headers.join('\t'), // Header con tabs
      ...mutations.map(mutation => [
        mutation.gene,
        mutation.chromosome,
        mutation.type,
        mutation.relevance,
        mutation.comment
      ].join('\t'))
    ];
    
    return csvRows.join('\n');
  }

  private async processMutations(resultFileId: string): Promise<void> {
    this.processing = true;
    try {
      await this.http.post(`http://localhost:8080/api/mutations/process?resultFileId=${resultFileId}`, {}).toPromise();
    } catch (error) {
      //console.error('Error processing mutations:', error);
      throw error;
    } finally {
      this.processing = false;
    }
  }

  private resetForms() {
    this.sampleForm.reset({
      collectionDate: new Date().toISOString().split('T')[0],
      mutationsData: {
        mutationCount: 0,
        analysisConfidenceScore: 0,
        processingSoftware: 'MutAnalyzer v2.1',
        referenceGenome: 'GRCh38'
      }
    });
    
    this.selectedFile = null;
    this.selectedPatient = null;
    this.filteredPatients = [];
    this.showPatientDropdown = false;
    
    // Limpiar el array de mutaciones y agregar una nueva
    while (this.mutationsArray.length > 0) {
      this.mutationsArray.removeAt(0);
    }
    this.addMutation();
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  goBack() {
    this.router.navigate(['/lab/dashboard']);
  }

  getPatientLabel(patient: Patient): string {
    const firstName = patient.firstName || '';
    const lastName = patient.lastName || '';
    const identificationNumber = patient.identificationNumber || '';
    
    return `${firstName} ${lastName} - ${identificationNumber}`.trim();
  }

  downloadTemplate() {
    const templateCSV = `gene,chromosome,type,relevance,comment
BRCA1,17,SNV,HIGH,Pathogenic variant associated with hereditary breast and ovarian cancer
TP53,17,DELETION,HIGH,Tumor suppressor gene variant Li-Fraumeni syndrome
CFTR,7,INSERTION,MEDIUM,Cystic fibrosis transmembrane conductance regulator variant`;

    const blob = new Blob([templateCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mutations_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  isFormValid(): boolean {
    if (this.uploadMode === 'file') {
      return this.sampleForm.valid && !!this.selectedFile;
    } else {
      return this.sampleForm.valid && this.mutationsForm.valid && this.mutationsArray.length > 0;
    }
  }

  private parseCSVFile(file: File): Promise<MutationDTO[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim() !== '');
          
          if (lines.length <= 1) {
            reject(new Error('El archivo CSV debe contener al menos una línea de datos además del header'));
            return;
          }
          
          // Saltar el header (primera línea)
          const dataLines = lines.slice(1);
          
          const mutations: MutationDTO[] = [];
          
          dataLines.forEach((line, index) => {
            // Detectar automáticamente el separador: tabs o comas
            let columns: string[];
            if (line.includes('\t')) {
              // Si tiene tabs, usar tabs
              columns = line.split('\t').map(col => col.trim());
            } else {
              // Si no tiene tabs, usar comas
              columns = line.split(',').map(col => col.trim());
            }
            
            if (columns.length < 5) {
              throw new Error(`Línea ${index + 2}: Se esperan 5 columnas separadas por comas o tabs. Encontradas: ${columns.length}`);
            }
            
            mutations.push({
              gene: columns[0],
              chromosome: columns[1],
              type: columns[2],
              relevance: columns[3],
              comment: columns[4]
            });
          });
          
          //console.log(`✅ Archivo CSV procesado exitosamente. ${mutations.length} mutaciones encontradas.`);
          resolve(mutations);
        } catch (error) {
          //console.error('Error parsing CSV:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };
      
      reader.readAsText(file);
    });
  }
}