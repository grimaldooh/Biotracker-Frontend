export interface InsuranceQuoteRequest {
  patientId: string;
  coverageType: 'BASIC' | 'STANDARD' | 'PREMIUM';
  coverageAmount: number;
  deductible: number;
  lifestyleScore: number; // 1-10
  exerciseFrequency: number; // 0-7 días por semana
  smokingStatus: boolean;
  alcoholConsumption: number; // 1-10
  occupationRiskLevel: number; // 1-5
  familyHistoryRisk: number; // 1-5
}

export interface InsuranceQuote {
  quoteId: string;
  patientId: string;
  patientName: string;
  monthlyPremium: number;
  annualPremium: number;
  riskScore: number;
  coverageType: string;
  coverageAmount: number;
  deductible: number;
  status: 'ACTIVE' | 'PENDING' | 'ACCEPTED' | 'REJECTED';
  quoteDate: string;
  validUntil: string;
  recommendations: string[];
  coverageDetails?: any;
  premiumBreakdown?: any;
}

export interface InsuranceQuoteAction {
  action: 'accept' | 'reject';
  quoteId: string;
}