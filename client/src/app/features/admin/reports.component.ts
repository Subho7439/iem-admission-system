import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Admission Analytics &amp; Reports</h1>
          <p class="text-xs text-slate-500 mt-1">Aggregated statistics, category breakdowns, and official CSV exports</p>
        </div>

        <button (click)="exportCSV()" class="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-2 shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <span>Export All Applications CSV</span>
        </button>
      </div>

      <!-- Report Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- Report 1: Applications by Status -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 class="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Applications by Lifecycle Status</h3>
          <div class="space-y-2">
            @for (item of reportsData?.byStatus; track item._id) {
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs">
                <span class="font-bold text-slate-800">{{ item._id || 'Unknown' }}</span>
                <span class="font-mono font-extrabold text-blue-700 px-2.5 py-0.5 rounded-full bg-blue-100">{{ item.count }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Report 2: Document Verification Summary -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 class="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Document Scrutiny Distribution</h3>
          <div class="space-y-2">
            @for (item of reportsData?.documentSummary; track item._id) {
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs">
                <span class="font-bold text-slate-800">{{ item._id }}</span>
                <span class="font-mono font-extrabold px-2.5 py-0.5 rounded-full" [ngClass]="{
                  'bg-emerald-100 text-emerald-800': item._id === 'Approved',
                  'bg-rose-100 text-rose-800': item._id === 'Rejected',
                  'bg-amber-100 text-amber-800': item._id === 'Pending' || item._id === 'Under Review',
                  'bg-slate-200 text-slate-700': item._id === 'Not Uploaded'
                }">{{ item.count }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Report 3: Seat Inventory Allocation -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 class="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Seat Capacity Utilization</h3>
          <div class="space-y-2">
            @for (item of reportsData?.seatUtilization; track item._id) {
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs">
                <span class="font-bold text-slate-800">{{ item._id }}</span>
                <span class="font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">{{ item.count }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Report 4: Fee Payment Breakdown -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 class="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Simulated Fee Transactions</h3>
          <div class="space-y-2">
            @for (item of reportsData?.paymentSummary; track item._id) {
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs">
                <span class="font-bold text-slate-800">{{ item._id }} ({{ item.count }} Txns)</span>
                <span class="font-mono font-extrabold text-emerald-700">&#8377; {{ item.totalAmount | number }}</span>
              </div>
            }
          </div>
        </div>

      </div>

    </div>
  `
})
export class ReportsComponent implements OnInit {
  adminService = inject(AdminService);
  toastService = inject(ToastService);

  reportsData: any = null;

  ngOnInit() {
    this.adminService.getReportsSummary().subscribe({
      next: (res) => {
        if (res.success) {
          this.reportsData = res.data;
        }
      }
    });
  }

  exportCSV() {
    this.adminService.exportApplicationsCSV().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `IEM-Applications-Summary-${Date.now()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastService.success('Full applications report exported to CSV');
      }
    });
  }
}
