import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InsuranceQuote } from '../../../../core/interfaces/insurance.interface';

@Component({
  selector: 'app-quotes-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quotes-history.component.html',
  styleUrl: './quotes-history.component.css'
})
export class QuotesHistoryComponent {
  @Input() quotes: InsuranceQuote[] = [];
  @Output() quoteAction = new EventEmitter<{quoteId: string, action: 'accept' | 'reject'}>();

  selectedQuote: InsuranceQuote | null = null;
  filterStatus: string = 'all';

  get filteredQuotes(): InsuranceQuote[] {
    if (this.filterStatus === 'all') {
      return this.quotes;
    }
    return this.quotes.filter(quote => quote.status === this.filterStatus);
  }

  get statusCounts() {
    return {
      all: this.quotes.length,
      active: this.quotes.filter(q => q.status === 'ACTIVE').length,
      accepted: this.quotes.filter(q => q.status === 'ACCEPTED').length,
      rejected: this.quotes.filter(q => q.status === 'REJECTED').length,
      pending: this.quotes.filter(q => q.status === 'PENDING').length
    };
  }

  setFilter(status: string) {
    this.filterStatus = status;
  }

  selectQuote(quote: InsuranceQuote) {
    this.selectedQuote = this.selectedQuote?.quoteId === quote.quoteId ? null : quote;
  }

  onAcceptQuote(quote: InsuranceQuote) {
    this.quoteAction.emit({ quoteId: quote.quoteId, action: 'accept' });
  }

  onRejectQuote(quote: InsuranceQuote) {
    this.quoteAction.emit({ quoteId: quote.quoteId, action: 'reject' });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-blue-100 text-blue-700';
      case 'ACCEPTED': return 'bg-green-100 text-green-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'Activa';
      case 'ACCEPTED': return 'Aceptada';
      case 'REJECTED': return 'Rechazada';
      case 'PENDING': return 'Pendiente';
      default: return status;
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  isExpired(validUntil: string): boolean {
    return new Date(validUntil) < new Date();
  }

  trackByQuoteId(index: number, quote: any): any {
  return quote.quoteId;
}
}