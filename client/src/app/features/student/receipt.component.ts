import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeatPaymentService } from '../../core/services/seat-payment.service';
import { ToastService } from '../../core/services/toast.service';
import { Receipt } from '../../models/models';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6 max-w-4xl mx-auto">
      
      <!-- Top Action Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Provisional Admission Confirmation Receipt</h1>
          <p class="text-xs text-slate-500 mt-1">Official proof of seat allotment, payment verification, and enrollment</p>
        </div>

        @if (receipt) {
          <div class="flex items-center gap-3">
            <button (click)="printReceipt()" class="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
              <span>Print</span>
            </button>
            <button (click)="downloadPDF()" class="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1.5 shadow-md">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              <span>Download Official PDF</span>
            </button>
          </div>
        }
      </div>

      <!-- No Receipt State -->
      @if (!receipt) {
        <div class="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div class="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl font-extrabold">
            📄
          </div>
          <h3 class="text-lg font-bold text-slate-900">No Admission Receipt Available</h3>
          <p class="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            An admission confirmation receipt is generated automatically once you have completed fee payment and accepted your provisional seat allotment.
          </p>
          <a routerLink="/student/allotment" class="inline-block px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition">
            Go to Seat Allotment
          </a>
        </div>
      }

      <!-- Printable Certificate Card -->
      @if (receipt) {
        <div id="printable-receipt" class="bg-white rounded-2xl border-2 border-slate-300 p-8 sm:p-10 shadow-lg space-y-6 relative overflow-hidden">
          
          <!-- Watermark text in background -->
          <div class="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none text-8xl font-black text-slate-900 rotate-[-25deg]">
            IEM PROVISIONAL
          </div>

          <!-- University Header -->
          <div class="border-b-2 border-iem-navy pb-6 text-center space-y-2">
            <div class="inline-flex w-12 h-12 rounded-xl bg-iem-navy text-white font-extrabold text-2xl items-center justify-center shadow-md mb-1">
              IEM
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-iem-navy tracking-tight uppercase">
              Institute of Engineering &amp; Management (IEM)
            </h2>
            <p class="text-xs text-slate-600 font-medium">
              Sector V, Salt Lake Electronics Complex, Kolkata, West Bengal 700091
            </p>
            <div class="inline-block px-3 py-1 rounded bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold tracking-wider uppercase mt-1">
              Provisional Admission Confirmation Receipt • Academic Session 2026–2027
            </div>
          </div>

          <!-- Metadata Row -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border-b border-slate-200 pb-4">
            <div>
              <span class="text-slate-500 font-medium">Receipt Number:</span>
              <span class="font-mono font-extrabold text-blue-900 ml-1.5">{{ receipt.receiptNumber }}</span>
            </div>
            <div>
              <span class="text-slate-500 font-medium">Date &amp; Time of Issue:</span>
              <span class="font-semibold text-slate-800 ml-1.5">{{ receipt.issuedAt | date:'medium' }}</span>
            </div>
          </div>

          <!-- Candidate & Allotment Box -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span class="text-slate-400 block uppercase font-bold text-[10px]">Candidate Full Name</span>
              <span class="font-extrabold text-slate-900 text-sm">{{ receipt.candidateName }}</span>
            </div>
            <div>
              <span class="text-slate-400 block uppercase font-bold text-[10px]">Application ID</span>
              <span class="font-mono font-bold text-blue-800 text-sm">{{ receipt.application?.applicationId || 'IEM-2026' }}</span>
            </div>
            <div>
              <span class="text-slate-400 block uppercase font-bold text-[10px]">Programme Enrolled</span>
              <span class="font-bold text-slate-900">{{ receipt.programmeName }} ({{ receipt.programmeCode }})</span>
            </div>
            <div>
              <span class="text-slate-400 block uppercase font-bold text-[10px]">Allotted Seat Identifier</span>
              <span class="font-mono font-bold text-purple-800">{{ receipt.seatIdentifier }}</span>
            </div>
            <div>
              <span class="text-slate-400 block uppercase font-bold text-[10px]">Admission Category Quota</span>
              <span class="font-bold text-slate-900">{{ receipt.category }}</span>
            </div>
            <div>
              <span class="text-slate-400 block uppercase font-bold text-[10px]">Payment Transaction Reference</span>
              <span class="font-mono font-semibold text-slate-800">{{ receipt.paymentReference }}</span>
            </div>
            <div>
              <span class="text-slate-400 block uppercase font-bold text-[10px]">Admission Fee Paid</span>
              <span class="font-mono font-bold text-emerald-700 text-sm">&#8377; {{ receipt.amountPaid | number }} (PAID)</span>
            </div>
            <div>
              <span class="text-slate-400 block uppercase font-bold text-[10px]">Status</span>
              <span class="font-bold text-emerald-700 flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                PROVISIONALLY CONFIRMED
              </span>
            </div>
          </div>

          <!-- Instructions -->
          <div class="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-[11px] text-blue-950 space-y-1.5 leading-relaxed">
            <h4 class="font-bold uppercase tracking-wide text-blue-900 text-xs">Important Instructions for Induction:</h4>
            <ol class="list-decimal list-inside space-y-1 text-slate-700">
              <li>Candidate must produce a physical printout of this receipt during physical document verification and induction.</li>
              <li>Bring all original certificates (Class 10 &amp; 12 mark sheets, entrance exam rank card, category certificate) for verification.</li>
              <li>Provisional admission is subject to physical verification of original marksheets and scorecards.</li>
            </ol>
          </div>

          <!-- Signatures Footer -->
          <div class="pt-8 border-t border-slate-200 flex items-end justify-between text-xs">
            <div class="space-y-1">
              <span class="text-[10px] text-slate-400 block font-mono">Digitally Timestamped</span>
              <span class="font-bold text-slate-700">Admission Portal Engine</span>
            </div>

            <div class="text-right space-y-1">
              <div class="font-bold text-slate-900">Registrar / Admission Officer</div>
              <div class="text-[10px] text-slate-500">Institute of Engineering &amp; Management, Kolkata</div>
            </div>
          </div>

        </div>
      }

    </div>
  `
})
export class ReceiptComponent implements OnInit {
  seatPaymentService = inject(SeatPaymentService);
  toastService = inject(ToastService);

  receipt: Receipt | null = null;

  ngOnInit() {
    this.seatPaymentService.getMyReceipt().subscribe({
      next: (res) => {
        if (res.success) {
          this.receipt = res.receipt;
        }
      },
      error: () => {
        this.receipt = null;
      }
    });
  }

  downloadPDF() {
    if (!this.receipt) return;
    this.seatPaymentService.downloadReceiptPDF(this.receipt._id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.receipt?.receiptNumber}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastService.success('Receipt PDF downloaded successfully');
      },
      error: () => {
        this.toastService.error('Failed to download PDF receipt');
      }
    });
  }

  printReceipt() {
    window.print();
  }
}
