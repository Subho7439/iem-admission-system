import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../core/services/application.service';
import { MeritService } from '../../core/services/merit.service';
import { Application, MeritEntry } from '../../models/models';

@Component({
  selector: 'app-merit-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Merit Standings &amp; Rankings</h1>
        <p class="text-xs text-slate-500 mt-1">Review your official merit position and category cutoff results</p>
      </div>

      <!-- Candidate's Personal Merit Card -->
      <div class="bg-gradient-to-r from-blue-900 to-iem-navy rounded-2xl p-6 sm:p-8 text-white shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
            Official Merit Result
          </span>
          <span class="text-xs text-blue-200">Programme: {{ application?.programme?.name || 'B.Tech' }}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div class="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
            <span class="text-[11px] text-blue-200 uppercase font-semibold block">Overall Merit Position</span>
            <div class="text-3xl font-extrabold text-white font-mono mt-1">
              {{ application?.meritPosition ? '#' + application?.meritPosition : 'Pending Publication' }}
            </div>
            <span class="text-[10px] text-blue-300 mt-0.5 block">Determined by Entrance Rank</span>
          </div>

          <div class="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
            <span class="text-[11px] text-blue-200 uppercase font-semibold block">Category Rank ({{ application?.personalInfo?.category || 'GENERAL' }})</span>
            <div class="text-3xl font-extrabold text-amber-300 font-mono mt-1">
              {{ application?.categoryMeritPosition ? '#' + application?.categoryMeritPosition : 'Pending Publication' }}
            </div>
            <span class="text-[10px] text-blue-300 mt-0.5 block">Reserved Category Quota</span>
          </div>

          <div class="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
            <span class="text-[11px] text-blue-200 uppercase font-semibold block">Tie-Breaking Score</span>
            <div class="text-base font-bold text-white mt-1">
              Class 12: {{ application?.academicInfo?.class12Percentage }}%
            </div>
            <span class="text-[10px] text-blue-300 mt-0.5 block">Class 10: {{ application?.academicInfo?.class10Percentage }}%</span>
          </div>
        </div>
      </div>

      <!-- Published Programme List Section -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 class="text-base font-bold text-slate-900">Programme Merit List ({{ application?.programme?.code }})</h3>
            <p class="text-xs text-slate-500">Official rankings verified by IEM Admission Committee</p>
          </div>

          <!-- Category filter -->
          <div class="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 text-xs">
            @for (cat of ['ALL', 'GENERAL', 'OBC', 'SC', 'ST']; track cat) {
              <button (click)="filterCat(cat)" [class.bg-white]="selectedCategory === cat" [class.shadow-sm]="selectedCategory === cat" [class.font-bold]="selectedCategory === cat" class="px-2.5 py-1 rounded-lg text-slate-700 transition">
                {{ cat }}
              </button>
            }
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto rounded-xl border border-slate-200">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th class="py-3 px-4">Overall Rank</th>
                <th class="py-3 px-4">Category Rank</th>
                <th class="py-3 px-4">App ID</th>
                <th class="py-3 px-4">Candidate Name</th>
                <th class="py-3 px-4">Category</th>
                <th class="py-3 px-4 text-right">Entrance Rank</th>
                <th class="py-3 px-4 text-right">Class 12 %</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (entry of filteredEntries; track entry.applicationId) {
                <tr class="hover:bg-slate-50 transition" [ngClass]="{'bg-blue-50/60 font-semibold': entry.applicationId === application?.applicationId}">
                  <td class="py-3 px-4 font-bold text-blue-700">#{{ entry.position }}</td>
                  <td class="py-3 px-4 font-mono">{{ entry.categoryPosition }}</td>
                  <td class="py-3 px-4 font-mono">{{ entry.applicationId }}</td>
                  <td class="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span>{{ entry.candidateName }}</span>
                    @if (entry.applicationId === application?.applicationId) {
                      <span class="px-1.5 py-0.2 rounded text-[9px] bg-blue-600 text-white font-bold">YOU</span>
                    }
                  </td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">{{ entry.category }}</span>
                  </td>
                  <td class="py-3 px-4 text-right font-mono">{{ entry.entranceRank | number }}</td>
                  <td class="py-3 px-4 text-right font-mono">{{ entry.class12Percentage }}%</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class MeritViewComponent implements OnInit {
  applicationService = inject(ApplicationService);
  meritService = inject(MeritService);

  application: Application | null = null;
  entries: MeritEntry[] = [];
  filteredEntries: MeritEntry[] = [];
  selectedCategory: string = 'ALL';

  ngOnInit() {
    this.applicationService.getMyApplication().subscribe({
      next: (res) => {
        if (res.success) {
          this.application = res.application;
          if (this.application?.programme?._id) {
            this.loadMeritList(this.application.programme._id);
          }
        }
      }
    });
  }

  loadMeritList(progId: string) {
    this.meritService.getPublishedList(progId).subscribe({
      next: (res) => {
        if (res.success) {
          this.entries = res.entries;
          this.filterCat('ALL');
        }
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
}
