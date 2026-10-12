import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../core/services/application.service';
import { DocumentService } from '../../core/services/document.service';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { Application, DocumentItem, AdmissionProgramme } from '../../models/models';

@Component({
  selector: 'app-applications-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Application Management Portal</h1>
          <p class="text-xs text-slate-500 mt-1">Review, scrutinize, and verify applicant submissions</p>
        </div>
      </div>

      <!-- Search & Filters Bar -->
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          
          <!-- Search -->
          <div class="lg:col-span-2">
            <label class="block font-bold text-slate-700 mb-1">Search Applicants</label>
            <input type="text" [(ngModel)]="filters.search" (input)="loadApplications()" placeholder="Candidate Name, Email, or App ID..."
              class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 shadow-inner">
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">Status</label>
            <select [(ngModel)]="filters.status" (change)="loadApplications()" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white">
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Action Required">Action Required</option>
              <option value="Verified">Verified</option>
              <option value="Seat Allotted">Seat Allotted</option>
              <option value="Accepted">Accepted</option>
              <option value="Declined">Declined</option>
            </select>
          </div>

          <!-- Programme Filter -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">Programme</label>
            <select [(ngModel)]="filters.programme" (change)="loadApplications()" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white">
              <option value="">All Programmes</option>
              @for (prog of programmes; track prog._id) {
                <option [value]="prog._id">{{ prog.code }}</option>
              }
            </select>
          </div>

          <!-- Category Filter -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">Category</label>
            <select [(ngModel)]="filters.category" (change)="loadApplications()" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white">
              <option value="">All Categories</option>
              <option value="GENERAL">GENERAL</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
            </select>
          </div>

        </div>
      </div>

      <!-- Applications Table -->
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th class="py-3.5 px-4">Application ID</th>
                <th class="py-3.5 px-4">Candidate Name</th>
                <th class="py-3.5 px-4">Programme</th>
                <th class="py-3.5 px-4">Category</th>
                <th class="py-3.5 px-4">Entrance Rank</th>
                <th class="py-3.5 px-4">Status</th>
                <th class="py-3.5 px-4">Verification</th>
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @if (applications.length === 0) {
                <tr>
                  <td colspan="8" class="py-10 text-center text-slate-400">
                    No applications matching the selected criteria.
                  </td>
                </tr>
              }
              @for (app of applications; track app._id) {
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="py-3.5 px-4 font-mono font-bold text-blue-700">{{ app.applicationId }}</td>
                  <td class="py-3.5 px-4 font-bold text-slate-900">
                    {{ app.personalInfo?.fullName || '—' }}
                    <span class="block text-[10px] text-slate-400 font-normal">{{ app.personalInfo?.email }}</span>
                  </td>
                  <td class="py-3.5 px-4 font-semibold text-slate-700">{{ app.programme?.code || '—' }}</td>
                  <td class="py-3.5 px-4">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">{{ app.personalInfo?.category || 'GEN' }}</span>
                  </td>
                  <td class="py-3.5 px-4 font-mono font-bold">{{ app.academicInfo?.entranceRank ? '#' + app.academicInfo?.entranceRank : '—' }}</td>
                  <td class="py-3.5 px-4">
                    <span class="badge-status" [ngClass]="getStatusBadge(app.status)">{{ app.status }}</span>
                  </td>
                  <td class="py-3.5 px-4">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold" [ngClass]="app.isDocumentVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'">
                      {{ app.isDocumentVerified ? 'Verified' : 'Pending' }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <button (click)="openDetailModal(app)" class="px-3 py-1.5 rounded-lg font-bold text-[11px] bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition shadow-xs">
                      Inspect &amp; Review
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>Showing {{ applications.length }} of {{ totalCount }} applications</div>
          <div class="flex items-center gap-1.5">
            <button [disabled]="currentPage === 1" (click)="changePage(currentPage - 1)" class="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40">Previous</button>
            <span class="px-2 font-mono font-bold text-slate-700">Page {{ currentPage }} / {{ totalPages || 1 }}</span>
            <button [disabled]="currentPage === totalPages" (click)="changePage(currentPage + 1)" class="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      <!-- INSPECT & SCRUTINY DETAIL MODAL -->
      @if (selectedApp) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95">
            
            <!-- Modal Header -->
            <div class="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span class="badge-status text-[10px]" [ngClass]="getStatusBadge(selectedApp.status)">{{ selectedApp.status }}</span>
                <h3 class="text-xl font-extrabold text-slate-900 mt-1">Application Scrutiny: {{ selectedApp.applicationId }}</h3>
                <p class="text-xs text-slate-500">{{ selectedApp.personalInfo?.fullName }} • Applied for {{ selectedApp.programme?.name }}</p>
              </div>
              <button (click)="selectedApp = null" class="text-slate-400 hover:text-slate-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <!-- Profile & Academic Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              <!-- Personal -->
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 class="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Personal Profile</h4>
                <div><strong>Email:</strong> {{ selectedApp.personalInfo?.email }}</div>
                <div><strong>Mobile:</strong> {{ selectedApp.personalInfo?.mobile }}</div>
                <div><strong>DOB:</strong> {{ selectedApp.personalInfo?.dob | date:'mediumDate' }}</div>
                <div><strong>Category Quota:</strong> <span class="font-bold text-blue-700">{{ selectedApp.personalInfo?.category }}</span></div>
                <div><strong>Address:</strong> {{ selectedApp.personalInfo?.address }}, {{ selectedApp.personalInfo?.state }} - {{ selectedApp.personalInfo?.pinCode }}</div>
                <div><strong>Guardian:</strong> {{ selectedApp.personalInfo?.guardianName }} ({{ selectedApp.personalInfo?.guardianMobile }})</div>
              </div>

              <!-- Academic -->
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 class="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Academic Qualifications</h4>
                <div><strong>Class 10:</strong> {{ selectedApp.academicInfo?.class10Percentage }}% ({{ selectedApp.academicInfo?.class10Board }}, {{ selectedApp.academicInfo?.class10Year }})</div>
                <div><strong>Class 12:</strong> {{ selectedApp.academicInfo?.class12Percentage }}% ({{ selectedApp.academicInfo?.class12Board }}, {{ selectedApp.academicInfo?.class12Year }})</div>
                <div><strong>Entrance Exam:</strong> {{ selectedApp.academicInfo?.entranceExam }}</div>
                <div><strong>Entrance Rank:</strong> <span class="font-bold font-mono text-purple-700">#{{ selectedApp.academicInfo?.entranceRank }}</span></div>
                <div><strong>Percentile:</strong> {{ selectedApp.academicInfo?.entrancePercentile }}%</div>
                <div><strong>Eligibility Remark:</strong> {{ selectedApp.eligibilityRemarks || 'Under Evaluation' }}</div>
              </div>

            </div>

            <!-- Uploaded Documents Inspection Table -->
            <div class="space-y-3">
              <h4 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Uploaded Documents Scrutiny</h4>
              <div class="rounded-xl border border-slate-200 overflow-hidden">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 text-slate-700 uppercase font-semibold text-[10px] border-b border-slate-200">
                    <tr>
                      <th class="py-2.5 px-3">Document Type</th>
                      <th class="py-2.5 px-3">File</th>
                      <th class="py-2.5 px-3">Status</th>
                      <th class="py-2.5 px-3">Verifier Remarks</th>
                      <th class="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (doc of appDocuments; track doc._id) {
                      <tr>
                        <td class="py-3 px-3 font-bold">{{ doc.documentType }}</td>
                        <td class="py-3 px-3 text-slate-600 truncate max-w-xs">{{ doc.originalName || doc.fileName || 'Not Uploaded' }}</td>
                        <td class="py-3 px-3">
                          <span class="badge-status text-[10px]" [ngClass]="getDocBadge(doc.status)">{{ doc.status }}</span>
                        </td>
                        <td class="py-3 px-3">
                          @if (doc.verifierRemarks) {
                            <span class="text-rose-700 font-semibold text-[11px]">{{ doc.verifierRemarks }}</span>
                          } @else {
                            <span class="text-slate-400">—</span>
                          }
                        </td>
                        <td class="py-3 px-3 text-right space-x-1">
                          @if (doc.filePath) {
                            <button (click)="previewFile(doc)" class="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px]">
                              View
                            </button>
                            <button (click)="approveDoc(doc)" class="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]">
                              Approve
                            </button>
                            <button (click)="openRejectDocPrompt(doc)" class="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px]">
                              Reject
                            </button>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <div class="flex items-center justify-end pt-4 border-t border-slate-100">
              <button (click)="selectedApp = null" class="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700">
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      }

      <!-- REJECT DOCUMENT WITH REMARKS MODAL -->
      @if (rejectingDoc) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 class="text-base font-bold text-slate-900">Reject Document: {{ rejectingDoc.documentType }}</h3>
            <p class="text-xs text-slate-500">Provide an explicit remark explaining what is wrong (e.g. illegible scan, missing seal, mismatched name) so candidate can submit a replacement.</p>
            
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Rejection Remark *</label>
              <textarea [(ngModel)]="rejectionRemarks" rows="3" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900" placeholder="e.g. Marksheet scan is cropped or blurry..."></textarea>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2">
              <button (click)="rejectingDoc = null" class="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700">Cancel</button>
              <button (click)="confirmRejectDoc()" class="px-5 py-2 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-xs">
                Submit Rejection &amp; Notify Student
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class ApplicationsListComponent implements OnInit {
  applicationService = inject(ApplicationService);
  documentService = inject(DocumentService);
  adminService = inject(AdminService);
  toastService = inject(ToastService);

  applications: Application[] = [];
  programmes: AdmissionProgramme[] = [];
  totalCount = 0;
  currentPage = 1;
  totalPages = 1;

  filters = {
    search: '',
    status: '',
    programme: '',
    category: '',
    exam: ''
  };

  selectedApp: Application | null = null;
  appDocuments: DocumentItem[] = [];
  rejectingDoc: DocumentItem | null = null;
  rejectionRemarks = '';

  ngOnInit() {
    this.adminService.getProgrammes().subscribe({
      next: (res) => {
        if (res.success) this.programmes = res.programmes;
      }
    });
    this.loadApplications();
  }

  loadApplications() {
    this.applicationService.getAllApplications({
      ...this.filters,
      page: this.currentPage,
      limit: 10
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.applications = res.applications;
          this.totalCount = res.total;
          this.totalPages = res.totalPages;
        }
      }
    });
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadApplications();
  }

  openDetailModal(app: Application) {
    this.selectedApp = app;
    this.applicationService.getApplicationById(app._id).subscribe({
      next: (res) => {
        if (res.success) {
          this.appDocuments = res.documents || [];
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
      error: () => this.toastService.error('Could not preview document')
    });
  }

  approveDoc(doc: DocumentItem) {
    this.documentService.reviewDocument(doc._id, 'Approved', 'Document verified successfully').subscribe({
      next: (res) => {
        this.toastService.success(`${doc.documentType} approved`);
        doc.status = 'Approved';
        doc.verifierRemarks = '';
        if (this.selectedApp) {
          this.selectedApp.status = res.applicationStatus as any;
        }
        this.loadApplications();
      },
      error: (err) => this.toastService.error(err.error?.message || 'Approval failed')
    });
  }

  openRejectDocPrompt(doc: DocumentItem) {
    this.rejectingDoc = doc;
    this.rejectionRemarks = '';
  }

  confirmRejectDoc() {
    if (!this.rejectingDoc) return;
    if (!this.rejectionRemarks.trim()) {
      this.toastService.warning('Please enter a clear remark explaining rejection');
      return;
    }

    this.documentService.reviewDocument(this.rejectingDoc._id, 'Rejected', this.rejectionRemarks).subscribe({
      next: (res) => {
        this.toastService.info(`${this.rejectingDoc?.documentType} marked as Rejected. Student notified.`);
        if (this.rejectingDoc) {
          this.rejectingDoc.status = 'Rejected';
          this.rejectingDoc.verifierRemarks = this.rejectionRemarks;
        }
        if (this.selectedApp) {
          this.selectedApp.status = res.applicationStatus as any;
        }
        this.rejectingDoc = null;
        this.loadApplications();
      },
      error: (err) => this.toastService.error(err.error?.message || 'Rejection failed')
    });
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'Submitted': return 'badge-submitted';
      case 'Under Review': return 'badge-under-review';
      case 'Action Required': return 'badge-action-required';
      case 'Verified': return 'badge-verified';
      case 'Eligible': return 'badge-eligible';
      case 'Seat Allotted': return 'badge-allotted';
      case 'Accepted': return 'badge-accepted';
      default: return 'badge-draft';
    }
  }

  getDocBadge(status: string): string {
    switch (status) {
      case 'Approved': return 'badge-approved';
      case 'Rejected': return 'badge-rejected';
      case 'Pending': return 'badge-under-review';
      default: return 'badge-draft';
    }
  }
}
