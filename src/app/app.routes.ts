import { Routes } from '@angular/router';
import { BaseLayoutComponent } from './shared/layouts/base-layout/base-layout.component';
import { CreateLabAppointmentComponent } from './modules/reception/create-lab-appointment/create-lab-appointment.component';
import { LabAppointmentsListComponent } from './modules/reception/lab-appointments-list/lab-appointments-list.component';
import { MyAppointmentsComponent } from './modules/patient/my-appointments/my-appointments.component';
import { ReportViewerComponent } from './modules/patient/report-viewer/report-viewer.component';
import { TechnicalReportComponent } from './modules/patient/technical-report/technical-report.component';
import { AuthLayoutComponent } from './shared/layouts/auth-layout/auth-layout.component';
import { LoginComponent } from './modules/auth/login/login.component';
import { RegisterPatientComponent } from './modules/patients/register-patient/register-patient.component';
import { RegisterUserComponent } from './modules/users/register-user/register-user.component';

export const routes: Routes = [
  // Rutas de autenticación (sin sidebar)
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'signup/patient', component: RegisterPatientComponent },
      { path: 'signup/user', component: RegisterUserComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    component: BaseLayoutComponent,
    children: [
      {
        path: 'patients/register',
        loadComponent: () =>
          import('./modules/patients/register-patient/register-patient.component')
            .then(m => m.RegisterPatientComponent)
      },
      {
        path: 'reception/dashboard',
        loadComponent: () =>
          import('./modules/reception/dashboard/dashboard.component')
            .then(m => m.DashboardRecepcionComponent)
      },
      {
        path: 'patients',
        loadComponent: () =>
          import('./modules/patients/patients-list/patients-list.component')
            .then(m => m.PatientsListComponent)
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./modules/appointments/appointments-list/appointments-list.component')
            .then(m => m.AppointmentsListComponent)
      },
      {
        path: 'medical-visits/patient/:patientId',
        loadComponent: () =>
          import('./modules/appointments/patient-visits/patient-visits.component')
            .then(m => m.PatientVisitsComponent)
      },
      {
        path: 'samples',
        loadComponent: () =>
          import('./modules/samples/samples-list/samples-list.component')
            .then(m => m.SamplesListComponent)
      },
      {
        path: 'samples/patient/:patientId',
        loadComponent: () =>
          import('./modules/samples/patient-samples/patient-samples.component')
            .then(m => m.PatientSamplesComponent)
      },
      {
        path: 'appointments/create',
        loadComponent: () =>
          import('./modules/appointments/create-appointment/create-appointment.component')
            .then(m => m.CreateAppointmentComponent)
      },
      {
        path: 'inventory',
        loadComponent: () =>
          import('./modules/inventory/inventory.component')
            .then(m => m.InventoryComponent)
      },
      {
        path: 'users/register',
        loadComponent: () =>
          import('./modules/users/register-user/register-user.component')
            .then(m => m.RegisterUserComponent)
      },
      {
        path: 'lab/dashboard',
        loadComponent: () =>
          import('./modules/lab/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'lab/register-sample',
        loadComponent: () =>
          import('./modules/lab/register-sample/register-sample.component')
            .then(m => m.RegisterSampleComponent)
      },
      {
        path: 'patient/home',
        loadComponent: () =>
          import('./modules/patient/home/home.component')
            .then(m => m.HomeComponent)

      },
      {
        path: 'patient/smart-report',
        loadComponent: () =>
          import('./modules/patient/smart-report/smart-report.component').then(m => m.SmartReportComponent)
      },
      {
        path: 'patient/samples',
        loadComponent: () =>
          import('./modules/patient/samples/samples.component').then(m => m.SamplesComponent)
      },
      {
        path: 'patient/appointments-historial',
        loadComponent: () =>
          import('./modules/patient/appointments-historial/appointments-historial.component')
            .then(m => m.AppointmentsHistorialComponent)
      },
      {
        path: 'patient/schedule',
        loadComponent: () =>
          import('./modules/patient/schedule/schedule.component').then(m => m.ScheduleComponent)
      },
      {
        path: 'doctors/dashboard',
        loadComponent: () =>
          import('./modules/doctors/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'doctor/schedule-appointments',
        loadComponent: () =>
          import('./modules/doctors/schedule-appointments/schedule-appointments.component').then(m => m.ScheduleAppointmentsComponent)
      },
      {
        path: 'doctors/visit-management/:id',
        loadComponent: () =>
          import('./modules/doctors/visit-management/visit-management.component').then(m => m.VisitManagementComponent)
      },
      {
        path: 'doctors/visit-history',
        loadComponent: () =>
          import('./modules/doctors/visit-history/visit-history.component').then(m => m.VisitHistoryComponent)
      },
      {
        path: 'doctors/new-appointment',
        loadComponent: () =>
          import('./modules/doctors/new-appointment/new-appointment.component').then(m => m.NewAppointmentComponent)
      },
      {
        path: 'lab/pending-appointments',
        loadComponent: () =>
          import('./modules/lab/pending-appointments/pending-appointments.component').then(m => m.PendingAppointmentsComponent)
      },
      {
        path: 'lab/process-appointment',
        loadComponent: () =>
          import('./modules/lab/process-appointment/process-appointment.component').then(m => m.ProcessAppointmentComponent)
      },
      {
        path: 'lab/edit-sample/:id',
        loadComponent: () =>
          import('./modules/lab/edit-sample/edit-sample.component').then(m => m.EditSampleComponent)
      },
      {
        path: 'lab/upload-mutations',
        loadComponent: () => import('./modules/lab//upload-mutations/upload-mutations.component').then(m => m.UploadMutationsComponent)
      },
      {
        path: 'doctors/ai-report',
        loadComponent: () => import('./modules/doctors/ai-report/ai-report.component').then(m => m.AiReportComponent)
      },
      {
        path: 'reception/create-lab-appointment',
        loadComponent: () =>
          import('./modules/reception/create-lab-appointment/create-lab-appointment.component')
            .then(m => m.CreateLabAppointmentComponent)
      },
      {
        path: 'reception/lab-appointments-list',
        loadComponent: () =>
          import('./modules/reception/lab-appointments-list/lab-appointments-list.component')
            .then(m => m.LabAppointmentsListComponent)
      },
      {
        path: 'patient/my-appointments',
        loadComponent: () =>
          import('./modules/patient/my-appointments/my-appointments.component')
            .then(m => m.MyAppointmentsComponent)
      },
      {
        path: 'patient/report',
        loadComponent: () =>
          import('./modules/patient/report-viewer/report-viewer.component')
            .then(m => m.ReportViewerComponent)
      },
      {
        path: 'patient/technical-report',
        loadComponent: () =>
          import('./modules/patient/technical-report/technical-report.component')
            .then(m => m.TechnicalReportComponent)
      },
      {
        path: 'patient/genetic-tests',
        loadComponent: () =>
          import('./modules/patient/genetic-tests/genetic-tests.component')
            .then(m => m.GeneticTestsComponent)
      },
      {
        path: 'patient/genetic-report',
        loadComponent: () =>
          import('./modules/patient/genetic-report-viewer/genetic-report-viewer.component')
            .then(m => m.GeneticReportViewerComponent)
      }
    ]
  },
  { path: '', redirectTo: 'patients/register', pathMatch: 'full' },
  { path: '**', redirectTo: 'patients/register' }
];
