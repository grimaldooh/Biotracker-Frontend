import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Observable, forkJoin, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, map, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../../shared/services/auth.service'; // Importa AuthService

interface MedicalVisit {
  id: string;
  patientName: string;
  doctorName: string;
  visitDate: string;
  notes: string | null;
  diagnosis: string | null;
  recommendations: string | null;
  medicalEntityId: string;
  visitCompleted: boolean;
  type: string;
  medicalArea: string | null;
}

interface AppointmentsState {
  pending: MedicalVisit[];
  completed: MedicalVisit[];
  loading: boolean;
  error: string | null;
}

const VISIT_TYPE_LABELS: Record<string, string> = {
  CONSULTATION: 'Consulta',
  FOLLOW_UP: 'Seguimiento',
  SURGERY: 'Cirugía',
  EMERGENCY: 'Emergencia',
  OTHER: 'Otro'
};

@Component({
  selector: 'app-appointments-historial',
  standalone: true,
  templateUrl: './appointments-historial.component.html',
  styleUrl: './appointments-historial.component.css',
  imports: [CommonModule]
})
export class AppointmentsHistorialComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly baseUrl = 'http://localhost:8080/api/medical-visits';

  // IDs dinámicos
  private readonly patientId: string | null;

  // Estado reactivo
  private state$ = new BehaviorSubject<AppointmentsState>({
    pending: [],
    completed: [],
    loading: false,
    error: null
  });

  // Getters para el template
  get pending$(): Observable<MedicalVisit[]> {
    return this.state$.pipe(map(state => state.pending));
  }

  get completed$(): Observable<MedicalVisit[]> {
    return this.state$.pipe(map(state => state.completed));
  }

  get loading$(): Observable<boolean> {
    return this.state$.pipe(map(state => state.loading));
  }

  get error$(): Observable<string | null> {
    return this.state$.pipe(map(state => state.error));
  }

  constructor(
    private http: HttpClient,
    private authService: AuthService // Inyecta AuthService
  ) {
    // Obtén el patientId dinámicamente del usuario autenticado
    this.patientId = this.authService.getCurrentUserId();
  }

  ngOnInit(): void {
    this.loadAppointments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAppointments(): void {
    this.updateState({ loading: true, error: null });

    if (!this.patientId) {
      this.updateState({ 
        error: 'No se pudo obtener el ID del paciente. Inicia sesión nuevamente.',
        loading: false
      });
      return;
    }

    const pending$ = this.http.get<MedicalVisit[]>(`${this.baseUrl}/patient/${this.patientId}/pending`)
      .pipe(catchError(() => of([])));

    const all$ = this.http.get<MedicalVisit[]>(`${this.baseUrl}/patient/${this.patientId}`)
      .pipe(
        map(visits => visits.filter(v => v.visitCompleted)),
        catchError(() => of([]))
      );

    forkJoin([pending$, all$])
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.updateState({ loading: false }))
      )
      .subscribe({
        next: ([pending, completed]) => {
          this.updateState({ pending, completed });
        },
        error: () => {
          this.updateState({ 
            error: 'Error al cargar las citas médicas. Inténtalo nuevamente.' 
          });
        }
      });
  }

  private updateState(updates: Partial<AppointmentsState>): void {
    const currentState = this.state$.value;
    this.state$.next({ ...currentState, ...updates });
  }

  // Método para recargar datos
  refresh(): void {
    this.loadAppointments();
  }

  // Método para formatear fecha
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // TrackBy function para optimizar ngFor
  trackByVisitId(index: number, visit: MedicalVisit): string {
    return visit.id;
  }

  getVisitTypeLabel(type: string): string {
    return VISIT_TYPE_LABELS[type] || type;
  }
}