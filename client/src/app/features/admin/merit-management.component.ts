import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MeritService } from '../../core/services/merit.service';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { AdmissionProgramme, MeritConfiguration, MeritEntry } from '../../models/models';

@Component({
  selector: 'app-merit-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Merit Calculation &amp; Ranking Engine</h1>
          <p class="text-xs text-slate-500 mt-1">Configure admission rules, calculate deterministic rankings, and publish official category lists</p>
        </div>

        <div class="flex items-center gap-2">
          <!-- CSV Export Button -->
          @if (entries.length > 0) {
            <button (click)="exportCSV()" class="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm">
              <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>Export CSV</span>
            </button>
          }

          <!-- Calculate Preview Button -->
          <button (click)="calculatePreview()" [disabled]="calculating"
            class="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1.5 shadow-sm">
            @if (calculating) {
              <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Calculating...</span>
            } @else {
              <span>⚡ Calculate Merit (Preview)</span>
            }
          </button>

          <!-- Publish List Button -->
          <button (click)="publishList()" [disabled]="publishing"
            class="px-5 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-sm">
            @if (publishing) {
              <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Publishing...</span>
            } @else {
              <span>📢 Publish Final List</span>
            }
          </button>
        </div>
      </div>

      <!-- Programme Selector & Config Card -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          
          <div>
            <label class="block font-bold text-slate-700 mb-1">Target Programme *</label>
            <select [(ngModel)]="selectedProgrammeId" (change)="onProgrammeChange()" class="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800">
              @for (prog of programmes; track prog._id) {
                <option [value]="prog._id">{{ prog.name }} ({{ prog.code }})</option>
              }
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Primary Ranking Criterion *</label>
            <select [(ngModel)]="meritConfig.primaryCriterion" class="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800">
              <option value="EntranceRank">Entrance Examination Rank (ASC)</option>
              <option value="Class12Marks">Class 12 Marks Percentage (DESC)</option>
              <option value="EntrancePercentile">Entrance Percentile (DESC)</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Tie-Breaker Rule 1</label>
            <input type="text" value="Class 12 Marks % (Higher is Better)" disabled class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600">
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Tie-Breaker Rule 2</label>
            <input type="text" value="Class 10 Marks % (Higher is Better)" disabled class="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600">
          </div>

        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div class="flex items-center gap-2">
            <span class="text-slate-500">Status:</span>
            <span class="badge-status" [ngClass]="meritConfig.status === 'Published' ? 'badge-verified' : 'badge-under-review'">
              {{ meritConfig.status || 'Draft' }}
            </span>
            @if (meritConfig.publishedAt) {
              <span class="text-slate-400 font-mono">Last Published: {{ meritConfig.publishedAt | date:'medium' }}</span>
            }
          </div>

          <button (click)="saveConfig()" class="text-blue-600 font-bold hover:underline">
            Save Criteria Settings
          </button>
        </div>
      </div>

      <!-- Merit Results Table & Category Tabs -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 text-xs">
            @for (cat of ['ALL', 'GENERAL', 'OBC', 'SC', 'ST']; track cat) {
              <button (click)="filterCat(cat)" [class.bg-white]="selectedCategory === cat" [class.shadow-sm]="selectedCategory === cat" [class.font-bold]="selectedCategory === cat" class="px-3 py-1.5 rounded-lg text-slate-700 transition">
                {{ cat }}
              </button>
            }
          </div>

          <div class="text-xs font-bold text-slate-600">
            Total Candidates: <span class="text-blue-700 font-mono">{{ filteredEntries.length }}</span>
          </div>
        </div>

        <div class="overflow-x-auto rounded-xl border border-slate-200">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th class="py-3 px-4">Overall Rank</th>
                <th class="py-3 px-4">Category Rank</th>
                <th class="py-3 px-4">Application ID</th>
                <th class="py-3 px-4">Candidate Name</th>
                <th class="py-3 px-4">Category</th>
                <th class="py-3 px-4">Exam</th>
                <th class="py-3 px-4 text-right">Entrance Rank</th>
                <th class="py-3 px-4 text-right">Class 12 %</th>
                <th class="py-3 px-4 text-right">Tie-Breakers</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @if (filteredEntries.length === 0) {
                <tr>
                  <td colspan="9" class="py-10 text-center text-slate-400">
                    No eligible verified candidates available for ranking yet. Please run Calculate Merit.
                  </td>
                </tr>
              }
              @for (entry of filteredEntries; track entry.applicationId) {
                <tr class="hover:bg-slate-50 transition">
                  <td class="py-3 px-4 font-bold text-blue-700 font-mono text-sm">#{{ entry.position }}</td>
                  <td class="py-3 px-4 font-mono font-semibold">{{ entry.categoryPosition }}</td>
                  <td class="py-3 px-4 font-mono font-bold">{{ entry.applicationId }}</td>
                  <td class="py-3 px-4 font-bold text-slate-900">{{ entry.candidateName }}</td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">{{ entry.category }}</span>
                  </td>
                  <td class="py-3 px-4">{{ entry.entranceExam }}</td>
                  <td class="py-3 px-4 text-right font-mono font-bold">{{ entry.entranceRank | number }}</td>
                  <td class="py-3 px-4 text-right font-mono">{{ entry.class12Percentage }}%</td>
                  <td class="py-3 px-4 text-right text-[11px] text-slate-500 font-mono">{{ entry.tieBreakDetails }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

      </div>

    </div>
  `
})
export class MeritManagementComponent implements OnInit {
  meritService = inject(MeritService);
  adminService = inject(AdminService);
  toastService = inject(ToastService);

  programmes: AdmissionProgramme[] = [];
  selectedProgrammeId = '';
  selectedCategory = 'ALL';
  entries: MeritEntry[] = [];
  filteredEntries: MeritEntry[] = [];

  meritConfig: any = {
    primaryCriterion: 'EntranceRank',
    rankOrder: 'ASC',
    tieBreakers: ['Class12Marks', 'Class10Marks'],
    status: 'Draft'
  };

  calculating = false;
  publishing = false;

  ngOnInit() {
    this.adminService.getProgrammes().subscribe({
      next: (res) => {
        if (res.success && res.programmes.length > 0) {
          this.programmes = res.programmes;
          this.selectedProgrammeId = this.programmes[0]._id;
          this.onProgrammeChange();
        }
      }
    });
  }

  onProgrammeChange() {
    if (!this.selectedProgrammeId) return;
    this.meritService.getConfig(this.selectedProgrammeId).subscribe({
      next: (res) => {
        if (res.success && res.config) {
          this.meritConfig = res.config;
        }
      }
    });

    this.meritService.getPublishedList(this.selectedProgrammeId).subscribe({
      next: (res) => {
        if (res.success) {
          this.entries = res.entries;
          this.filterCat('ALL');
        }
      },
      error: () => {
        this.entries = [];
        this.filteredEntries = [];
      }
    });
  }

  saveConfig() {
    this.meritService.updateConfig(this.selectedProgrammeId, this.meritConfig).subscribe({
      next: (res) => {
        if (res.success) this.toastService.success('Merit criteria saved successfully');
      }
    });
  }

  calculatePreview() {
    this.calculating = true;
    this.meritService.calculateMerit(this.selectedProgrammeId).subscribe({
      next: (res) => {
        this.calculating = false;
        this.entries = res.entries;
        this.meritConfig = res.config;
        this.filterCat(this.selectedCategory);
        this.toastService.success(`Calculated merit preview with ${res.totalEligible} eligible candidates`);
      },
      error: (err) => {
        this.calculating = false;
        this.toastService.error(err.error?.message || 'Merit calculation failed');
      }
    });
  }

  publishList() {
    this.publishing = true;
    this.meritService.publishMeritList(this.selectedProgrammeId).subscribe({
      next: (res) => {
        this.publishing = false;
        this.entries = res.entries;
        this.meritConfig.status = 'Published';
        this.meritConfig.publishedAt = new Date().toISOString();
        this.filterCat(this.selectedCategory);
        this.toastService.success('Official merit list published successfully! All eligible candidates notified.');
      },
      error: (err) => {
        this.publishing = false;
        this.toastService.error(err.error?.message || 'Publishing failed');
      }
    });
  }

  filterCat(cat: string) {
    this.selectedCategory = cat;
    if (cat === 'ALL') {
      this.filteredEntries = this.entries;
    } else {
      this.filteredEntries = this.entries.filter(e => e.category === cat);
    }
  }

  exportCSV() {
    this.meritService.exportCSV(this.selectedProgrammeId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MeritList-${this.selectedProgrammeId}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastService.success('Merit list exported to CSV');
      }
    });
  }
}
