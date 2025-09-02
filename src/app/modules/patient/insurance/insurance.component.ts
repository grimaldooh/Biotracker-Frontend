import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InsuranceService } from '../../../core/services/insurance.service';
import { AuthService } from '../../../shared/services/auth.service';
import { InsuranceQuote } from '../../../core/interfaces/insurance.interface';
import { QuoteFormComponent } from './quote-form/quote-form.component';
import { QuotesHistoryComponent } from './quotes-history/quotes-history.component';

@Component({
  selector: 'app-insurance',
  standalone: true,
  imports: [CommonModule, QuoteFormComponent, QuotesHistoryComponent],
  templateUrl: './insurance.component.html',
  styleUrl: './insurance.component.css'
})
export class InsuranceComponent implements OnInit {
  currentView: 'overview' | 'new-quote' | 'history' = 'overview';
  activeQuotes: InsuranceQuote[] = [];
  allQuotes: InsuranceQuote[] = [];
  loading = false;
  currentPatientId = '';

  constructor(
    private insuranceService: InsuranceService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentPatientId = this.authService.getCurrentUserId() || '';
    this.loadPatientQuotes();
  }

  // Getter para contar cotizaciones aceptadas
  get acceptedQuotesCount(): number {
    return this.allQuotes.filter(q => q.status === 'ACCEPTED').length;
  }

  // Getter para contar cotizaciones rechazadas
  get rejectedQuotesCount(): number {
    return this.allQuotes.filter(q => q.status === 'REJECTED').length;
  }

  // Getter para contar cotizaciones pendientes
  get pendingQuotesCount(): number {
    return this.allQuotes.filter(q => q.status === 'PENDING').length;
  }

  // Getter para contar cotizaciones activas
  get activeQuotesCount(): number {
    return this.allQuotes.filter(q => q.status === 'ACTIVE').length;
  }

  loadPatientQuotes() {
    if (!this.currentPatientId) return;
    
    this.loading = true;
    this.insuranceService.getPatientQuotes(this.currentPatientId).subscribe({
      next: (quotes) => {
        this.allQuotes = quotes;
        this.activeQuotes = quotes.filter(q => q.status === 'ACTIVE' || q.status === 'PENDING');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading quotes:', error);
        this.loading = false;
      }
    });
  }

  switchView(view: 'overview' | 'new-quote' | 'history') {
    this.currentView = view;
  }

  onQuoteCreated(quote: InsuranceQuote) {
    this.allQuotes.unshift(quote);
    this.activeQuotes = this.allQuotes.filter(q => q.status === 'ACTIVE' || q.status === 'PENDING');
    this.currentView = 'overview';
  }

  onQuoteAction(quoteId: string, action: 'accept' | 'reject') {
    const serviceCall = action === 'accept' 
      ? this.insuranceService.acceptQuote(quoteId)
      : this.insuranceService.rejectQuote(quoteId);

    serviceCall.subscribe({
      next: (updatedQuote) => {
        const index = this.allQuotes.findIndex(q => q.quoteId === quoteId);
        if (index >= 0) {
          this.allQuotes[index] = updatedQuote;
          this.activeQuotes = this.allQuotes.filter(q => q.status === 'ACTIVE' || q.status === 'PENDING');
        }
      },
      error: (error) => {
        console.error(`Error ${action}ing quote:`, error);
      }
    });
  }
}