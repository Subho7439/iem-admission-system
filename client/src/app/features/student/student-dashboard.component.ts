import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApplicationService } from '../../core/services/application.service';
import { SeatPaymentService } from '../../core/services/seat-payment.service';
import { NotificationService } from '../../core/services/notification.service';
import { Application, DocumentItem, SeatAllocation, Payment, Receipt } from '../../models/models';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-8">
      
      <!-- Welcome Header -->
      <div class="bg-gradient-to-r from-iem-navy to-iem-blue rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1.5">
          <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold uppercase tracking-wider">
            Applicant Dashboard
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome, {{ authService.currentUser()?.name }}!</h1>
          <p class="text-xs sm:text-sm text-blue-200">
            Application ID: <span class="font-mono font-bold text-white">{{ application?.applicationId || 'Not Generated' }}</span> • 
            Cycle: <span class="font-semibold text-amber-300">2026–2027</span>
          </p>
        </div>

        <div class="flex items-center gap-3">
          @if (application?.isDraft) {
            <a routerLink="/student/application" class="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-900 shadow transition flex items-center gap-1.5">
              <span>Continue Application Form</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </a>
          } @else if (allocation?.status === 'Allotted') {
            <a routerLink="/student/allotment" class="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-white shadow transition flex items-center gap-1.5 animate-pulse">
              <span>Pay &amp; Confirm Seat</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </a>
          }
        </div>
      </div>

      <!-- Summary KPI Metric Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Application Status -->
        <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Application Status</span>
          <div class="flex items-center gap-2">
            <span class="badge-status" [ngClass]="getStatusBadgeClass(application?.status)">
              {{ application?.status || 'Draft' }}
            </span>
          </div>
          <span class="text-[11px] text-slate-400 block truncate">
            {{ application?.programme?.name || 'Programme Pending' }}
          </span>
        </div>

        <!-- Document Verification -->
        <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Document Scrutiny</span>
          <div class="flex items-center gap-2">
            <span class="badge-status" [ngClass]="application?.isDocumentVerified ? 'badge-verified' : (hasRejectedDoc ? 'badge-action-required' : 'badge-under-review')">
              {{ application?.isDocumentVerified ? 'Fully Verified' : (hasRejectedDoc ? 'Action Required' : 'Under Review') }}
            </span>
          </div>
          <span class="text-[11px] text-slate-400 block">
            {{ verifiedDocCount }} of {{ totalDocCount }} Documents Approved
          </span>
        </div>

        <!-- Merit Position -->
        <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Merit Position</span>
          <div class="text-xl font-extrabold text-blue-700 font-mono">
            {{ application?.meritPosition ? '#' + application?.meritPosition : 'Unpublished' }}
          </div>
          <span class="text-[11px] text-slate-400 block">
            Category Rank: {{ application?.categoryMeritPosition ? '#' + application?.categoryMeritPosition : 'N/A' }}
          </span>
        </div>

        <!-- Seat & Payment Status -->
        <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Seat &amp; Fee Status</span>
          <div class="flex items-center gap-2">
            <span class="badge-status" [ngClass]="allocation?.status === 'Accepted' ? 'badge-accepted' : (allocation?.status === 'Allotted' ? 'badge-allotted' : 'badge-draft')">
              {{ allocation?.status || 'Not Allotted' }}
            </span>
          </div>
          <span class="text-[11px] text-slate-400 block truncate">
            {{ payment?.status === 'Successful' ? 'Fee Paid: ₹' + (payment?.amount | number) : 'Payment Pending' }}
          </span>
        </div>

      </div>

      <!-- Real-Data Driven 11-Step Progress Tracker -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 class="text-base font-extrabold text-slate-900">Admission Progress Tracker</h3>
            <p class="text-xs text-slate-500">Live milestone progress based on actual university database state</p>
          </div>
          <div class="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Step {{ activeStepNumber }} of 11 Completed ({{ progressPercentage }}%)
          </div>
        </div>

        <!-- Stepper Horizontal Timeline -->
        <div class="overflow-x-auto pb-4">
          <div class="flex items-center min-w-[850px] justify-between relative">
            
            @for (step of steps; track step.num; let idx = $index) {
              <div class="flex flex-col items-center text-center relative z-10 w-20">
                <!-- Circle Indicator -->
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-200"
                  [ngClass]="{
                    'bg-emerald-600 text-white shadow-md': step.completed,
                    'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse': step.active && !step.completed,
                    'bg-slate-200 text-slate-500': !step.completed && !step.active
                  }">
                  @if (step.completed) {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                  } @else {
                    {{ step.num }}
                  }
                </div>
                <!-- Label -->
                <span class="text-[10px] font-semibold mt-2 leading-tight"
                  [ngClass]="step.completed ? 'text-slate-800' : (step.active ? 'text-blue-700 font-bold' : 'text-slate-400')">
                  {{ step.title }}
                </span>
              </div>
            }

          </div>
        </div>
      </div>

      <!-- Quick Action Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- Action 1: Documents -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-300 transition">
          <div class="space-y-2">
            <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <h4 class="font-bold text-sm text-slate-900">Document Verification Queue</h4>
            <p class="text-xs text-slate-600 leading-relaxed">
              Check the status of your uploaded certificates, verifier remarks, and upload replacements if rejected.
            </p>
          </div>
          <a routerLink="/student/documents" class="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1">
            <span>Manage Documents</span> &rarr;
          </a>
        </div>

        <!-- Action 2: Merit -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-300 transition">
          <div class="space-y-2">
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
            </div>
            <h4 class="font-bold text-sm text-slate-900">Merit Rankings &amp; Cutoffs</h4>
            <p class="text-xs text-slate-600 leading-relaxed">
              Inspect where you stand in overall rankings and category lists based on entrance score rules.
            </p>
          </div>
          <a routerLink="/student/merit" class="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1">
            <span>View Merit List</span> &rarr;
          </a>
        </div>

        <!-- Action 3: Seat & Receipt -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-300 transition">
          <div class="space-y-2">
            <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </div>
            <h4 class="font-bold text-sm text-slate-900">Seat Allotment &amp; Confirmation</h4>
            <p class="text-xs text-slate-600 leading-relaxed">
              Complete fee payment, accept your provisional seat, and download official PDF confirmation receipt.
            </p>
          </div>
          <a routerLink="/student/allotment" class="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1">
            <span>Check Allotment &amp; Pay</span> &rarr;
          </a>
        </div>

      </div>

    </div>
  `
})
export class StudentDashboardComponent implements OnInit {
  authService = inject(AuthService);
  applicationService = inject(ApplicationService);
  seatPaymentService = inject(SeatPaymentService);
  notificationService = inject(NotificationService);

  application: Application | null = null;
  documents: DocumentItem[] = [];
  allocation: SeatAllocation | null = null;
  payment: Payment | null = null;
  receipt: Receipt | null = null;

  verifiedDocCount = 0;
  totalDocCount = 0;
  hasRejectedDoc = false;
  activeStepNumber = 1;
  progressPercentage = 10;

  steps = [
    { num: 1, title: 'Account Created', completed: true, active: false },
    { num: 2, title: 'Personal Info', completed: false, active: false },
    { num: 3, title: 'Academic Info', completed: false, active: false },
    { num: 4, title: 'Docs Uploaded', completed: false, active: false },
    { num: 5, title: 'Submitted', completed: false, active: false },
    { num: 6, title: 'Doc Verified', completed: false, active: false },
    { num: 7, title: 'Merit Listed', completed: false, active: false },
    { num: 8, title: 'Seat Allotted', completed: false, active: false },
    { num: 9, title: 'Fee Paid', completed: false, active: false },
    { num: 10, title: 'Seat Accepted', completed: false, active: false },
    { num: 11, title: 'Receipt Issued', completed: false, active: false }
  ];

  ngOnInit() {
    this.loadApplicationData();
    this.loadAllotmentData();
  }

  loadApplicationData() {
    this.applicationService.getMyApplication().subscribe({
      next: (res) => {
        if (res.success) {
          this.application = res.application;
          this.documents = res.documents || [];
          this.computeProgress();
        }
      }
    });
  }

  loadAllotmentData() {
    this.seatPaymentService.getMyAllotment().subscribe({
      next: (res) => {
        if (res.success) {
          this.allocation = res.allocation;
          this.payment = res.payment;
          this.receipt = res.receipt;
          this.computeProgress();
        }
      }
    });
  }

  computeProgress() {
    const app = this.application;
    if (!app) return;

    this.totalDocCount = this.documents.length;
    this.verifiedDocCount = this.documents.filter(d => d.status === 'Approved').length;
    this.hasRejectedDoc = this.documents.some(d => d.status === 'Rejected');

    const s = this.steps;
    s[0].completed = true;

    // 2. Personal Info completed
    s[1].completed = !!(app.personalInfo?.fullName && app.personalInfo?.dob && app.personalInfo?.address);
    // 3. Academic Info completed
    s[2].completed = !!(app.academicInfo?.class10Percentage && app.academicInfo?.class12Percentage && app.academicInfo?.entranceRank);
    // 4. Docs uploaded
    const uploadedDocs = this.documents.filter(d => d.filePath && d.status !== 'Not Uploaded');
    s[3].completed = uploadedDocs.length >= 4;
    // 5. Submitted
    s[4].completed = !app.isDraft && app.status !== 'Draft';
    // 6. Doc verified
    s[5].completed = !!app.isDocumentVerified;
    // 7. Merit Listed
    s[6].completed = !!(app.meritPosition || ['Merit Listed', 'Seat Allotted', 'Accepted'].includes(app.status));
    // 8. Seat Allotted
    s[7].completed = !!(this.allocation && ['Allotted', 'Accepted'].includes(this.allocation.status));
    // 9. Payment
    s[8].completed = this.payment?.status === 'Successful';
    // 10. Seat Accepted
    s[9].completed = this.allocation?.status === 'Accepted';
    // 11. Receipt
    s[10].completed = !!this.receipt;

    // Find highest completed step
    let completedCount = 0;
    for (let i = 0; i < s.length; i++) {
      if (s[i].completed) {
        completedCount = i + 1;
      } else {
        s[i].active = (i === completedCount);
      }
    }
    this.activeStepNumber = completedCount;
    this.progressPercentage = Math.round((completedCount / 11) * 100);
  }

  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'Draft': return 'badge-draft';
      case 'Submitted': return 'badge-submitted';
      case 'Under Review': return 'badge-under-review';
      case 'Action Required': return 'badge-action-required';
      case 'Verified': return 'badge-verified';
      case 'Eligible': return 'badge-eligible';
      case 'Merit Listed': return 'badge-eligible';
      case 'Seat Allotted': return 'badge-allotted';
      case 'Accepted': return 'badge-accepted';
      case 'Declined': return 'badge-declined';
      default: return 'badge-draft';
    }
  }
}
