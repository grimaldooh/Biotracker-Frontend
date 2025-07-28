import { Routes } from '@angular/router';

export const routes: Routes = [
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
  { path: '', redirectTo: 'patients/register', pathMatch: 'full' },
  { path: '**', redirectTo: 'patients/register' }
];
