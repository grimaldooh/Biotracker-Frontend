import { Component, OnInit, inject } from '@angular/core';
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
      <!-- Sidebar -->
      <app-sidebar [userRole]="currentUserRole" class="flex-shrink-0"></app-sidebar>
      
      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class BaseLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  currentUserRole: string = '';

  ngOnInit() {
    this.currentUserRole = this.authService.getCurrentUserRole();
  }
}