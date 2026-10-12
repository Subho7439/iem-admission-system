import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { AdmissionProgramme } from '../../models/models';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Top Academic Demo Notification Banner -->
    <div class="bg-amber-500/10 border-b border-amber-500/30 text-amber-900 px-4 py-2 text-center text-xs font-medium">
      <span class="font-bold uppercase tracking-wider mr-1">Academic Project Demonstration:</span>
      This portal is built for Software Engineering &amp; Project Management Laboratory (PCC-CS504) at IEM Kolkata.
    </div>

    <!-- Hero Section -->
    <section class="relative bg-gradient-to-b from-iem-navy via-iem-dark to-slate-900 text-white overflow-hidden py-16 sm:py-24">
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-400/40 text-blue-200 text-xs font-semibold uppercase tracking-wider shadow-sm">
          <span class="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
          Admissions Open for Session 2026–2027
        </div>

        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Institute of Engineering &amp; Management
          <span class="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300">
            Centralized Admission Portal
          </span>
        </h1>

        <p class="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
          Apply online for premier undergraduate &amp; postgraduate engineering and technology programmes. Track verification, merit rankings, seat allotments, and confirm your provisional admission online.
        </p>

        <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
          <a routerLink="/auth/register" class="px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5">
            Apply for Admission (2026)
          </a>
          <a routerLink="/auth/login" class="px-7 py-3.5 rounded-xl font-bold text-sm bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-600/60 shadow transition-all">
            Applicant Login
          </a>
          <a routerLink="/merit-list" class="px-7 py-3.5 rounded-xl font-bold text-sm bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 shadow transition-all">
            View Merit Rankings
          </a>
        </div>

        <!-- Metric Badges -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10 text-left">
          <div class="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div class="text-2xl font-extrabold text-blue-400">100%</div>
            <div class="text-xs text-slate-400 mt-0.5">Digital &amp; Transparent Workflow</div>
          </div>
          <div class="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div class="text-2xl font-extrabold text-amber-400">NAAC 'A'</div>
            <div class="text-xs text-slate-400 mt-0.5">Accredited Institution</div>
          </div>
          <div class="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div class="text-2xl font-extrabold text-emerald-400">NIRF</div>
            <div class="text-xs text-slate-400 mt-0.5">Top Engineering Ranking</div>
          </div>
          <div class="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div class="text-2xl font-extrabold text-purple-400">WBJEE / JEE</div>
            <div class="text-xs text-slate-400 mt-0.5">Accepted Entrance Exams</div>
          </div>
        </div>

      </div>
    </section>

    <!-- Admission Process in 4 Steps -->
    <section class="py-16 bg-white border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-12">
          <h2 class="text-xs font-bold text-blue-600 uppercase tracking-widest">How It Works</h2>
          <h3 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Admission Workflow in 4 Simple Steps</h3>
          <p class="text-sm text-slate-600 mt-2">Follow the standardized admission procedure approved by IEM Academic Council.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative group hover:border-blue-300 transition">
            <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-base mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
              1
            </div>
            <h4 class="font-bold text-slate-900 text-base mb-1">Registration &amp; Profile</h4>
            <p class="text-xs text-slate-600 leading-relaxed">
              Create your applicant account, fill in personal and guardian information, and enter academic scores for Class 10, 12, and WBJEE/JEE.
            </p>
          </div>

          <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative group hover:border-blue-300 transition">
            <div class="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-base mb-4 group-hover:bg-indigo-600 group-hover:text-white transition">
              2
            </div>
            <h4 class="font-bold text-slate-900 text-base mb-1">Document Upload</h4>
            <p class="text-xs text-slate-600 leading-relaxed">
              Upload required marksheets, photo, signature, and entrance rank cards (PDF/JPG up to 4MB). Dedicated verifiers inspect every certificate.
            </p>
          </div>

          <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative group hover:border-blue-300 transition">
            <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 font-extrabold flex items-center justify-center text-base mb-4 group-hover:bg-amber-600 group-hover:text-white transition">
              3
            </div>
            <h4 class="font-bold text-slate-900 text-base mb-1">Merit &amp; Seat Allotment</h4>
            <p class="text-xs text-slate-600 leading-relaxed">
              View official category-wise merit positions calculated deterministically based on entrance rank and tie-breaking rules.
            </p>
          </div>

          <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200 relative group hover:border-blue-300 transition">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-base mb-4 group-hover:bg-emerald-600 group-hover:text-white transition">
              4
            </div>
            <h4 class="font-bold text-slate-900 text-base mb-1">Payment &amp; Confirmation</h4>
            <p class="text-xs text-slate-600 leading-relaxed">
              Complete the admission fee payment online, accept your allotted seat before deadline, and download your provisional admission confirmation receipt.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Available Programmes Section -->
    <section class="py-16 bg-slate-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 class="text-xs font-bold text-blue-600 uppercase tracking-widest">Academic Offerings</h2>
            <h3 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Available Programmes &amp; Seat Quotas</h3>
          </div>
          <a routerLink="/programmes" class="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
            View detailed syllabus &amp; fee structure &rarr;
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          @for (prog of programmes; track prog._id) {
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {{ prog.degree }} • {{ prog.durationYears }} Years
                  </span>
                  <span class="font-mono text-xs font-semibold text-slate-500">Code: {{ prog.code }}</span>
                </div>
                <h4 class="text-lg font-bold text-slate-900">{{ prog.name }}</h4>
                <p class="text-xs text-slate-500">
                  Eligibility: Minimum {{ prog.eligibility.minClass12Percentage }}% in Class 12 (PCM) with valid {{ prog.eligibility.allowedExams.join('/') }} rank.
                </p>

                <!-- Quota Pills -->
                <div class="pt-2 flex flex-wrap gap-1.5 text-[11px]">
                  <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">GEN: {{ prog.seatsByCategory.GENERAL }}</span>
                  <span class="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">OBC: {{ prog.seatsByCategory.OBC }}</span>
                  <span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">SC: {{ prog.seatsByCategory.SC }}</span>
                  <span class="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-medium">ST: {{ prog.seatsByCategory.ST }}</span>
                </div>
              </div>

              <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span class="text-[10px] text-slate-400 block uppercase font-medium">Admission Fee</span>
                  <span class="text-sm font-extrabold text-slate-900">&#8377; {{ prog.admissionFee | number }}</span>
                </div>
                <a routerLink="/auth/register" class="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition">
                  Apply Now
                </a>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Document Checklist & Important Dates -->
    <section class="py-16 bg-white border-t border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          <!-- Document Checklist -->
          <div class="space-y-4">
            <h3 class="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Mandatory Document Checklist
            </h3>
            <p class="text-xs text-slate-600">Please prepare high quality scanned copies in PDF or JPG format before applying (under 4MB each):</p>
            
            <ul class="space-y-2.5 text-xs text-slate-700">
              <li class="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">✓</span>
                <div>
                  <span class="font-bold text-slate-900">Recent Passport Size Photograph:</span> Clear colored photograph with plain white or light background.
                </div>
              </li>
              <li class="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">✓</span>
                <div>
                  <span class="font-bold text-slate-900">Candidate Specimen Signature:</span> Signed in blue or black ballpoint ink on clean white paper.
                </div>
              </li>
              <li class="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">✓</span>
                <div>
                  <span class="font-bold text-slate-900">Class 10 &amp; Class 12 Marksheets:</span> Official board mark sheets with visible subject marks and percentage.
                </div>
              </li>
              <li class="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">✓</span>
                <div>
                  <span class="font-bold text-slate-900">Entrance Rank Card:</span> Official WBJEE 2026 or JEE Main 2026 scorecard showing rank and roll number.
                </div>
              </li>
              <li class="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">✓</span>
                <div>
                  <span class="font-bold text-slate-900">Category Certificate (if applicable):</span> SC/ST/OBC certificate issued by competent government authority.
                </div>
              </li>
            </ul>
          </div>

          <!-- Important Dates -->
          <div class="space-y-4">
            <h3 class="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              Important Admission Calendar (2026)
            </h3>
            <p class="text-xs text-slate-600">Sample timeline configured for Academic Session 2026–2027:</p>

            <div class="space-y-3">
              <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <h5 class="font-bold text-slate-900">Online Application Form Commencement</h5>
                  <p class="text-slate-500 text-[11px]">Portal opens for candidate registration</p>
                </div>
                <span class="font-mono font-semibold px-2.5 py-1 rounded bg-blue-100 text-blue-800">15 May 2026</span>
              </div>

              <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <h5 class="font-bold text-slate-900">Last Date for Online Submission</h5>
                  <p class="text-slate-500 text-[11px]">Submission and document upload deadline</p>
                </div>
                <span class="font-mono font-semibold px-2.5 py-1 rounded bg-amber-100 text-amber-800">30 June 2026</span>
              </div>

              <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <h5 class="font-bold text-slate-900">Document Verification by Admission Cell</h5>
                  <p class="text-slate-500 text-[11px]">SCRUTINY of uploaded certificates</p>
                </div>
                <span class="font-mono font-semibold px-2.5 py-1 rounded bg-teal-100 text-teal-800">01–07 July 2026</span>
              </div>

              <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <h5 class="font-bold text-slate-900">Publication of Official Merit Lists</h5>
                  <p class="text-slate-500 text-[11px]">Round 1 Category-wise merit announcement</p>
                </div>
                <span class="font-mono font-semibold px-2.5 py-1 rounded bg-purple-100 text-purple-800">10 July 2026</span>
              </div>

              <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <h5 class="font-bold text-slate-900">Seat Allotment &amp; Fee Payment Window</h5>
                  <p class="text-slate-500 text-[11px]">Online payment and provisional confirmation</p>
                </div>
                <span class="font-mono font-semibold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">11–18 July 2026</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>

    <!-- FAQ Accordion Section -->
    <section class="py-16 bg-slate-50 border-t border-slate-200">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10">
          <h2 class="text-xs font-bold text-blue-600 uppercase tracking-widest">Help Center</h2>
          <h3 class="text-2xl font-extrabold text-slate-900 mt-1">Frequently Asked Questions</h3>
        </div>

        <div class="space-y-3">
          @for (faq of faqs; track faq.q; let idx = $index) {
            <div class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <button (click)="toggleFaq(idx)" class="w-full text-left p-4 flex items-center justify-between font-bold text-sm text-slate-800 hover:text-blue-700 transition">
                <span>{{ faq.q }}</span>
                <svg class="w-4 h-4 text-slate-400 transform transition-transform" [ngClass]="{'rotate-180': openFaq === idx}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              </button>
              @if (openFaq === idx) {
                <div class="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {{ faq.a }}
                </div>
              }
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class LandingComponent implements OnInit {
  adminService = inject(AdminService);
  programmes: AdmissionProgramme[] = [];
  openFaq: number | null = 0;

  faqs = [
    {
      q: 'Can I edit my application after formal submission?',
      a: 'Once an application is formally submitted, it enters the scrutiny queue and cannot be directly modified. However, if the document verifier rejects a specific document, you will receive an "Action Required" notification allowing you to re-upload replacement certificates.'
    },
    {
      q: 'How are merit lists calculated?',
      a: 'Merit rankings are generated deterministically based on configured criteria (e.g. entrance exam rank in ascending order). In case of ties, Class 12 PCM percentage and Class 10 percentage are evaluated as tie-breakers.'
    },
    {
      q: 'Is real money processed during the demo payment step?',
      a: 'No. This portal is built strictly for academic software engineering laboratory demonstrations (PCC-CS504). The payment gateway simulates transaction states (Success, Failure, Cancellation) and generates provisional admission receipts without asking for real banking credentials.'
    },
    {
      q: 'What happens if I miss the seat acceptance deadline?',
      a: 'Every allotted seat comes with a clear acceptance deadline. If the candidate fails to complete payment and accept before the deadline expires, the allotment lapses automatically and the seat is released back to the general inventory.'
    }
  ];

  ngOnInit() {
    this.adminService.getProgrammes().subscribe({
      next: (res) => {
        if (res.success) this.programmes = res.programmes;
      }
    });
  }

  toggleFaq(idx: number) {
    this.openFaq = this.openFaq === idx ? null : idx;
  }
}
