import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentItem } from '../../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/documents`;

  uploadDocument(documentType: string, file: File): Observable<{ success: boolean; message: string; document: DocumentItem }> {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('document', file);

    return this.http.post<{ success: boolean; message: string; document: DocumentItem }>(
      `${this.apiUrl}/upload`,
      formData
    );
  }

  getMyDocuments(): Observable<{ success: boolean; documents: DocumentItem[] }> {
    return this.http.get<{ success: boolean; documents: DocumentItem[] }>(`${this.apiUrl}/my-documents`);
  }

  reviewDocument(docId: string, status: string, remarks: string = ''): Observable<{ success: boolean; message: string; document: DocumentItem; applicationStatus: string }> {
    return this.http.put<{ success: boolean; message: string; document: DocumentItem; applicationStatus: string }>(
      `${this.apiUrl}/${docId}/review`,
      { status, remarks }
    );
  }

  downloadDocument(docId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${docId}/download`, {
      responseType: 'blob'
    });
  }
}
