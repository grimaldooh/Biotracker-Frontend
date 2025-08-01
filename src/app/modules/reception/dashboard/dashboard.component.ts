import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface DashboardStats {
  todayPatients: number;
  pendingAppointments: number;
  processedSamples: number;
  activeUsers: number;
}

@Component({
  selector: 'app-dashboard-recepcion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardRecepcionComponent implements OnInit {
  // Dashboard statistics
  todayPatients = 0;
  pendingAppointments = 0;
  processedSamples = 0;
  activeUsers = 0;

  // Loading state
  isLoading = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Load dashboard statistics and data
   */
  private loadDashboardData(): void {
    // Simulate API call with loading state
    this.isLoading = true;
    
    // In a real application, you would call your services here
    setTimeout(() => {
      this.todayPatients = 12;
      this.pendingAppointments = 5;
      this.processedSamples = 28;
      this.activeUsers = 8;
      this.isLoading = false;
    }, 1000);
  }

  /**
   * Navigation methods for different sections
   */
  goToRegisterPatient(): void {
    this.navigateWithAnimation('/patients/register');
  }

  goToPatientsList(): void {
    this.navigateWithAnimation('/patients');
  }

  goToAppointments(): void {
    this.navigateWithAnimation('/appointments');
  }

  goToSamples(): void {
    this.navigateWithAnimation('/samples');
  }

  goToCreateAppointment(): void {
    this.navigateWithAnimation('/appointments/create');
  }

  goToInventory(): void {
    this.navigateWithAnimation('/inventory');
  }

  goToRegisterUser(): void {
    this.navigateWithAnimation('/users/register');
  }

  /**
   * Navigate with smooth transition animation
   * @param route - The route to navigate to
   */
  private navigateWithAnimation(route: string): void {
    // Add a subtle loading state to the clicked button
    const event = new CustomEvent('button-clicked');
    document.dispatchEvent(event);
    
    // Small delay for visual feedback before navigation
    setTimeout(() => {
      this.router.navigate([route]);
    }, 150);
  }

  /**
   * Refresh dashboard data
   */
  refreshDashboard(): void {
    this.loadDashboardData();
  }

  /**
   * Get greeting message based on time of day
   */
  getGreetingMessage(): string {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return 'Buenos días';
    } else if (hour < 18) {
      return 'Buenas tardes';
    } else {
      return 'Buenas noches';
    }
  }

  /**
   * Get current date formatted for display
   */
  getCurrentDate(): string {
    return new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Format numbers for display with proper separators
   */
  formatNumber(num: number): string {
    return num.toLocaleString('es-ES');
  }

  /**
   * Check if user has permission to access certain features
   * This would integrate with your authentication/authorization system
   */
  hasPermission(feature: string): boolean {
    // Implement your permission logic here
    // For now, return true for all features
    return true;
  }

  /**
   * Handle keyboard shortcuts for common actions
   */
  onKeyboardShortcut(event: KeyboardEvent): void {
    // Handle common keyboard shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case '1':
          event.preventDefault();
          this.goToRegisterPatient();
          break;
        case '2':
          event.preventDefault();
          this.goToCreateAppointment();
          break;
        case '3':
          event.preventDefault();
          this.goToPatientsList();
          break;
        case 'r':
          event.preventDefault();
          this.refreshDashboard();
          break;
      }
    }
  }
}