import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../core/services/document.service';
import { ApplicationService } from '../../core/services/application.service';
import { ToastService } from '../../core/services/toast.service';
import { DocumentItem, Application } from '../../models/models';

@Component({
  selector: 'app-document-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Document Scrutiny &amp; Verification Status</h1>
          <p class="text-xs text-slate-500 mt-1">Track the review status of every uploaded academic certificate</p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="loadDocuments()" class="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            <span>Refresh Status</span>
          </button>
        </div>
      </div>

      <!-- Action Required Alert Banner (if any document is rejected) -->
      @if (hasRejectedDocument) {
        <div class="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 shadow-sm flex items-start gap-3">
          <svg class="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <div class="text-xs space-y-1">
            <h4 class="font-extrabold uppercase tracking-wide">Action Required: Document(s) Rejected</h4>
            <p>One or more of your documents failed verification. Please inspect the verifier remarks below and upload a clear replacement copy to proceed with merit eligibility.</p>
          </div>
        </div>
      }

      <!-- Document Status Table Card -->
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th class="py-3.5 px-4">Document Type</th>
                <th class="py-3.5 px-4">Uploaded File</th>
                <th class="py-3.5 px-4">Verification Status</th>
                <th class="py-3.5 px-4">Verifier Remarks</th>
                <th class="py-3.5 px-4">Last Updated</th>
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-800">
              @for (doc of documents; track doc._id) {
                <tr class="hover:bg-slate-50/80 transition" [ngClass]="{'bg-rose-50/30': doc.status === 'Rejected'}">
                  
                  <td class="py-3.5 px-4">
                    <div class="font-bold text-slate-900">{{ doc.documentType }}</div>
                    @if (doc.isRequired) {
                      <span class="text-[10px] text-slate-400 font-medium">Mandatory</span>
                    }
                  </td>

                  <td class="py-3.5 px-4">
                    @if (doc.fileName) {
                      <div class="font-medium text-slate-700 truncate max-w-xs">{{ doc.originalName || doc.fileName }}</div>
                      <span class="text-[10px] text-slate-400">{{ (doc.fileSize / 1024) | number:'1.0-0' }} KB</span>
                    } @else {
                      <span class="text-slate-400 italic">Not Uploaded</span>
                    }
                  </td>

                  <td class="py-3.5 px-4">
                    <span class="badge-status" [ngClass]="getBadgeClass(doc.status)">
                      {{ doc.status }}
                    </span>
                  </td>

                  <td class="py-3.5 px-4">
                    @if (doc.verifierRemarks) {
                      <div class="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] max-w-xs font-medium">
                        {{ doc.verifierRemarks }}
                      </div>
                    } @else if (doc.status === 'Approved') {
                      <span class="text-emerald-700 font-semibold text-[11px]">Verified &amp; Accepted</span>
                    } @else {
                      <span class="text-slate-400 text-[11px]">—</span>
                    }
                  </td>

                  <td class="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {{ doc.verifiedAt ? (doc.verifiedAt | date:'short') : (doc.updatedAt | date:'short') }}
                  </td>

                  <td class="py-3.5 px-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      
                      <!-- Preview / Download -->
                      @if (doc.filePath) {
                        <button (click)="download(doc)" class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] transition shadow-xs">
                          Preview
                        </button>
                      }

                      <!-- Replace or Upload Button -->
                      @if (doc.status === 'Rejected' || doc.status === 'Not Uploaded' || doc.status === 'Pending') {
                        <label class="cursor-pointer px-3 py-1.5 rounded-lg text-white font-bold text-[11px] transition shadow-xs"
                          [ngClass]="doc.status === 'Rejected' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'">
                          <span>{{ doc.status === 'Rejected' ? 'Replace' : 'Upload' }}</span>
                          <input type="file" (change)="uploadFile($event, doc.documentType)" accept=".pdf,.jpg,.jpeg,.png" class="hidden">
                        </label>
                      }

                    </div>
                  </td>

                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class DocumentStatusComponent implements OnInit {
  documentService = inject(DocumentService);
  applicationService = inject(ApplicationService);
  toastService = inject(ToastService);

  documents: any[] = [];
  hasRejectedDocument = false;

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.documentService.getMyDocuments().subscribe({
      next: (res) => {
        if (res.success) {
          this.documents = res.documents;
          this.hasRejectedDocument = this.documents.some(d => d.status === 'Rejected');
        }
      }
    });
  }

  uploadFile(event: any, docType: string) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      this.toastService.error('File size exceeds maximum limit of 4 MB');
      return;
    }

    this.documentService.uploadDocument(docType, file).subscribe({
      next: (res) => {
        this.toastService.success(`Replacement for ${docType} submitted for re-scrutiny`);
        this.loadDocuments();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Upload failed');
      }
    });
  }

  download(doc: any) {
    this.documentService.downloadDocument(doc._id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: () => {
        this.toastService.error('Could not open document preview');
      }
    });
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'Approved': return 'badge-approved';
      case 'Rejected': return 'badge-rejected';
      case 'Replacement Submitted': return 'badge-under-review';
      case 'Pending': return 'badge-under-review';
      case 'Under Review': return 'badge-under-review';
      default: return 'badge-draft';
    }
  }
}
