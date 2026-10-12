import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../core/services/application.service';
import { DocumentService } from '../../core/services/document.service';
import { ToastService } from '../../core/services/toast.service';
import { Application, DocumentItem } from '../../models/models';

@Component({
  selector: 'app-verifier-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- Header Banner -->
      <div class="bg-gradient-to-r from-iem-navy to-emerald-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-400 text-slate-950 uppercase tracking-wider">
            Document Verification Cell
          </span>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">Document Scrutiny Workdesk</h1>
          <p class="text-xs sm:text-sm text-emerald-200 mt-1">Review candidate certificates, approve genuine documents, or request replacements with remarks</p>
        </div>
      </div>

      <!-- Scrutiny Queue Filter -->
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2">
          <label class="font-bold text-slate-700">Filter Queue:</label>
          <select [(ngModel)]="filterStatus" (change)="loadQueue()" class="px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800">
            <option value="Submitted">Submitted Applications (Pending Review)</option>
            <option value="Action Required">Action Required (Replacement Pending)</option>
            <option value="Verified">Fully Verified</option>
            <option value="">All Applications</option>
          </select>
        </div>

        <div class="text-slate-500 font-medium">
          Applications in Queue: <strong class="text-slate-900 font-mono">{{ applications.length }}</strong>
        </div>
      </div>

      <!-- Applications Table -->
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th class="py-3.5 px-4">App ID</th>
                <th class="py-3.5 px-4">Candidate Name</th>
                <th class="py-3.5 px-4">Programme</th>
                <th class="py-3.5 px-4">Category</th>
                <th class="py-3.5 px-4">Current Status</th>
                <th class="py-3.5 px-4">Verification</th>
                <th class="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @if (applications.length === 0) {
                <tr>
                  <td colspan="7" class="py-10 text-center text-slate-400">
                    No applications currently awaiting verification in this filter.
                  </td>
                </tr>
              }
              @for (app of applications; track app._id) {
                <tr class="hover:bg-slate-50 transition">
                  <td class="py-3.5 px-4 font-mono font-bold text-blue-700">{{ app.applicationId }}</td>
                  <td class="py-3.5 px-4 font-bold text-slate-900">{{ app.personalInfo?.fullName }}</td>
                  <td class="py-3.5 px-4">{{ app.programme?.code }}</td>
                  <td class="py-3.5 px-4">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">{{ app.personalInfo?.category || 'GEN' }}</span>
                  </td>
                  <td class="py-3.5 px-4">
                    <span class="badge-status text-[10px]" [ngClass]="{
                      'badge-submitted': app.status === 'Submitted',
                      'badge-action-required': app.status === 'Action Required',
                      'badge-verified': app.status === 'Verified'
                    }">{{ app.status }}</span>
                  </td>
                  <td class="py-3.5 px-4 font-semibold text-slate-600">
                    {{ app.isDocumentVerified ? '100% Verified' : 'Scrutiny Required' }}
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <button (click)="openScrutinyModal(app)" class="px-3.5 py-1.5 rounded-lg text-white font-bold text-[11px] bg-emerald-600 hover:bg-emerald-700 transition shadow-xs">
                      Inspect Certificates
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- SCRUTINY MODAL -->
      @if (selectedApp) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95">
            
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                  Verifier Scrutiny Mode
                </span>
                <h3 class="text-xl font-extrabold text-slate-900 mt-1">{{ selectedApp.personalInfo?.fullName }} ({{ selectedApp.applicationId }})</h3>
                <p class="text-xs text-slate-500">Course: {{ selectedApp.programme?.name }} • Category: {{ selectedApp.personalInfo?.category }}</p>
              </div>
              <button (click)="selectedApp = null" class="text-slate-400 hover:text-slate-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <!-- Documents Review Table -->
            <div class="space-y-3">
              <h4 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Candidate Certificates</h4>
              <div class="rounded-xl border border-slate-200 overflow-hidden">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 text-slate-700 uppercase font-semibold text-[10px] border-b border-slate-200">
                    <tr>
                      <th class="py-2.5 px-3">Type</th>
                      <th class="py-2.5 px-3">File Name</th>
                      <th class="py-2.5 px-3">Status</th>
                      <th class="py-2.5 px-3">Remarks</th>
                      <th class="py-2.5 px-3 text-right">Verification Decision</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (doc of appDocs; track doc._id) {
                      <tr>
                        <td class="py-3 px-3 font-bold text-slate-900">{{ doc.documentType }}</td>
                        <td class="py-3 px-3 text-slate-600 truncate max-w-xs">{{ doc.originalName || doc.fileName || 'Not Uploaded' }}</td>
                        <td class="py-3 px-3">
                          <span class="badge-status text-[10px]" [ngClass]="{
                            'badge-approved': doc.status === 'Approved',
                            'badge-rejected': doc.status === 'Rejected',
                            'badge-under-review': doc.status === 'Pending' || doc.status === 'Replacement Submitted'
                          }">{{ doc.status }}</span>
                        </td>
                        <td class="py-3 px-3">
                          @if (doc.verifierRemarks) {
                            <span class="text-rose-700 font-semibold text-[11px]">{{ doc.verifierRemarks }}</span>
                          } @else {
                            <span class="text-slate-400">—</span>
                          }
                        </td>
                        <td class="py-3 px-3 text-right space-x-1.5">
                          @if (doc.filePath) {
                            <button (click)="previewFile(doc)" class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px]">
                              Inspect File
                            </button>
                            <button (click)="approveDoc(doc)" class="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]">
                              Approve
                            </button>
                            <button (click)="promptReject(doc)" class="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px]">
                              Reject &amp; Remark
                            </button>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <div class="flex items-center justify-end pt-3 border-t border-slate-100">
              <button (click)="selectedApp = null" class="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700">
                Done &amp; Close
              </button>
            </div>

          </div>
        </div>
      }

      <!-- REJECT PROMPT MODAL -->
      @if (rejectDocTarget) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 class="text-base font-bold text-slate-900">Reject Document: {{ rejectDocTarget.documentType }}</h3>
            <p class="text-xs text-slate-500">Provide an explicit reason so candidate understands why it was rejected and can upload a replacement.</p>
            
            <textarea [(ngModel)]="rejectRemarks" rows="3" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900" placeholder="e.g. Scan is blurry or certificate seal is not clearly visible..."></textarea>

            <div class="flex items-center justify-end gap-2 pt-2">
              <button (click)="rejectDocTarget = null" class="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700">Cancel</button>
              <button (click)="submitRejection()" class="px-5 py-2 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white">
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class VerifierDashboardComponent implements OnInit {
  applicationService = inject(ApplicationService);
  documentService = inject(DocumentService);
  toastService = inject(ToastService);

  applications: Application[] = [];
  filterStatus = 'Submitted';

  selectedApp: Application | null = null;
  appDocs: DocumentItem[] = [];
  rejectDocTarget: DocumentItem | null = null;
  rejectRemarks = '';

  ngOnInit() {
    this.loadQueue();
  }

  loadQueue() {
    this.applicationService.getAllApplications({
      status: this.filterStatus,
      limit: 50
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.applications = res.applications;
        }
      }
    });
  }

  openScrutinyModal(app: Application) {
    this.selectedApp = app;
    this.applicationService.getApplicationById(app._id).subscribe({
      next: (res) => {
        if (res.success) {
          this.appDocs = res.documents || [];
        }
      }
    });
  }

  previewFile(doc: DocumentItem) {
    this.documentService.downloadDocument(doc._id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: () => this.toastService.error('Could not preview document file')
    });
  }

  approveDoc(doc: DocumentItem) {
    this.documentService.reviewDocument(doc._id, 'Approved', 'Verified and accepted by document verifier').subscribe({
      next: (res) => {
        this.toastService.success(`${doc.documentType} verified and approved`);
        doc.status = 'Approved';
        doc.verifierRemarks = '';
        if (this.selectedApp) {
          this.selectedApp.status = res.applicationStatus as any;
        }
        this.loadQueue();
      },
      error: (err) => this.toastService.error(err.error?.message || 'Approval failed')
    });
  }

  promptReject(doc: DocumentItem) {
    this.rejectDocTarget = doc;
    this.rejectRemarks = '';
  }

  submitRejection() {
    if (!this.rejectDocTarget) return;
    if (!this.rejectRemarks.trim()) {
      this.toastService.warning('Rejection remark is required');
      return;
    }

    this.documentService.reviewDocument(this.rejectDocTarget._id, 'Rejected', this.rejectRemarks).subscribe({
      next: (res) => {
        this.toastService.info(`${this.rejectDocTarget?.documentType} rejected. Replacement requested.`);
        if (this.rejectDocTarget) {
          this.rejectDocTarget.status = 'Rejected';
          this.rejectDocTarget.verifierRemarks = this.rejectRemarks;
        }
        if (this.selectedApp) {
          this.selectedApp.status = res.applicationStatus as any;
        }
        this.rejectDocTarget = null;
        this.loadQueue();
      },
      error: (err) => this.toastService.error(err.error?.message || 'Rejection failed')
    });
  }
}
