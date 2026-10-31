import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Application, DocumentItem } from '../../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/applications`;

  getMyApplication(): Observable<{ success: boolean; application: Application; documents: DocumentItem[] }> {
    return this.http.get<{ success: boolean; application: Application; documents: DocumentItem[] }>(
      `${this.apiUrl}/my-application`
    );
  }

  saveDraft(data: { programmeId?: string; personalInfo?: any; academicInfo?: any }): Observable<{ success: boolean; message: string; application: Application }> {
    return this.http.put<{ success: boolean; message: string; application: Application }>(
      `${this.apiUrl}/my-application/draft`,
      data
    );
  }

  submitApplication(): Observable<{ success: boolean; message: string; applicationId: string; application: Application }> {
    return this.http.post<{ success: boolean; message: string; applicationId: string; application: Application }>(
      `${this.apiUrl}/my-application/submit`,
      {}
    );
  }

  getApplicationById(id: string): Observable<{ success: boolean; application: Application; documents: DocumentItem[] }> {
    return this.http.get<{ success: boolean; application: Application; documents: DocumentItem[] }>(
      `${this.apiUrl}/${id}`
    );
  }

  getAllApplications(filters: {
    search?: string;
    status?: string;
    programme?: string;
    category?: string;
    exam?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Observable<{
    success: boolean;
    total: number;
    page: number;
    totalPages: number;
    applications: Application[];
  }> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, String(val));
      }
    });

    return this.http.get<{
      success: boolean;
      total: number;
      page: number;
      totalPages: number;
      applications: Application[];
    }>(this.apiUrl, { params });
  }
}
