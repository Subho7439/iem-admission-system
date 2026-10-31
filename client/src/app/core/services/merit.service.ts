import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MeritConfiguration, MeritEntry, AdmissionProgramme } from '../../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MeritService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/merit`;

  getConfig(programmeId: string, cycle: string = '2026-2027'): Observable<{ success: boolean; config: MeritConfiguration }> {
    return this.http.get<{ success: boolean; config: MeritConfiguration }>(
      `${this.apiUrl}/config/${programmeId}?cycle=${cycle}`
    );
  }

  updateConfig(programmeId: string, data: any): Observable<{ success: boolean; message: string; config: MeritConfiguration }> {
    return this.http.put<{ success: boolean; message: string; config: MeritConfiguration }>(
      `${this.apiUrl}/config/${programmeId}`,
      data
    );
  }

  calculateMerit(programmeId: string, cycle: string = '2026-2027'): Observable<{
    success: boolean;
    message: string;
    totalEligible: number;
    entries: MeritEntry[];
    config: MeritConfiguration;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      totalEligible: number;
      entries: MeritEntry[];
      config: MeritConfiguration;
    }>(`${this.apiUrl}/calculate`, { programmeId, admissionCycle: cycle });
  }

  publishMeritList(programmeId: string, cycle: string = '2026-2027'): Observable<{
    success: boolean;
    message: string;
    totalEligible: number;
    entries: MeritEntry[];
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      totalEligible: number;
      entries: MeritEntry[];
    }>(`${this.apiUrl}/publish`, { programmeId, admissionCycle: cycle });
  }

  getPublishedList(programmeId: string, category?: string, search?: string): Observable<{
    success: boolean;
    programme: AdmissionProgramme;
    status: string;
    publishedAt: string;
    totalEntries: number;
    entries: MeritEntry[];
  }> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    if (search) params = params.set('search', search);

    return this.http.get<{
      success: boolean;
      programme: AdmissionProgramme;
      status: string;
      publishedAt: string;
      totalEntries: number;
      entries: MeritEntry[];
    }>(`${this.apiUrl}/list/${programmeId}`, { params });
  }

  exportCSV(programmeId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export-csv/${programmeId}`, {
      responseType: 'blob'
    });
  }
}
