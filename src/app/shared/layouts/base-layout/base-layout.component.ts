import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-base-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="flex h-screen bg-slate-50">
      <!-- Botón hamburguesa solo visible en móvil -->
      <button
        class="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        (click)="sidebar.openMobileMenu()">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
      <app-sidebar #sidebar [userRole]="currentUserRole" class="flex-shrink-0"></app-sidebar>
      
      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class BaseLayoutComponent implements OnInit {
  @ViewChild('sidebar') sidebar!: SidebarComponent;

  private authService = inject(AuthService);
  currentUserRole: string = '';

  ngOnInit() {
    //this.currentUserRole = this.authService.getCurrentUserRole();
    const user = localStorage.getItem('currentUser');
    if (user) {
      const parsedUser = JSON.parse(user);
      this.currentUserRole = parsedUser.role || '';
    }
  }
}