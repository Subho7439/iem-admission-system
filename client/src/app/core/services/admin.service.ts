import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdmissionProgramme } from '../../models/models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private adminUrl = 'http://localhost:5000/api/admin';
  private reportsUrl = 'http://localhost:5000/api/reports';

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.adminUrl}/dashboard-stats`);
  }

  getProgrammes(): Observable<{ success: boolean; programmes: AdmissionProgramme[] }> {
    return this.http.get<{ success: boolean; programmes: AdmissionProgramme[] }>(`${this.adminUrl}/programmes`);
  }

  saveProgramme(data: any): Observable<{ success: boolean; programme: AdmissionProgramme }> {
    return this.http.post<{ success: boolean; programme: AdmissionProgramme }>(`${this.adminUrl}/programmes`, data);
  }

  getAuditLogs(): Observable<{ success: boolean; logs: any[] }> {
    return this.http.get<{ success: boolean; logs: any[] }>(`${this.adminUrl}/audit-logs`);
  }

  getReportsSummary(): Observable<{ success: boolean; data: any }> {
    return this.http.get<{ success: boolean; data: any }>(`${this.reportsUrl}/summary`);
  }

  exportApplicationsCSV(): Observable<Blob> {
    return this.http.get(`${this.reportsUrl}/export/applications-csv`, {
      responseType: 'blob'
    });
  }
}
