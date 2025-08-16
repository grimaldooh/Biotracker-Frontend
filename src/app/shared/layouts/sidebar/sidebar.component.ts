import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SidebarConfig, MenuItem } from '../../interfaces/sidebar.interface';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  @Input() userRole: string = '';
  
  sidebarConfig: SidebarConfig = {
    title: '',
    menuItems: []
  };

  isMobileMenuOpen = false;


  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.loadSidebarConfig();
  }

  openMobileMenu(): void {
    this.isMobileMenuOpen = true;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  private loadSidebarConfig() {
    switch (this.userRole.toUpperCase()) {
      case 'RECEPTIONIST':
        this.sidebarConfig = this.getReceptionConfig();
        break;
      case 'MEDIC':
        this.sidebarConfig = this.getMedicConfig();
        break;
      case 'LAB_TECHNICIAN':
        this.sidebarConfig = this.getLabConfig();
        break;
      case 'PATIENT':
        this.sidebarConfig = this.getPatientConfig();
        break;
      default:
        this.sidebarConfig = this.getDefaultConfig();
    }
  }

  private getReceptionConfig(): SidebarConfig {
    return {
      title: 'Panel de Recepción',
      menuItems: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: 'M3,13H11V3H3M3,21H11V15H3M13,21H21V11H13M13,3V9H21V3',
          route: '/reception/dashboard',
          isActive: false
        },
        {
          id: 'patients',
          label: 'Pacientes',
          icon: 'M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z',
          route: '/patients',
          isActive: false,
          children: [
            {
              id: 'register-patient',
              label: 'Registrar Paciente',
              icon: 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z',
              route: '/patients/register',
              isActive: false
            },
            {
              id: 'patients-list',
              label: 'Lista de Pacientes',
              icon: 'M16,4C18.21,4 20,5.79 20,8C20,10.21 18.21,12 16,12C13.79,12 12,10.21 12,8C12,5.79 13.79,4 16,4M16,14C20.42,14 24,15.79 24,18V20H8V18C8,15.79 11.58,14 16,14',
              route: '/patients',
              isActive: false
            }
          ]
        },
        {
          id: 'appointments',
          label: 'Citas',
          icon: 'M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1',
          route: '/appointments',
          isActive: false,
          children: [
            {
              id: 'create-appointment',
              label: 'Crear Cita',
              icon: 'M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2',
              route: '/appointments/create',
              isActive: false
            },
            {
              id: 'appointments-list',
              label: 'Lista de Citas',
              icon: 'M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2',
              route: '/appointments',
              isActive: false
            },
            {
              id: 'create-lab-appointment',
              label: 'Crear Cita de Laboratorio',
              icon: 'M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2',
              route: '/reception/create-lab-appointment',
              isActive: false
            },
            {
              id: 'lab-appointments-list',
              label: 'Citas de Laboratorio',
              icon: 'M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2',
              route: '/reception/lab-appointments-list',
              isActive: false
            }

          ]
        },
        {
          id: 'samples',
          label: 'Muestras',
          icon: 'M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3',
          route: '/samples',
          isActive: false
        },
        {
          id: 'inventory',
          label: 'Inventario',
          icon: 'M12,18H6V14H12M21,14V12L20,7H4L3,12V14H4V20H14V14H18V20H20V14',
          route: '/inventory',
          isActive: false
        },
        {
          id: 'users',
          label: 'Usuarios',
          icon: 'M15,14C12.33,14 7,15.33 7,18V20H23V18C23,15.33 17.67,14 15,14M15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12',
          route: '/users/register',
          isActive: false
        }
      ]
    };
  }

  private getMedicConfig(): SidebarConfig {
    return {
      title: 'Panel Médico',
      menuItems: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: 'M3,13H11V3H3M3,21H11V15H3M13,21H21V11H13M13,3V9H21V3',
          route: '/doctors/dashboard',
          isActive: false
        },
        {
          id: 'appointments',
          label: 'Citas',
          icon: 'M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1',
          route: '/doctor/schedule-appointments',
          isActive: false
        },
        {
          id: 'visit-history',
          label: 'Historial de Visitas',
          icon: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2',
          route: '/doctors/visit-history',
          isActive: false
        },
        {
          id: 'ai-report',
          label: 'Reportes IA',
          icon: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2',
          route: '/doctors/ai-report',
          isActive: false
        }
      ]
    };
  }

  private getLabConfig(): SidebarConfig {
    return {
      title: 'Panel de Laboratorio',
      menuItems: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: 'M3,13H11V3H3M3,21H11V15H3M13,21H21V11H13M13,3V9H21V3',
          route: '/lab/dashboard',
          isActive: false
        },
        {
          id: 'pending-appointments',
          label: 'Citas Pendientes',
          icon: 'M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20',
          route: '/lab/pending-appointments',
          isActive: false
        },
        {
          id: 'register-sample',
          label: 'Registrar Muestra',
          icon: 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z',
          route: '/lab/register-sample',
          isActive: false
        },
        {
          id: 'upload-mutations',
          label: 'Cargar Mutaciones',
          icon: 'M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z',
          route: '/lab/upload-mutations',
          isActive: false
        }
      ]
    };
  }

  private getPatientConfig(): SidebarConfig {
    return {
      title: 'Portal del Paciente',
      menuItems: [
        {
          id: 'home',
          label: 'Inicio',
          icon: 'M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z',
          route: '/patient/home',
          isActive: false
        },
        {
          id: 'appointments',
          label: 'Citas',
          icon: 'M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1',
          route: '',
          isActive: false,
          children: [
            {
              id: 'schedule-appointment',
              label: 'Agendar Cita',
              route: '/patient/schedule',
              icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
              isActive: false
            },
            {
              id: 'my-appointments',
              label: 'Mis Citas',
              route: '/patient/my-appointments',
              icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
              isActive: false
            }
          ]
        },
        {
          id: 'samples',
          label: 'Mis Muestras',
          icon: 'M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3',
          route: '/patient/samples',
          isActive: false
        },
        {
          id: 'smart-report',
          label: 'Reporte Inteligente',
          icon: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2',
          route: '/patient/smart-report',
          isActive: false
        },
        {
          id: 'technical-report',
          label: 'Reporte IA Técnico',
          icon: 'M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V5H6V7H18V5H19V19M8,9H16V11H8V9M8,12H16V14H8V12M8,15H13V17H8V15Z',
          route: '/patient/technical-report',
          isActive: false
        },
        {
          id: 'genetic-tests',
          label: 'Pruebas Genéticas',
          icon: 'M14.4,6L14,4H5V21H7V14H12.6L13,16H20V6H14.4Z',
          route: '/patient/genetic-tests',
          isActive: false
        }
      ]
    };
  }

  private getDefaultConfig(): SidebarConfig {
    return {
      title: 'Sistema',
      menuItems: []
    };
  }

  navigate(route: string) {
    this.router.navigate([route]);
    this.closeMobileMenu();

  }

  toggleSubmenu(menuItem: MenuItem) {
    if (menuItem.children) {
      menuItem.isExpanded = !menuItem.isExpanded;
    }
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}