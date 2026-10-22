import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SeatPaymentService } from '../../core/services/seat-payment.service';
import { AdminService } from '../../core/services/admin.service';
import { ApplicationService } from '../../core/services/application.service';
import { ToastService } from '../../core/services/toast.service';
import { AdmissionProgramme, Seat, Application } from '../../models/models';

@Component({
  selector: 'app-seat-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Seat Inventory &amp; Allocation Manager</h1>
          <p class="text-xs text-slate-500 mt-1">Manage seat quotas, monitor occupancy, and allot seats to verified candidates</p>
        </div>

        <button (click)="openAllotModal()" class="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1.5 shadow-sm">
          <span>+ Allot Seat to Candidate</span>
        </button>
      </div>

      <!-- Programme Selector & Stats Cards -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div class="flex items-center gap-3">
            <label class="text-xs font-bold text-slate-700 whitespace-nowrap">Programme:</label>
            <select [(ngModel)]="selectedProgrammeId" (change)="loadSeats()" class="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-800">
              @for (prog of programmes; track prog._id) {
                <option [value]="prog._id">{{ prog.name }} ({{ prog.code }})</option>
              }
            </select>
          </div>

          <div class="text-xs text-slate-500 font-medium">
            Intake Fee: <strong class="text-slate-900">&#8377;{{ selectedProg?.admissionFee | number }}</strong>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span class="text-[10px] uppercase font-bold text-slate-400 block">Total Capacity</span>
            <span class="text-2xl font-extrabold text-slate-800 font-mono">{{ stats.total || 0 }}</span>
          </div>

          <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <span class="text-[10px] uppercase font-bold text-emerald-600 block">Available</span>
            <span class="text-2xl font-extrabold text-emerald-700 font-mono">{{ stats.available || 0 }}</span>
          </div>

          <div class="p-3 rounded-xl bg-purple-50 border border-purple-200">
            <span class="text-[10px] uppercase font-bold text-purple-600 block">Allotted</span>
            <span class="text-2xl font-extrabold text-purple-700 font-mono">{{ stats.allotted || 0 }}</span>
          </div>

          <div class="p-3 rounded-xl bg-teal-50 border border-teal-200">
            <span class="text-[10px] uppercase font-bold text-teal-600 block">Accepted &amp; Confirmed</span>
            <span class="text-2xl font-extrabold text-teal-700 font-mono">{{ stats.accepted || 0 }}</span>
          </div>

          <div class="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
            <span class="text-[10px] uppercase font-bold text-zinc-500 block">Declined / Released</span>
            <span class="text-2xl font-extrabold text-zinc-700 font-mono">{{ stats.declined || 0 }}</span>
          </div>
        </div>

        <!-- Seat Inventory Matrix -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Individual Seat Allocation Inventory</h3>
            <span class="text-[11px] text-slate-500">Click <strong>Take Back</strong> on any allotted seat to revoke accidental allocations</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            @for (seat of seats; track seat._id) {
              <div class="p-3 rounded-xl border text-xs flex flex-col justify-between space-y-2 transition shadow-2xs"
                [ngClass]="{
                  'bg-emerald-50/60 border-emerald-300 text-emerald-950': seat.status === 'Available',
                  'bg-purple-50/60 border-purple-300 text-purple-950': seat.status === 'Allotted',
                  'bg-teal-50 border-teal-400 text-teal-950 font-bold': seat.status === 'Accepted',
                  'bg-slate-100 border-slate-300 text-slate-600': seat.status === 'Declined'
                }">
                <div class="flex items-center justify-between">
                  <span class="font-mono font-extrabold text-xs">{{ seat.seatIdentifier }}</span>
                  <span class="text-[9px] font-bold px-1.5 py-0.2 rounded" [ngClass]="{
                    'bg-emerald-200 text-emerald-900': seat.status === 'Available',
                    'bg-purple-200 text-purple-900': seat.status === 'Allotted',
                    'bg-teal-200 text-teal-900': seat.status === 'Accepted',
                    'bg-slate-200 text-slate-800': seat.status === 'Declined'
                  }">{{ seat.category }}</span>
                </div>

                <div class="text-[10px] space-y-0.5">
                  @if (seat.allottedTo) {
                    <span class="font-bold text-slate-900 block truncate" [title]="seat.allottedTo.personalInfo?.fullName">{{ seat.allottedTo.personalInfo?.fullName || 'Candidate' }}</span>
                    <span class="text-[9px] font-mono text-blue-700 block">{{ seat.allottedTo.applicationId }}</span>
                  } @else {
                    <span class="text-emerald-700 font-semibold block">Vacant</span>
                  }
                </div>

                @if (seat.status === 'Allotted' || seat.status === 'Accepted') {
                  <div class="pt-1.5 border-t border-purple-200/80 flex items-center justify-between gap-1">
                    <span class="text-[9px] font-semibold text-purple-800 uppercase">{{ seat.status }}</span>
                    <button (click)="openRevokeModal(seat)"
                      class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition cursor-pointer"
                      title="Take back seat from applicant">
                      Take Back
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        </div>

      </div>

      <!-- ALLOT SEAT MODAL -->
      @if (showAllotModal) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 class="text-base font-extrabold text-slate-900">Allot Seat to Eligible Candidate</h3>
              <button (click)="showAllotModal = false" class="text-slate-400 hover:text-slate-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div class="space-y-4 text-xs">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Select Candidate (Document Verified &amp; Eligible) *</label>
                <select [(ngModel)]="allotTargetAppId" class="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800">
                  <option value="">-- Choose Eligible Candidate --</option>
                  @for (c of eligibleCandidates; track c._id) {
                    <option [value]="c._id">
                      {{ c.personalInfo.fullName }} ({{ c.applicationId }}) - Rank #{{ c.academicInfo.entranceRank }}, Cat: {{ c.personalInfo.category }}
                    </option>
                  }
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Acceptance Deadline (Days) *</label>
                <input type="number" min="1" max="30" [(ngModel)]="allotDeadlineDays" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800">
                <span class="text-[10px] text-slate-400 mt-1 block">Candidate will have this many days to pay and accept the seat offer.</span>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button (click)="showAllotModal = false" class="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700">Cancel</button>
              <button (click)="confirmAllotment()" [disabled]="!allotTargetAppId || allotting"
                class="px-5 py-2 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs disabled:opacity-50 flex items-center gap-2">
                @if (allotting) {
                  <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Processing...</span>
                } @else {
                  <span>Confirm Allotment &amp; Notify</span>
                }
              </button>
            </div>

          </div>
        </div>
      }

      <!-- REVOKE / TAKE BACK SEAT MODAL -->
      @if (selectedRevokeSeat) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 uppercase tracking-wider">
                  Admin Action: Revoke Allotment
                </span>
                <h3 class="text-base font-extrabold text-slate-900 mt-1">Take Back Seat {{ selectedRevokeSeat.seatIdentifier }}</h3>
              </div>
              <button (click)="selectedRevokeSeat = null" class="text-slate-400 hover:text-slate-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div><strong>Seat ID:</strong> <span class="font-mono text-blue-700 font-bold">{{ selectedRevokeSeat.seatIdentifier }}</span> ({{ selectedRevokeSeat.category }})</div>
              <div><strong>Currently Allotted To:</strong> {{ selectedRevokeSeat.allottedTo?.personalInfo?.fullName || 'Candidate' }} (<span class="font-mono text-slate-600">{{ selectedRevokeSeat.allottedTo?.applicationId }}</span>)</div>
              <div><strong>Current Status:</strong> <span class="font-bold text-purple-700">{{ selectedRevokeSeat.status }}</span></div>
            </div>

            <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
              <strong>Notice:</strong> Taking back this seat will release it back to <strong>Available</strong> status for new allotment, cancel any pending payment, and restore the candidate's application back to merit consideration so they are not disqualified.
            </div>

            <div class="text-xs">
              <label class="block font-bold text-slate-700 mb-1">Reason for Taking Back Seat:</label>
              <textarea [(ngModel)]="revokeReason" rows="2" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800" placeholder="e.g. Allotted by mistake, quota correction..."></textarea>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button (click)="selectedRevokeSeat = null" class="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700">Cancel</button>
              <button (click)="confirmRevokeSeat()" [disabled]="revoking"
                class="px-5 py-2 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-xs disabled:opacity-50 flex items-center gap-1.5">
                @if (revoking) {
                  <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Revoking...</span>
                } @else {
                  <span>Confirm &amp; Take Back Seat</span>
                }
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class SeatManagementComponent implements OnInit {
  seatPaymentService = inject(SeatPaymentService);
  adminService = inject(AdminService);
  applicationService = inject(ApplicationService);
  toastService = inject(ToastService);

  programmes: AdmissionProgramme[] = [];
  selectedProgrammeId = '';
  selectedProg: AdmissionProgramme | null = null;
  seats: Seat[] = [];
  stats: any = {};

  showAllotModal = false;
  eligibleCandidates: Application[] = [];
  allotTargetAppId = '';
  allotDeadlineDays = 5;
  allotting = false;

  selectedRevokeSeat: Seat | null = null;
  revokeReason = 'Allotted by mistake';
  revoking = false;

  ngOnInit() {
    this.adminService.getProgrammes().subscribe({
      next: (res) => {
        if (res.success && res.programmes.length > 0) {
          this.programmes = res.programmes;
          this.selectedProgrammeId = this.programmes[0]._id;
          this.loadSeats();
        }
      }
    });
  }

  loadSeats() {
    if (!this.selectedProgrammeId) return;
    this.selectedProg = this.programmes.find(p => p._id === this.selectedProgrammeId) || null;

    this.seatPaymentService.getProgrammeSeats(this.selectedProgrammeId).subscribe({
      next: (res) => {
        if (res.success) {
          this.seats = res.seats;
          this.stats = res.stats;
        }
      }
    });
  }

  openAllotModal() {
    this.showAllotModal = true;
    this.applicationService.getAllApplications({
      programme: this.selectedProgrammeId,
      limit: 50
    }).subscribe({
      next: (res) => {
        if (res.success) {
          // Filter to verified & eligible candidates without active seat
          this.eligibleCandidates = res.applications.filter(
            a => a.isEligible && a.status !== 'Seat Allotted' && a.status !== 'Accepted'
          );
        }
      }
    });
  }

  confirmAllotment() {
    if (!this.allotTargetAppId) return;
    this.allotting = true;

    this.seatPaymentService.allotSeat(this.allotTargetAppId, undefined, this.allotDeadlineDays).subscribe({
      next: (res) => {
        this.allotting = false;
        this.showAllotModal = false;
        this.toastService.success(`Seat ${res.seat.seatIdentifier} allotted successfully! Candidate notified.`);
        this.loadSeats();
      },
      error: (err) => {
        this.allotting = false;
        this.toastService.error(err.error?.message || 'Seat allotment failed');
      }
    });
  }

  openRevokeModal(seat: Seat) {
    this.selectedRevokeSeat = seat;
    this.revokeReason = 'Allotted by mistake';
  }

  confirmRevokeSeat() {
    if (!this.selectedRevokeSeat) return;
    this.revoking = true;

    this.seatPaymentService.revokeSeat({
      seatId: this.selectedRevokeSeat._id,
      reason: this.revokeReason
    }).subscribe({
      next: (res) => {
        this.revoking = false;
        const seatName = this.selectedRevokeSeat?.seatIdentifier;
        this.selectedRevokeSeat = null;
        this.toastService.success(`Seat ${seatName} has been successfully taken back and released to available inventory!`);
        this.loadSeats();
      },
      error: (err) => {
        this.revoking = false;
        this.toastService.error(err.error?.message || 'Failed to revoke seat allotment');
      }
    });
  }
}

