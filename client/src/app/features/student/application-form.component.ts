import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApplicationService } from '../../core/services/application.service';
import { DocumentService } from '../../core/services/document.service';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { Application, DocumentItem, AdmissionProgramme } from '../../models/models';

@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-5xl mx-auto space-y-6">
      
      <!-- Stepper Header -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h1 class="text-2xl font-extrabold text-slate-900">Online Admission Application Form</h1>
            <p class="text-xs text-slate-500">Academic Session 2026–2027 • Application ID: <span class="font-mono font-bold text-blue-700">{{ application?.applicationId || 'Generating...' }}</span></p>
          </div>
          <div class="flex items-center gap-2">
            <span class="badge-status" [ngClass]="isEditable ? 'badge-draft' : 'badge-submitted'">
              {{ application?.status || 'Draft' }}
            </span>
          </div>
        </div>

        <!-- 4 Step Navigation Stepper -->
        <div class="grid grid-cols-4 gap-2 text-center text-xs">
          <button (click)="goToStep(1)" [class.font-bold]="currentStep === 1"
            class="p-3 rounded-xl border flex flex-col items-center gap-1 transition"
            [ngClass]="currentStep === 1 ? 'border-blue-600 bg-blue-50/60 text-blue-800' : 'border-slate-200 bg-slate-50 text-slate-600'">
            <span class="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs"
              [ngClass]="currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'">1</span>
            <span class="hidden sm:inline">Personal Details</span>
          </button>

          <button (click)="goToStep(2)" [class.font-bold]="currentStep === 2"
            class="p-3 rounded-xl border flex flex-col items-center gap-1 transition"
            [ngClass]="currentStep === 2 ? 'border-blue-600 bg-blue-50/60 text-blue-800' : 'border-slate-200 bg-slate-50 text-slate-600'">
            <span class="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs"
              [ngClass]="currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'">2</span>
            <span class="hidden sm:inline">Academic Scores</span>
          </button>

          <button (click)="goToStep(3)" [class.font-bold]="currentStep === 3"
            class="p-3 rounded-xl border flex flex-col items-center gap-1 transition"
            [ngClass]="currentStep === 3 ? 'border-blue-600 bg-blue-50/60 text-blue-800' : 'border-slate-200 bg-slate-50 text-slate-600'">
            <span class="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs"
              [ngClass]="currentStep === 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'">3</span>
            <span class="hidden sm:inline">Upload Documents</span>
          </button>

          <button (click)="goToStep(4)" [class.font-bold]="currentStep === 4"
            class="p-3 rounded-xl border flex flex-col items-center gap-1 transition"
            [ngClass]="currentStep === 4 ? 'border-blue-600 bg-blue-50/60 text-blue-800' : 'border-slate-200 bg-slate-50 text-slate-600'">
            <span class="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs"
              [ngClass]="currentStep === 4 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'">4</span>
            <span class="hidden sm:inline">Review &amp; Submit</span>
          </button>
        </div>
      </div>

      <!-- STEP 1: PERSONAL INFORMATION -->
      @if (currentStep === 1) {
        <div class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 class="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Step 1: Personal &amp; Guardian Information</h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Full Name (Candidate) *</label>
              <input type="text" [(ngModel)]="personalInfo.fullName" [disabled]="!isEditable" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Date of Birth *</label>
              <input type="date" [(ngModel)]="personalInfo.dob" [disabled]="!isEditable" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
              <select [(ngModel)]="personalInfo.gender" [disabled]="!isEditable" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Category / Quota *</label>
              <select [(ngModel)]="personalInfo.category" [disabled]="!isEditable" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white">
                <option value="GENERAL">GENERAL</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Permanent Address *</label>
              <input type="text" [(ngModel)]="personalInfo.address" [disabled]="!isEditable" placeholder="House/Flat No, Street, Landmark" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">State &amp; PIN Code *</label>
              <div class="grid grid-cols-2 gap-2">
                <input type="text" [(ngModel)]="personalInfo.state" [disabled]="!isEditable" placeholder="State (e.g. West Bengal)" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900">
                <input type="text" [(ngModel)]="personalInfo.pinCode" [disabled]="!isEditable" maxlength="6" placeholder="PIN Code (e.g. 700091)" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900">
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Father / Guardian Full Name *</label>
              <input type="text" [(ngModel)]="personalInfo.guardianName" [disabled]="!isEditable" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Guardian Mobile Number *</label>
              <input type="tel" [(ngModel)]="personalInfo.guardianMobile" [disabled]="!isEditable" maxlength="10" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900">
            </div>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-slate-100">
            <button (click)="saveDraftNow()" class="px-5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
              💾 Save Draft
            </button>
            <button (click)="goToStep(2)" class="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1">
              <span>Next: Academic Scores</span> &rarr;
            </button>
          </div>
        </div>
      }

      <!-- STEP 2: ACADEMIC INFORMATION -->
      @if (currentStep === 2) {
        <div class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 class="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Step 2: Academic Qualifications &amp; Entrance Rank</h2>

          <!-- Course Applied -->
          <div class="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80">
            <label class="block text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">Preferred Programme *</label>
            <select [(ngModel)]="selectedProgrammeId" [disabled]="!isEditable" class="w-full px-3 py-2 rounded-lg border border-blue-300 text-xs font-semibold text-slate-800 bg-white">
              @for (prog of programmes; track prog._id) {
                <option [value]="prog._id">{{ prog.name }} ({{ prog.code }}) - &#8377;{{ prog.admissionFee | number }}</option>
              }
            </select>
          </div>

          <!-- Class 10 -->
          <div class="space-y-3">
            <h3 class="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Class 10 (Secondary) Examination</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">Board / Council *</label>
                <input type="text" [(ngModel)]="academicInfo.class10Board" [disabled]="!isEditable" placeholder="CBSE / ICSE / WBBSE" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">Passing Year *</label>
                <input type="number" [(ngModel)]="academicInfo.class10Year" [disabled]="!isEditable" placeholder="2024" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">Percentage (0 to 100) *</label>
                <input type="number" step="0.01" min="0" max="100" [(ngModel)]="academicInfo.class10Percentage" [disabled]="!isEditable" placeholder="e.g. 88.5" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
              </div>
            </div>
          </div>

          <!-- Class 12 -->
          <div class="space-y-3">
            <h3 class="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Class 12 (Higher Secondary) Examination</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">Board / Council *</label>
                <input type="text" [(ngModel)]="academicInfo.class12Board" [disabled]="!isEditable" placeholder="CBSE / ISC / WBCHSE" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">Passing Year *</label>
                <input type="number" [(ngModel)]="academicInfo.class12Year" [disabled]="!isEditable" placeholder="2026" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">Percentage (PCM Aggregate) *</label>
                <input type="number" step="0.01" min="0" max="100" [(ngModel)]="academicInfo.class12Percentage" [disabled]="!isEditable" placeholder="e.g. 91.2" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
              </div>
            </div>
          </div>

          <!-- Entrance Exam -->
          <div class="space-y-3">
            <h3 class="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Entrance Examination</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">Exam Name *</label>
                <select [(ngModel)]="academicInfo.entranceExam" [disabled]="!isEditable" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white">
                  <option value="WBJEE">WBJEE (West Bengal JEE)</option>
                  <option value="JEE Main">JEE Main</option>
                  <option value="IEMJEE">IEMJEE</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">Entrance General Merit Rank *</label>
                <input type="number" min="1" [(ngModel)]="academicInfo.entranceRank" [disabled]="!isEditable" placeholder="e.g. 1420" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">Percentile (0 to 100)</label>
                <input type="number" step="0.01" min="0" max="100" [(ngModel)]="academicInfo.entrancePercentile" [disabled]="!isEditable" placeholder="e.g. 97.4" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-slate-100">
            <button (click)="goToStep(1)" class="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
              &larr; Back to Step 1
            </button>
            <div class="flex items-center gap-2">
              <button (click)="saveDraftNow()" class="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
                💾 Save Draft
              </button>
              <button (click)="goToStep(3)" class="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1">
                <span>Next: Documents</span> &rarr;
              </button>
            </div>
          </div>
        </div>
      }

      <!-- STEP 3: DOCUMENT UPLOAD -->
      @if (currentStep === 3) {
        <div class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 class="text-lg font-bold text-slate-900">Step 3: Document Uploads</h2>
              <p class="text-xs text-slate-500">Allowed formats: PDF, JPG, PNG (Max 4MB per document)</p>
            </div>
            <a routerLink="/student/documents" class="text-xs text-blue-600 font-bold hover:underline">
              View Scrutiny Table &rarr;
            </a>
          </div>

          <div class="space-y-4">
            @for (doc of documents; track doc._id) {
              <div class="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-xs text-slate-900">{{ doc.documentType }}</span>
                    @if (doc.isRequired) {
                      <span class="text-[10px] text-rose-500 font-bold">*Required</span>
                    }
                  </div>
                  
                  <div class="flex items-center gap-2 text-xs">
                    <span class="badge-status" [ngClass]="getDocBadge(doc.status)">
                      {{ doc.status }}
                    </span>
                    @if (doc.fileName) {
                      <span class="text-slate-500 truncate max-w-xs">{{ doc.originalName || doc.fileName }}</span>
                    }
                  </div>

                  @if (doc.verifierRemarks) {
                    <div class="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                      <strong>Verifier Remark:</strong> {{ doc.verifierRemarks }}
                    </div>
                  }
                </div>

                <!-- Upload / Replace Input -->
                <div class="flex items-center gap-2">
                  @if (isEditable || doc.status === 'Rejected') {
                    <label class="cursor-pointer px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1.5 shadow-sm">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                      <span>{{ doc.status === 'Rejected' ? 'Replace Document' : (doc.filePath ? 'Re-upload' : 'Upload File') }}</span>
                      <input type="file" (change)="onFileSelected($event, doc.documentType)" accept=".pdf,.jpg,.jpeg,.png" class="hidden">
                    </label>
                  }

                  @if (doc.filePath) {
                    <button (click)="previewDoc(doc)" class="p-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition" title="Preview / Download">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </button>
                  }
                </div>
              </div>
            }
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-slate-100">
            <button (click)="goToStep(2)" class="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
              &larr; Back to Academic
            </button>
            <button (click)="goToStep(4)" class="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1">
              <span>Next: Final Review</span> &rarr;
            </button>
          </div>
        </div>
      }

      <!-- STEP 4: REVIEW & FORMAL SUBMISSION -->
      @if (currentStep === 4) {
        <div class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 class="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Step 4: Application Summary &amp; Submission Confirmation</h2>

          <!-- Missing Information Alert if any -->
          @if (submissionErrors.length > 0) {
            <div class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
              <h4 class="font-bold flex items-center gap-1.5">
                <svg class="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                Incomplete Application Detected:
              </h4>
              <ul class="list-disc list-inside space-y-0.5 pl-1">
                @for (err of submissionErrors; track err) {
                  <li>{{ err }}</li>
                }
              </ul>
            </div>
          }

          <!-- Review Summary Boxes -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            <!-- Personal Summary -->
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 class="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Personal Profile</h4>
              <div><strong>Name:</strong> {{ personalInfo.fullName || '—' }}</div>
              <div><strong>DOB:</strong> {{ personalInfo.dob || '—' }}</div>
              <div><strong>Gender:</strong> {{ personalInfo.gender || '—' }}</div>
              <div><strong>Category:</strong> {{ personalInfo.category || 'GENERAL' }}</div>
              <div><strong>Address:</strong> {{ personalInfo.address || '—' }}, {{ personalInfo.state || '' }} - {{ personalInfo.pinCode || '' }}</div>
              <div><strong>Guardian:</strong> {{ personalInfo.guardianName || '—' }} ({{ personalInfo.guardianMobile || '—' }})</div>
            </div>

            <!-- Academic Summary -->
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 class="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Academic Qualifications</h4>
              <div><strong>Programme:</strong> {{ getSelectedProgName() }}</div>
              <div><strong>Class 10:</strong> {{ academicInfo.class10Percentage || '0' }}% ({{ academicInfo.class10Board || '—' }}, {{ academicInfo.class10Year || '—' }})</div>
              <div><strong>Class 12:</strong> {{ academicInfo.class12Percentage || '0' }}% ({{ academicInfo.class12Board || '—' }}, {{ academicInfo.class12Year || '—' }})</div>
              <div><strong>Entrance Exam:</strong> {{ academicInfo.entranceExam || 'WBJEE' }}</div>
              <div><strong>Entrance Rank:</strong> #{{ academicInfo.entranceRank || '—' }}</div>
              <div><strong>Percentile:</strong> {{ academicInfo.entrancePercentile || '—' }}%</div>
            </div>

          </div>

          <!-- Document Upload Checklist Status -->
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <h4 class="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Uploaded Certificate Scrutiny</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              @for (d of documents; track d._id) {
                <div class="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                  <span class="truncate">{{ d.documentType }}</span>
                  <span class="badge-status text-[10px]" [ngClass]="getDocBadge(d.status)">{{ d.status }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Declaration Checkbox -->
          <div class="flex items-start gap-2 pt-2">
            <input type="checkbox" id="declaration" [(ngModel)]="declarationAgreed" [disabled]="!isEditable" class="mt-1 rounded text-blue-600 focus:ring-blue-500">
            <label for="declaration" class="text-xs text-slate-600 leading-relaxed cursor-pointer">
              I hereby declare that all academic marks, scores, and personal records entered above are accurate to the best of my knowledge. I understand that falsification of details will lead to immediate cancellation of admission.
            </label>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-4 border-t border-slate-100">
            <button (click)="goToStep(3)" class="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
              &larr; Back to Uploads
            </button>

            @if (isEditable) {
              <div class="flex items-center gap-2">
                <button (click)="saveDraftNow()" class="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
                  💾 Save Draft
                </button>
                <button (click)="confirmAndSubmit()" [disabled]="!declarationAgreed || submitting"
                  class="px-7 py-3 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-md transition flex items-center gap-2">
                  @if (submitting) {
                    <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Submitting Application...</span>
                  } @else {
                    <span>🚀 Submit Application Form</span>
                  }
                </button>
              </div>
            } @else {
              <div class="text-xs text-blue-700 font-bold bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
                Application Submitted on {{ application?.submissionDate | date:'medium' }}
              </div>
            }
          </div>

        </div>
      }

    </div>
  `
})
export class ApplicationFormComponent implements OnInit {
  applicationService = inject(ApplicationService);
  documentService = inject(DocumentService);
  adminService = inject(AdminService);
  toastService = inject(ToastService);
  router = inject(Router);

  application: Application | null = null;
  documents: DocumentItem[] = [];
  programmes: AdmissionProgramme[] = [];

  currentStep = 1;
  isEditable = true;
  submitting = false;
  declarationAgreed = false;
  submissionErrors: string[] = [];

  selectedProgrammeId = '';
  personalInfo: any = {
    fullName: '',
    dob: '',
    gender: '',
    category: 'GENERAL',
    address: '',
    state: 'West Bengal',
    pinCode: '',
    guardianName: '',
    guardianMobile: ''
  };

  academicInfo: any = {
    class10Board: '',
    class10Year: 2024,
    class10Percentage: null,
    class12Board: '',
    class12Year: 2026,
    class12Percentage: null,
    entranceExam: 'WBJEE',
    entranceRank: null,
    entrancePercentile: null
  };

  ngOnInit() {
    this.adminService.getProgrammes().subscribe({
      next: (res) => {
        if (res.success) {
          this.programmes = res.programmes;
        }
        this.loadApplication();
      }
    });
  }

  loadApplication() {
    this.applicationService.getMyApplication().subscribe({
      next: (res) => {
        if (res.success) {
          this.application = res.application;
          this.documents = res.documents || [];
          this.selectedProgrammeId = this.application.programme?._id || '';

          this.isEditable = this.application.isDraft ||
            this.application.status === 'Draft' ||
            this.application.status === 'Action Required';

          if (this.application.personalInfo) {
            this.personalInfo = { ...this.personalInfo, ...this.application.personalInfo };
            if (this.application.personalInfo.dob) {
              this.personalInfo.dob = new Date(this.application.personalInfo.dob).toISOString().split('T')[0];
            }
          }

          if (this.application.academicInfo) {
            this.academicInfo = { ...this.academicInfo, ...this.application.academicInfo };
          }
        }
      }
    });
  }

  goToStep(step: number) {
    if (step > 1 && this.isEditable) {
      // Validate percentage boundaries
      if (this.academicInfo.class10Percentage !== null && (this.academicInfo.class10Percentage < 0 || this.academicInfo.class10Percentage > 100)) {
        this.toastService.error('Class 10 percentage must be between 0 and 100');
        return;
      }
      if (this.academicInfo.class12Percentage !== null && (this.academicInfo.class12Percentage < 0 || this.academicInfo.class12Percentage > 100)) {
        this.toastService.error('Class 12 percentage must be between 0 and 100');
        return;
      }
      this.saveDraftQuiet();
    }
    this.currentStep = step;
  }

  saveDraftQuiet() {
    this.applicationService.saveDraft({
      programmeId: this.selectedProgrammeId,
      personalInfo: this.personalInfo,
      academicInfo: this.academicInfo
    }).subscribe();
  }

  saveDraftNow() {
    this.applicationService.saveDraft({
      programmeId: this.selectedProgrammeId,
      personalInfo: this.personalInfo,
      academicInfo: this.academicInfo
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success('Application draft saved successfully');
        }
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to save draft');
      }
    });
  }

  onFileSelected(event: any, docType: string) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      this.toastService.error('File exceeds maximum size limit of 4 MB');
      return;
    }

    this.documentService.uploadDocument(docType, file).subscribe({
      next: (res) => {
        this.toastService.success(`${docType} uploaded successfully`);
        this.loadApplication();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'File upload failed');
      }
    });
  }

  previewDoc(doc: DocumentItem) {
    this.documentService.downloadDocument(doc._id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: (err) => {
        this.toastService.error('Could not preview document file');
      }
    });
  }

  confirmAndSubmit() {
    this.submitting = true;
    this.submissionErrors = [];

    // First save latest data
    this.applicationService.saveDraft({
      programmeId: this.selectedProgrammeId,
      personalInfo: this.personalInfo,
      academicInfo: this.academicInfo
    }).subscribe({
      next: () => {
        // Then submit
        this.applicationService.submitApplication().subscribe({
          next: (res) => {
            this.submitting = false;
            this.toastService.success('Congratulations! Your application has been submitted successfully.');
            this.router.navigate(['/student/status']);
          },
          error: (err) => {
            this.submitting = false;
            this.submissionErrors = err.error?.errors || [err.error?.message || 'Submission failed'];
            this.toastService.error('Application has missing fields or documents');
          }
        });
      },
      error: (err) => {
        this.submitting = false;
        this.toastService.error(err.error?.message || 'Failed to prepare submission');
      }
    });
  }

  getSelectedProgName(): string {
    const prog = this.programmes.find(p => p._id === this.selectedProgrammeId);
    return prog ? prog.name : 'Not Selected';
  }

  getDocBadge(status: string): string {
    switch (status) {
      case 'Approved': return 'badge-approved';
      case 'Rejected': return 'badge-rejected';
      case 'Pending': return 'badge-under-review';
      case 'Under Review': return 'badge-under-review';
      case 'Replacement Submitted': return 'badge-under-review';
      default: return 'badge-draft';
    }
  }
}
