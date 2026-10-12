import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { AdmissionProgramme } from '../../models/models';

@Component({
  selector: 'app-programmes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-900">Academic Programmes &amp; Eligibility Criteria</h1>
        <p class="text-sm text-slate-600 mt-1">Explore all approved engineering and computing degree courses offered at IEM Kolkata.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        @for (prog of programmes; track prog._id) {
          <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4">
            <div class="flex items-center justify-between">
              <span class="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {{ prog.degree }} • {{ prog.durationYears }} Years Full Time
              </span>
              <span class="text-xs font-mono font-bold text-slate-500">Dept Code: {{ prog.code }}</span>
            </div>

            <h2 class="text-xl font-bold text-slate-900">{{ prog.name }}</h2>

            <div class="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div>
                <span class="text-slate-400 block uppercase font-semibold text-[10px]">Total Seat Capacity</span>
                <span class="text-base font-bold text-slate-900">{{ prog.totalSeats }} Seats</span>
              </div>
              <div>
                <span class="text-slate-400 block uppercase font-semibold text-[10px]">Admission Fee</span>
                <span class="text-base font-bold text-blue-700">&#8377; {{ prog.admissionFee | number }}</span>
              </div>
              <div>
                <span class="text-slate-400 block uppercase font-semibold text-[10px]">Semester Tuition Fee</span>
                <span class="text-base font-bold text-slate-900">&#8377; {{ prog.semesterFee | number }}</span>
              </div>
              <div>
                <span class="text-slate-400 block uppercase font-semibold text-[10px]">Accepted Examinations</span>
                <span class="text-xs font-bold text-slate-800">{{ prog.eligibility.allowedExams.join(', ') }}</span>
              </div>
            </div>

            <div class="space-y-1.5 text-xs text-slate-600">
              <h4 class="font-bold text-slate-800">Eligibility Criteria:</h4>
              <p>• Must score at least <span class="font-bold text-slate-900">{{ prog.eligibility.minClass12Percentage }}%</span> aggregate in Class 12 Higher Secondary.</p>
              <p>• Physics and Mathematics mandatory along with Chemistry / Biology / Computer Science.</p>
              <p>• Valid positive rank in {{ prog.eligibility.allowedExams.join(' or ') }} (Max Rank: {{ prog.eligibility.maxEntranceRank | number }}).</p>
            </div>

            <div class="pt-2 flex items-center justify-between border-t border-slate-100">
              <div class="text-[11px] text-slate-500">
                Quota Breakdown: GEN ({{ prog.seatsByCategory.GENERAL }}), OBC ({{ prog.seatsByCategory.OBC }}), SC ({{ prog.seatsByCategory.SC }}), ST ({{ prog.seatsByCategory.ST }})
              </div>
              <a routerLink="/auth/register" class="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition">
                Apply for Course
              </a>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ProgrammesComponent implements OnInit {
  adminService = inject(AdminService);
  programmes: AdmissionProgramme[] = [];

  ngOnInit() {
    this.adminService.getProgrammes().subscribe({
      next: (res) => {
        if (res.success) this.programmes = res.programmes;
      }
    });
  }
}
