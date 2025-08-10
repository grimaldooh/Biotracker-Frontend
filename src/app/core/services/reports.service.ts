import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PatientReport {
  sampleId: string;
  s3Url: string | null;
  s3UrlPatient: string | null;
}

export interface PatientFriendlyReport {
  patient_friendly_report: {
    your_test_summary: {
      what_was_tested: string;
      when_tested: string;
      main_findings: string;
    };
    what_your_results_mean: {
      in_simple_terms: string;
      what_is_normal: string;
      your_specific_results: string;
    };
    health_impact: {
      what_this_means_for_you: string;
      should_you_be_concerned: string;
      positive_aspects: string;
    };
    next_steps: {
      immediate_actions: string;
      lifestyle_tips: string;
      follow_up_care: string;
    };
    questions_to_ask: {
      for_your_doctor: string[];
      understanding_better: string;
    };
    important_notes: {
      limitations: string;
      remember: string;
    };
  };
}

export interface MedicalReport {
  medical_study_report: {
    patient_data: {
      name: string;
    };
    sample_information: {
      sample_type: string;
      analyzer_model: string;
      collection_date: string;
      lab_notes: string;
    };
    clinical_findings: {
      executive_summary: string;
      sample_analysis: string;
      clinical_significance: string;
    };
    recommendations: {
      action_plan: string;
      analysis_limitations: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private baseUrl = 'http://localhost:8080/api/reports';

  constructor(private http: HttpClient) {}

  getPatientReports(patientId: string): Observable<PatientReport[]> {
    return this.http.get<PatientReport[]>(`${this.baseUrl}/patient/${patientId}`);
  }

  fetchReportFromS3(s3Url: string, isPatientFriendly: boolean): Observable<PatientFriendlyReport | MedicalReport> {
    const params = {
      s3Url: s3Url,
      isPatientFriendly: isPatientFriendly.toString()
    };
    return this.http.get<PatientFriendlyReport | MedicalReport>(`${this.baseUrl}/fetch-from-s3`, { params });
  }
}