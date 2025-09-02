import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InsuranceService } from '../../../../core/services/insurance.service';
import { InsuranceQuote, InsuranceQuoteRequest } from '../../../../core/interfaces/insurance.interface';

@Component({
  selector: 'app-quote-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatButtonModule, 
    MatCheckboxModule,
    MatSliderModule,
    MatSnackBarModule
  ],
  templateUrl: './quote-form.component.html',
  styleUrl: './quote-form.component.css'
})
export class QuoteFormComponent implements OnInit {
  @Input() patientId!: string;
  @Input() medicalContext = false; // NUEVO INPUT AGREGADO
  @Output() quoteCreated = new EventEmitter<InsuranceQuote>();
  @Output() cancel = new EventEmitter<void>();

  quoteForm!: FormGroup;
  loading = false;
  submitted = false;

  coverageTypes = [
    { value: 'BASIC', label: 'Básico', description: 'Cobertura esencial para emergencias médicas' },
    { value: 'STANDARD', label: 'Estándar', description: 'Cobertura completa con consultas y especialistas' },
    { value: 'PREMIUM', label: 'Premium', description: 'Cobertura total incluyendo medicina preventiva' }
  ];

  coverageAmounts = [
    { value: 50000, label: '$50,000' },
    { value: 100000, label: '$100,000' },
    { value: 150000, label: '$150,000' },
    { value: 200000, label: '$200,000' },
    { value: 300000, label: '$300,000' },
    { value: 500000, label: '$500,000' }
  ];

  deductibleOptions = [
    { value: 500, label: '$500' },
    { value: 1000, label: '$1,000' },
    { value: 2000, label: '$2,000' },
    { value: 3000, label: '$3,000' },
    { value: 5000, label: '$5,000' }
  ];

  // Nuevas escalas según el backend
  exerciseFrequencyOptions = [
    { value: 0, label: '0 días', description: 'Sedentario', risk: '' },
    { value: 1, label: '1 día', description: 'Muy bajo', risk: '' },
    { value: 2, label: '2 días', description: 'Moderado', risk: '' },
    { value: 3, label: '3 días', description: 'Moderado', risk: '' },
    { value: 4, label: '4 días', description: 'Bueno', risk: '' },
    { value: 5, label: '5 días', description: 'Bueno', risk: '' },
    { value: 6, label: '6 días', description: 'Excelente', risk: '' },
    { value: 7, label: '7 días', description: 'Excelente', risk: '' }
  ];

  alcoholConsumptionOptions = [
    { value: 1, label: 'Abstinencia', description: 'No consumo alcohol', risk: '' },
    { value: 2, label: 'Muy bajo', description: 'Ocasional social', risk: '' },
    { value: 3, label: 'Bajo', description: 'Social regular', risk: '' },
    { value: 4, label: 'Bajo-Moderado', description: '1-2 veces/semana', risk: '' },
    { value: 5, label: 'Moderado', description: '3-4 veces/semana', risk: '' },
    { value: 6, label: 'Moderado-Alto', description: 'Frecuente', risk: '' },
    { value: 7, label: 'Alto', description: 'Diario moderado', risk: '' },
    { value: 8, label: 'Alto', description: 'Diario intenso', risk: '' },
    { value: 9, label: 'Muy alto', description: 'Excesivo', risk: '🚨' },
    { value: 10, label: 'Muy alto', description: 'Problemático', risk: '🚨' }
  ];

  occupationRiskOptions = [
    { value: 1, label: 'Muy bajo', description: 'Oficina/Remoto', risk: '' },
    { value: 2, label: 'Bajo', description: 'Supervisión/Ventas', risk: '' },
    { value: 3, label: 'Moderado', description: 'Educación/Comercio', risk: '' },
    { value: 4, label: 'Alto', description: 'Construcción/Industria', risk: '' },
    { value: 5, label: 'Muy alto', description: 'Minería/Altura', risk: '🚨' }
  ];

  familyHistoryRiskOptions = [
    { value: 1, label: 'Sin antecedentes', description: 'Historial familiar limpio', risk: '' },
    { value: 2, label: 'Riesgo bajo', description: 'Antecedentes menores', risk: '' },
    { value: 3, label: 'Riesgo moderado', description: 'Algunos antecedentes', risk: '' },
    { value: 4, label: 'Riesgo alto', description: 'Antecedentes significativos', risk: '' },
    { value: 5, label: 'Riesgo muy alto', description: 'Antecedentes graves', risk: '🚨' }
  ];

  constructor(
    private fb: FormBuilder,
    private insuranceService: InsuranceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.initializeForm();
    
    // NUEVO: Ajustar para contexto médico si es necesario
    if (this.medicalContext) {
      this.adjustForMedicalContext();
    }
  }

  // NUEVO MÉTODO: Ajustar para contexto médico
  adjustForMedicalContext() {
    // El médico puede tener mejor información inicial
    this.quoteForm.patchValue({
      lifestyleScore: 6, // Más conservador inicialmente
      exerciseFrequency: 3, // Promedio más realista
      alcoholConsumption: 2, // Más conservador
      occupationRiskLevel: 2,
      familyHistoryRisk: 3 // Más conservador hasta evaluación
    });
  }

  initializeForm() {
    this.quoteForm = this.fb.group({
      // Cobertura
      coverageType: ['STANDARD', Validators.required],
      coverageAmount: [150000, [Validators.required, Validators.min(10000)]],
      deductible: [2000, [Validators.required, Validators.min(500)]],
      
      // Estilo de vida y salud
      lifestyleScore: [7, [Validators.required, Validators.min(1), Validators.max(10)]],
      exerciseFrequency: [4, [Validators.required, Validators.min(0), Validators.max(7)]],
      smokingStatus: [false],
      alcoholConsumption: [3, [Validators.required, Validators.min(1), Validators.max(10)]],
      occupationRiskLevel: [2, [Validators.required, Validators.min(1), Validators.max(5)]],
      familyHistoryRisk: [2, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.quoteForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    const formValue = this.quoteForm.value;

    const quoteRequest: InsuranceQuoteRequest = {
      patientId: this.patientId,
      coverageType: formValue.coverageType,
      coverageAmount: formValue.coverageAmount,
      deductible: formValue.deductible,
      lifestyleScore: formValue.lifestyleScore,
      exerciseFrequency: formValue.exerciseFrequency,
      smokingStatus: formValue.smokingStatus || false,
      alcoholConsumption: formValue.alcoholConsumption,
      occupationRiskLevel: formValue.occupationRiskLevel,
      familyHistoryRisk: formValue.familyHistoryRisk
    };

    this.insuranceService.requestQuote(quoteRequest).subscribe({
      next: (quote) => {
        this.loading = false;
        
        // Mensaje diferente según contexto
        const message = this.medicalContext 
          ? 'Evaluación médica de seguros completada exitosamente'
          : 'Cotización generada exitosamente';
          
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
        this.quoteCreated.emit(quote);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error creating quote:', error);
        
        const errorMessage = this.medicalContext
          ? 'Error al generar la evaluación médica'
          : 'Error al generar la cotización';
          
        this.snackBar.open(errorMessage, 'Cerrar', { duration: 3000 });
      }
    });
  }

  onCancel() {
    this.cancel.emit();
  }

  markFormGroupTouched() {
    Object.keys(this.quoteForm.controls).forEach(key => {
      const control = this.quoteForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.quoteForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
      if (field.errors['max']) return `Valor máximo: ${field.errors['max'].max}`;
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.quoteForm.get(fieldName);
    return !!(field?.invalid && (field.dirty || field.touched || this.submitted));
  }

  // Helpers para mostrar información de riesgo
  getLifestyleScoreDescription(score: number): string {
    if (score >= 8) return 'Excelente ';
    if (score >= 6) return 'Bueno ';
    if (score >= 4) return 'Regular ';
    return 'Pobre ';
  }

  getExerciseDescription(frequency: number): string {
    const option = this.exerciseFrequencyOptions.find(opt => opt.value === frequency);
    return option ? `${option.description} ${option.risk}` : '';
  }

  getAlcoholDescription(consumption: number): string {
    const option = this.alcoholConsumptionOptions.find(opt => opt.value === consumption);
    return option ? `${option.description} ${option.risk}` : '';
  }

  getOccupationDescription(risk: number): string {
    const option = this.occupationRiskOptions.find(opt => opt.value === risk);
    return option ? `${option.description} ${option.risk}` : '';
  }

  getFamilyHistoryDescription(risk: number): string {
    const option = this.familyHistoryRiskOptions.find(opt => opt.value === risk);
    return option ? `${option.description} ${option.risk}` : '';
  }

  // Calcular impacto estimado en la prima
  get estimatedPremiumImpact(): string {
    const form = this.quoteForm.value;
    let discount = 0;

    // Smoking status
    if (!form.smokingStatus) discount += 30;

    // Exercise frequency
    if (form.exerciseFrequency >= 6) discount += 17;
    else if (form.exerciseFrequency >= 4) discount += 12;
    else if (form.exerciseFrequency >= 2) discount += 5;

    // Lifestyle score
    if (form.lifestyleScore >= 8) discount += 11;
    else if (form.lifestyleScore >= 6) discount += 8;
    else if (form.lifestyleScore >= 4) discount += 3;

    // Occupation risk
    if (form.occupationRiskLevel <= 2) discount += 15;
    else if (form.occupationRiskLevel === 3) discount += 5;

    // Family history
    if (form.familyHistoryRisk <= 2) discount += 10;
    else if (form.familyHistoryRisk === 3) discount += 3;

    // Alcohol consumption (neutral for 1-4, penalty for higher)
    if (form.alcoholConsumption >= 7) discount -= 10;
    else if (form.alcoholConsumption >= 5) discount -= 5;

    return discount > 0 ? `-${discount}%` : `${Math.abs(discount)}%`;
  }
}