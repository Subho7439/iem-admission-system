import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-8">
      
      <!-- Header Banner -->
      <div class="bg-gradient-to-r from-iem-navy to-iem-dark rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-900 uppercase tracking-wider">
            Dean &amp; Admission Directorate
          </span>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">Executive Admission Dashboard</h1>
          <p class="text-xs sm:text-sm text-blue-200 mt-1">Real-time statistics across all programmes for Academic Session 2026–2027</p>
        </div>

        <div class="flex items-center gap-2">
          <a routerLink="/admin/merit" class="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-sm">
            Merit Engine
          </a>
          <a routerLink="/admin/seats" class="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm">
            Seat Allotment
          </a>
        </div>
      </div>

      <!-- KPI Metrics Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Registered</span>
          <div class="text-2xl font-extrabold text-slate-900 font-mono">{{ stats.totalRegistered || 0 }}</div>
          <span class="text-[10px] text-blue-600 font-medium">Student Accounts</span>
        </div>

        <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Submitted</span>
          <div class="text-2xl font-extrabold text-blue-700 font-mono">{{ (stats.submittedCount + stats.underReviewCount) || 0 }}</div>
          <span class="text-[10px] text-slate-400 font-medium">Awaiting/In Review</span>
        </div>

        <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Doc Verified</span>
          <div class="text-2xl font-extrabold text-emerald-600 font-mono">{{ stats.verifiedCount || 0 }}</div>
          <span class="text-[10px] text-emerald-600 font-medium">Approved Records</span>
        </div>

        <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Action Required</span>
          <div class="text-2xl font-extrabold text-rose-600 font-mono">{{ stats.actionRequiredCount || 0 }}</div>
          <span class="text-[10px] text-rose-500 font-medium">Rejected Docs</span>
        </div>

        <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Seats Allotted</span>
          <div class="text-2xl font-extrabold text-purple-700 font-mono">{{ stats.allottedSeats || 0 }}</div>
          <span class="text-[10px] text-slate-400 font-medium">Of {{ stats.totalSeats || 0 }} Total</span>
        </div>

        <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Confirmed Seats</span>
          <div class="text-2xl font-extrabold text-teal-600 font-mono">{{ stats.acceptedSeats || 0 }}</div>
          <span class="text-[10px] text-teal-600 font-medium">Paid &amp; Accepted</span>
        </div>

      </div>

      <!-- Programme Seat Utilization Card -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-extrabold text-slate-900">Programme Seat Occupancy &amp; Demand</h3>
            <p class="text-xs text-slate-500">Live seat intake status across academic departments</p>
          </div>
          <a routerLink="/admin/seats" class="text-xs font-bold text-blue-600 hover:underline">
            Manage Seat Capacity &rarr;
          </a>
        </div>

        <div class="space-y-4">
          @for (prog of programmeStats; track prog.id) {
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-slate-800">{{ prog.name }} ({{ prog.code }})</span>
                <span class="font-mono text-slate-600 font-semibold">
                  {{ prog.occupiedSeats }} / {{ prog.totalSeats }} Seats ({{ Math.round((prog.occupiedSeats / (prog.totalSeats || 1)) * 100) }}%)
                </span>
              </div>
              <!-- Progress bar -->
              <div class="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div class="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                  [style.width.%]="Math.min(100, (prog.occupiedSeats / (prog.totalSeats || 1)) * 100)">
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Recent System Audit Trail -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-extrabold text-slate-900">Administrative Audit Trail</h3>
          <span class="text-xs text-slate-400 font-mono">Timestamped Activity</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th class="py-2.5 px-3">Timestamp</th>
                <th class="py-2.5 px-3">Actor</th>
                <th class="py-2.5 px-3">Role</th>
                <th class="py-2.5 px-3">Action</th>
                <th class="py-2.5 px-3">Entity</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (log of recentActivity; track log._id) {
                <tr class="hover:bg-slate-50 transition">
                  <td class="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{{ log.createdAt | date:'short' }}</td>
                  <td class="py-2.5 px-3 font-semibold text-slate-800">{{ log.actorName }}</td>
                  <td class="py-2.5 px-3">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase" [ngClass]="log.actorRole === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'">
                      {{ log.actorRole }}
                    </span>
                  </td>
                  <td class="py-2.5 px-3 font-mono font-bold text-blue-700">{{ log.action }}</td>
                  <td class="py-2.5 px-3 text-slate-600">{{ log.entity }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  adminService = inject(AdminService);

  stats: any = {};
  programmeStats: any[] = [];
  recentActivity: any[] = [];
  Math = Math;

  ngOnInit() {
    this.adminService.getDashboardStats().subscribe({
      next: (res) => {
        if (res.success) {
          this.stats = res.stats;
          this.programmeStats = res.programmeStats;
          this.recentActivity = res.recentActivity;
        }
      }
    });
  }
}
