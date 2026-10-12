import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SeatPaymentService } from '../../core/services/seat-payment.service';
import { ToastService } from '../../core/services/toast.service';
import { SeatAllocation, Payment, Receipt } from '../../models/models';

@Component({
  selector: 'app-seat-allotment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Seat Allotment &amp; Admission Confirmation</h1>
        <p class="text-xs text-slate-500 mt-1">Review your provisional seat allotment, complete fee payment, and accept the offer</p>
      </div>

      <!-- No Allotment State -->
      @if (!hasAllotment) {
        <div class="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 max-w-2xl mx-auto">
          <div class="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-2xl font-extrabold">
            🎟️
          </div>
          <h3 class="text-lg font-bold text-slate-900">No Seat Allotted Yet</h3>
          <p class="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            Seat allotment rounds are processed dynamically following merit publication and document scrutiny. Please monitor this page and your in-app notifications for allotment updates.
          </p>
          <a routerLink="/student/merit" class="inline-block px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition">
            Check Merit Standings
          </a>
        </div>
      }

      <!-- Active Allotment Section -->
      @if (hasAllotment && allocation) {
        <div class="space-y-6">

          <!-- Seat Allotment Details Card -->
          <div class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span class="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                  Provisional Allotment Round 1
                </span>
                <h2 class="text-xl font-extrabold text-slate-900 mt-2">{{ allocation.programme.name }}</h2>
              </div>

              <!-- Status Badge -->
              <div>
                <span class="badge-status text-xs" [ngClass]="{
                  'badge-accepted': allocation.status === 'Accepted',
                  'badge-allotted': allocation.status === 'Allotted',
                  'badge-declined': allocation.status === 'Declined',
                  'badge-rejected': allocation.status === 'Expired'
                }">
                  Allotment: {{ allocation.status }}
                </span>
              </div>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span class="text-slate-400 block uppercase font-semibold text-[10px]">Seat Identifier</span>
                <span class="text-base font-extrabold text-blue-700 font-mono">{{ allocation.seat.seatIdentifier }}</span>
              </div>
              <div>
                <span class="text-slate-400 block uppercase font-semibold text-[10px]">Allotted Quota</span>
                <span class="text-sm font-bold text-slate-900">{{ allocation.category }}</span>
              </div>
              <div>
                <span class="text-slate-400 block uppercase font-semibold text-[10px]">Allotment Date</span>
                <span class="text-xs font-semibold text-slate-800">{{ allocation.allotmentDate | date:'mediumDate' }}</span>
              </div>
              <div>
                <span class="text-slate-400 block uppercase font-semibold text-[10px]">Acceptance Deadline</span>
                <span class="text-xs font-bold" [ngClass]="isExpired ? 'text-rose-600' : 'text-amber-700'">
                  {{ allocation.acceptanceDeadline | date:'mediumDate' }}
                  @if (isExpired) { <span class="block text-[10px] text-rose-500 font-bold">(EXPIRED)</span> }
                </span>
              </div>
            </div>

            <!-- Fee & Payment Banner -->
            <div class="p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              [ngClass]="payment?.status === 'Successful' ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-blue-50/70 border-blue-200 text-blue-950'">
              <div class="space-y-1">
                <span class="text-[11px] uppercase tracking-wider font-bold block" [ngClass]="payment?.status === 'Successful' ? 'text-emerald-700' : 'text-blue-700'">
                  Admission Fee Status
                </span>
                <div class="text-2xl font-extrabold font-mono">
                  &#8377; {{ allocation.feeAmount | number }}
                </div>
                <div class="text-xs flex items-center gap-2">
                  <span>Status:</span>
                  <span class="font-bold uppercase tracking-wide px-2 py-0.5 rounded text-[10px]"
                    [ngClass]="{
                      'bg-emerald-200 text-emerald-900': payment?.status === 'Successful',
                      'bg-rose-200 text-rose-900': payment?.status === 'Failed',
                      'bg-amber-200 text-amber-900': payment?.status === 'Pending',
                      'bg-slate-200 text-slate-700': !payment || payment?.status === 'Not Initiated'
                    }">
                    {{ payment?.status || 'Not Initiated' }}
                  </span>
                  @if (payment?.transactionReference) {
                    <span class="text-[11px] font-mono text-slate-500">Ref: {{ payment?.transactionReference }}</span>
                  }
                </div>
              </div>

              <!-- Payment Action Button -->
              <div>
                @if (allocation.status === 'Allotted') {
                  @if (payment?.status !== 'Successful') {
                    <button (click)="openPaymentModal()" [disabled]="isExpired"
                      class="px-6 py-3 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow transition flex items-center gap-2 disabled:opacity-50">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                      <span>{{ payment?.status === 'Failed' ? 'Retry Payment' : 'Pay Admission Fee (Simulated)' }}</span>
                    </button>
                  } @else {
                    <div class="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                      <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                      <span>Fee Verified &amp; Paid</span>
                    </div>
                  }
                }
              </div>
            </div>

            <!-- Seat Acceptance & Decline Controls -->
            <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="text-xs text-slate-500">
                @if (allocation.status === 'Allotted') {
                  <span>Note: Only candidates with verified successful payment can accept the seat before deadline.</span>
                } @else if (allocation.status === 'Accepted') {
                  <span class="text-emerald-700 font-bold">Provisional admission confirmed on {{ allocation.acceptedAt | date:'medium' }}.</span>
                } @else if (allocation.status === 'Declined') {
                  <span class="text-slate-500 italic">This seat allotment was declined and released back to inventory.</span>
                }
              </div>

              <div class="flex items-center gap-3">
                @if (allocation.status === 'Allotted') {
                  <!-- Decline Button -->
                  <button (click)="openDeclineModal()" class="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
                    Decline Seat
                  </button>

                  <!-- Accept Seat Button (Enabled only if payment is Successful) -->
                  <button (click)="acceptSeat()" [disabled]="payment?.status !== 'Successful' || isExpired || accepting"
                    class="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
                    @if (accepting) {
                      <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Confirming...</span>
                    } @else {
                      <span>Accept &amp; Confirm Seat</span>
                    }
                  </button>
                }

                @if (allocation.status === 'Accepted') {
                  <a routerLink="/student/receipt" class="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow transition flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    <span>View Admission Receipt</span>
                  </a>
                }
              </div>
            </div>

          </div>

        </div>
      }

      <!-- SIMULATED PAYMENT MODAL -->
      @if (showPaymentModal) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95">
            
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span class="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 uppercase">
                  Academic Demo Payment Simulator
                </span>
                <h3 class="text-lg font-extrabold text-slate-900 mt-1">Admission Fee Checkout</h3>
              </div>
              <button (click)="showPaymentModal = false" class="text-slate-400 hover:text-slate-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span class="text-slate-500 block">Payable Amount:</span>
                <span class="text-xl font-extrabold text-slate-900 font-mono">&#8377; {{ allocation?.feeAmount | number }}</span>
              </div>
              <div class="text-right">
                <span class="text-slate-500 block">Programme:</span>
                <span class="font-bold text-slate-800">{{ allocation?.programme?.code }}</span>
              </div>
            </div>

            <!-- Demo Payment Controls Notice -->
            <div class="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
              <strong>Lab Evaluator Controls:</strong> Test the academic payment state machine by selecting a simulated transaction outcome. Real bank accounts/OTPs are never requested.
            </div>

            <!-- Simulation Action Buttons -->
            <div class="space-y-2.5">
              <button (click)="triggerPaymentSimulation('Successful')" [disabled]="processingPayment"
                class="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow transition flex items-center justify-center gap-2">
                <span>✅ Simulate Successful Transaction</span>
              </button>

              <button (click)="triggerPaymentSimulation('Failed')" [disabled]="processingPayment"
                class="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow transition flex items-center justify-center gap-2">
                <span>❌ Simulate Transaction Failure (Test Retry)</span>
              </button>

              <button (click)="triggerPaymentSimulation('Cancelled')" [disabled]="processingPayment"
                class="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-slate-200 hover:bg-slate-300 text-slate-800 transition">
                <span>🚫 Simulate User Cancellation</span>
              </button>
            </div>

          </div>
        </div>
      }

      <!-- DECLINE CONFIRMATION MODAL -->
      @if (showDeclineModal) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 class="text-base font-bold text-slate-900">Are you sure you want to decline this seat?</h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              Declining will permanently release seat <strong class="font-mono">{{ allocation?.seat?.seatIdentifier }}</strong> back into the general inventory for other candidates. This action cannot be reversed.
            </p>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Reason for declining (Optional):</label>
              <textarea [(ngModel)]="declineReason" rows="2" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800" placeholder="e.g. Opting for different institution..."></textarea>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <button (click)="showDeclineModal = false" class="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700">
                Cancel
              </button>
              <button (click)="confirmDecline()" class="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white">
                Confirm Decline &amp; Release
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class SeatAllotmentComponent implements OnInit {
  seatPaymentService = inject(SeatPaymentService);
  toastService = inject(ToastService);
  router = inject(Router);

  hasAllotment = false;
  allocation: SeatAllocation | null = null;
  payment: Payment | null = null;
  receipt: Receipt | null = null;
  isExpired = false;

  showPaymentModal = false;
  showDeclineModal = false;
  declineReason = '';
  processingPayment = false;
  accepting = false;

  ngOnInit() {
    this.loadAllotment();
  }

  loadAllotment() {
    this.seatPaymentService.getMyAllotment().subscribe({
      next: (res) => {
        if (res.success) {
          this.hasAllotment = res.hasAllotment;
          this.allocation = res.allocation;
          this.payment = res.payment;
          this.receipt = res.receipt;
          this.isExpired = res.isExpired;
        }
      }
    });
  }

  openPaymentModal() {
    this.showPaymentModal = true;
  }

  triggerPaymentSimulation(outcome: string) {
    if (!this.allocation) return;
    this.processingPayment = true;

    // Step 1: Create order if not exists or retry
    this.seatPaymentService.createPaymentOrder(this.allocation._id, 'NetBanking_Demo').subscribe({
      next: (orderRes) => {
        const paymentId = orderRes.payment._id;

        // Step 2: Simulate outcome
        this.seatPaymentService.simulateOutcome(
          paymentId,
          outcome,
          outcome === 'Failed' ? 'Simulated card decline in academic testing' : ''
        ).subscribe({
          next: (res) => {
            this.processingPayment = false;
            this.showPaymentModal = false;

            if (outcome === 'Successful') {
              this.toastService.success('Payment completed successfully! You can now accept your seat.');
            } else if (outcome === 'Failed') {
              this.toastService.error('Payment failed as simulated. You can retry before deadline.');
            } else {
              this.toastService.info('Payment was cancelled.');
            }
            this.loadAllotment();
          },
          error: (err) => {
            this.processingPayment = false;
            this.toastService.error(err.error?.message || 'Payment simulation error');
          }
        });
      },
      error: (err) => {
        this.processingPayment = false;
        this.toastService.error(err.error?.message || 'Failed to initialize payment');
      }
    });
  }

  acceptSeat() {
    if (!this.allocation) return;
    this.accepting = true;

    this.seatPaymentService.acceptSeat(this.allocation._id).subscribe({
      next: (res) => {
        this.accepting = false;
        this.toastService.success('Provisional seat acceptance confirmed!');
        this.router.navigate(['/student/receipt']);
      },
      error: (err) => {
        this.accepting = false;
        this.toastService.error(err.error?.message || 'Could not accept seat');
      }
    });
  }

  openDeclineModal() {
    this.showDeclineModal = true;
  }

  confirmDecline() {
    if (!this.allocation) return;
    this.seatPaymentService.declineSeat(this.allocation._id, this.declineReason).subscribe({
      next: () => {
        this.showDeclineModal = false;
        this.toastService.info('Seat allotment has been declined and released.');
        this.loadAllotment();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to decline seat');
      }
    });
  }
}
