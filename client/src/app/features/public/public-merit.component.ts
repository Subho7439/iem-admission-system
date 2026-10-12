import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MeritService } from '../../core/services/merit.service';
import { AdminService } from '../../core/services/admin.service';
import { AdmissionProgramme, MeritEntry } from '../../models/models';

@Component({
  selector: 'app-public-merit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900">Official Admission Merit Lists</h1>
          <p class="text-sm text-slate-600 mt-1">Academic Session 2026–2027 • Approved by IEM Admission Cell</p>
        </div>

        <!-- Programme Selector -->
        <div class="flex items-center gap-2">
          <label class="text-xs font-bold text-slate-700 whitespace-nowrap">Programme:</label>
          <select [(ngModel)]="selectedProgrammeId" (change)="loadMeritList()" class="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 shadow-sm focus:ring-2 focus:ring-blue-500">
            @for (prog of programmes; track prog._id) {
              <option [value]="prog._id">{{ prog.name }} ({{ prog.code }})</option>
            }
          </select>
        </div>
      </div>

      <!-- Filters & Category Tabs -->
      <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <!-- Category Tabs -->
          <div class="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 overflow-x-auto w-full sm:w-auto">
            @for (cat of ['ALL', 'GENERAL', 'OBC', 'SC', 'ST']; track cat) {
              <button (click)="setCategory(cat)" [class.bg-white]="selectedCategory === cat" [class.shadow-sm]="selectedCategory === cat" [class.font-bold]="selectedCategory === cat" class="px-3 py-1.5 rounded-lg text-xs text-slate-700 transition">
                {{ cat }}
              </button>
            }
          </div>

          <!-- Search Input -->
          <div class="w-full sm:w-72">
            <input type="text" [(ngModel)]="searchQuery" (input)="loadMeritList()" placeholder="Search Candidate Name or App ID..." class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 shadow-inner">
          </div>
        </div>

        <!-- Merit Table -->
        <div class="overflow-x-auto rounded-xl border border-slate-200">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th class="py-3 px-4">Rank</th>
                <th class="py-3 px-4">Category Rank</th>
                <th class="py-3 px-4">Application ID</th>
                <th class="py-3 px-4">Candidate Name</th>
                <th class="py-3 px-4">Category</th>
                <th class="py-3 px-4">Entrance Exam</th>
                <th class="py-3 px-4 text-right">Entrance Rank</th>
                <th class="py-3 px-4 text-right">Class 12 %</th>
                <th class="py-3 px-4 text-right">Class 10 %</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-800">
              @if (entries.length === 0) {
                <tr>
                  <td colspan="9" class="py-8 text-center text-slate-400">
                    No candidates found for the selected programme or criteria.
                  </td>
                </tr>
              }
              @for (entry of entries; track entry.applicationId) {
                <tr class="hover:bg-blue-50/40 transition">
                  <td class="py-3 px-4 font-bold text-blue-700">#{{ entry.position }}</td>
                  <td class="py-3 px-4 font-semibold text-slate-600">{{ entry.categoryPosition }}</td>
                  <td class="py-3 px-4 font-mono font-semibold">{{ entry.applicationId }}</td>
                  <td class="py-3 px-4 font-bold text-slate-900">{{ entry.candidateName }}</td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold" [ngClass]="{
                      'bg-slate-100 text-slate-800': entry.category === 'GENERAL',
                      'bg-amber-100 text-amber-800': entry.category === 'OBC',
                      'bg-emerald-100 text-emerald-800': entry.category === 'SC',
                      'bg-purple-100 text-purple-800': entry.category === 'ST'
                    }">{{ entry.category }}</span>
                  </td>
                  <td class="py-3 px-4">{{ entry.entranceExam }}</td>
                  <td class="py-3 px-4 text-right font-mono font-bold">{{ entry.entranceRank | number }}</td>
                  <td class="py-3 px-4 text-right font-mono">{{ entry.class12Percentage }}%</td>
                  <td class="py-3 px-4 text-right font-mono">{{ entry.class10Percentage }}%</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

      </div>
    </div>
  `
})
export class PublicMeritComponent implements OnInit {
  meritService = inject(MeritService);
  adminService = inject(AdminService);

  programmes: AdmissionProgramme[] = [];
  selectedProgrammeId: string = '';
  selectedCategory: string = 'ALL';
  searchQuery: string = '';
  entries: MeritEntry[] = [];

  ngOnInit() {
    this.adminService.getProgrammes().subscribe({
      next: (res) => {
        if (res.success && res.programmes.length > 0) {
          this.programmes = res.programmes;
          this.selectedProgrammeId = this.programmes[0]._id;
          this.loadMeritList();
        }
      }
    });
  }

  setCategory(cat: string) {
    this.selectedCategory = cat;
    this.loadMeritList();
  }

  loadMeritList() {
    if (!this.selectedProgrammeId) return;
    this.meritService.getPublishedList(
      this.selectedProgrammeId,
      this.selectedCategory === 'ALL' ? undefined : this.selectedCategory,
      this.searchQuery
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.entries = res.entries;
        }
      },
      error: () => {
        this.entries = [];
      }
    });
  }
}
