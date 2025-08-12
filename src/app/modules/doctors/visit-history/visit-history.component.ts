import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DoctorService, MedicalVisit } from '../../../core/services/doctors.service';
//import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-visit-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visit-history.component.html',
  styleUrl: './visit-history.component.css'
})
export class VisitHistoryComponent implements OnInit {
  allVisits: MedicalVisit[] = [];
  filteredVisits: MedicalVisit[] = [];
  groupedVisits: { [key: string]: MedicalVisit[] } = {};
  selectedVisit: MedicalVisit | null = null;
  
  // Estados
  loading = true;
  showVisitModal = false;
  
  // Filtros
  searchTerm = '';
  selectedStatus = 'ALL';
  selectedType = 'ALL';
  selectedDateRange = 'ALL';
  
  // Paginación
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 0;
  
  // Estadísticas
  stats = {
    total: 0,
    completed: 0,
    pending: 0,
    today: 0
  };

  doctorId: string = '';

  constructor(
    private doctorService: DoctorService,
    private router: Router
  ) {
    // Obtener doctorId dinámico
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.doctorId = user.userId || user.id || '';
      } catch {
        this.doctorId = '';
      }
    }
  }

  ngOnInit() {
    this.loadVisits();
  }

  loadVisits() {
    this.loading = true;
    if (!this.doctorId) {
      console.error('Doctor ID not found');
      this.loading = false;
      return;
    }
    this.doctorService.getAllVisits(this.doctorId).subscribe({
      next: (visits) => {
        this.allVisits = visits.sort((a, b) => 
          new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
        );
        this.calculateStats();
        this.applyFilters();
        this.loading = false;
        console.log('Visits loaded:', this.allVisits);
      },
      error: (error) => {
        console.error('Error loading visits:', error);
        this.loading = false;
      }
    });
  }

  calculateStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.stats = {
      total: this.allVisits.length,
      completed: this.allVisits.filter(v => v.visitCompleted).length,
      pending: this.allVisits.filter(v => !v.visitCompleted).length,
      today: this.allVisits.filter(v => {
        const visitDate = new Date(v.visitDate);
        visitDate.setHours(0, 0, 0, 0);
        return visitDate.getTime() === today.getTime();
      }).length
    };
  }

  applyFilters() {
    let filtered = [...this.allVisits];

    // Filtro por búsqueda
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(visit =>
        visit.patientName.toLowerCase().includes(search) ||
        visit.diagnosis?.toLowerCase().includes(search) ||
        visit.notes?.toLowerCase().includes(search)
      );
    }

    // Filtro por estado
    if (this.selectedStatus !== 'ALL') {
      filtered = filtered.filter(visit =>
        this.selectedStatus === 'COMPLETED' ? visit.visitCompleted : !visit.visitCompleted
      );
    }

    // Filtro por tipo
    if (this.selectedType !== 'ALL') {
      filtered = filtered.filter(visit => visit.type === this.selectedType);
    }

    // Filtro por fecha
    if (this.selectedDateRange !== 'ALL') {
      const now = new Date();
      filtered = filtered.filter(visit => {
        const visitDate = new Date(visit.visitDate);
        switch (this.selectedDateRange) {
          case 'TODAY':
            return visitDate.toDateString() === now.toDateString();
          case 'WEEK':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return visitDate >= weekAgo;
          case 'MONTH':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return visitDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    this.filteredVisits = filtered;
    this.totalPages = Math.ceil(this.filteredVisits.length / this.itemsPerPage);
    this.currentPage = 1;
    this.groupVisitsByDate();
  }

  groupVisitsByDate() {
    this.groupedVisits = {};
    
    const paginatedVisits = this.getPaginatedVisits();
    
    paginatedVisits.forEach(visit => {
      const date = new Date(visit.visitDate).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!this.groupedVisits[date]) {
        this.groupedVisits[date] = [];
      }
      this.groupedVisits[date].push(visit);
    });
  }

  getPaginatedVisits(): MedicalVisit[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredVisits.slice(startIndex, endIndex);
  }

  // Métodos de paginación
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.groupVisitsByDate();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.groupVisitsByDate();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.groupVisitsByDate();
    }
  }

  // Modal methods
  openVisitModal(visit: MedicalVisit) {
    this.selectedVisit = visit;
    this.showVisitModal = true;
  }

  closeModal() {
    this.showVisitModal = false;
    this.selectedVisit = null;
  }

  // Navigation methods
  goToVisitManagement(visit: MedicalVisit) {
    localStorage.setItem('currentVisit', JSON.stringify(visit));
    this.router.navigate(['/doctors/visit-management', visit.id]);
  }

  goBack() {
    this.router.navigate(['/doctors/dashboard']);
  }

  // Utility methods
  getVisitTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'CONSULTATION': 'Consulta',
      'FOLLOW_UP': 'Seguimiento',
      'SURGERY': 'Cirugía',
      'EMERGENCY': 'Emergencia',
      'OTHER': 'Otro'
    };
    return labels[type] || type;
  }

  getVisitTypeColor(type: string): string {
    const colors: Record<string, string> = {
      'CONSULTATION': 'bg-blue-100 text-blue-700 border-blue-200',
      'FOLLOW_UP': 'bg-green-100 text-green-700 border-green-200',
      'SURGERY': 'bg-red-100 text-red-700 border-red-200',
      'EMERGENCY': 'bg-orange-100 text-orange-700 border-orange-200',
      'OTHER': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  }

  getStatusColor(completed: boolean): string {
    return completed 
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-yellow-100 text-yellow-700 border-yellow-200';
  }

  getStatusLabel(completed: boolean): string {
    return completed ? 'Completada' : 'Pendiente';
  }

  // Métodos para reset de filtros
  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = 'ALL';
    this.selectedType = 'ALL';
    this.selectedDateRange = 'ALL';
    this.applyFilters();
  }

  // Método para exportar (futuro)
  exportVisits() {
    // Implementar exportación si es necesario
    console.log('Export functionality to be implemented');
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}