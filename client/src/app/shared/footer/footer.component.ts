import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-iem-navy text-slate-300 text-xs border-t border-blue-900 mt-auto">
      <div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          
          <!-- Column 1: Institute Info -->
          <div class="md:col-span-2 space-y-2">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs">IEM</span>
              <span class="font-bold text-white text-sm">Institute of Engineering &amp; Management</span>
            </div>
            <p class="text-slate-400 leading-relaxed text-xs">
              Management House, D-1, Sector-V, Salt Lake Electronics Complex, Kolkata – 700091, West Bengal, India.
            </p>
            <p class="text-blue-300 font-medium text-[11px]">
              Affiliated to MAKAUT • Approved by AICTE • NAAC Accredited 'A' Grade
            </p>
          </div>

          <!-- Column 2: Academic Project Info -->
          <div class="space-y-1">
            <h5 class="text-white font-semibold uppercase tracking-wider text-[11px]">Academic Coursework</h5>
            <p class="text-slate-400">Software Engineering &amp; Project Management</p>
            <p class="text-slate-400">Course Code: <span class="font-mono text-amber-300">PCC-CS504</span></p>
            <p class="text-slate-400">Architecture: <span class="text-emerald-300">MEAN Stack</span></p>
          </div>

          <!-- Column 3: Demonstration Helpline -->
          <div class="space-y-1">
            <h5 class="text-white font-semibold uppercase tracking-wider text-[11px]">Admission Cell (Demo)</h5>
            <p class="text-slate-400">Email: admissions&#64;iemcal.edu</p>
            <p class="text-slate-400">Phone: +91 (033) 2357-2059</p>
            <p class="text-slate-400">Hours: Mon – Fri (10:00 AM – 5:00 PM)</p>
          </div>

        </div>

        <div class="pt-6 border-t border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
          <div>
            &copy; 2026 Institute of Engineering &amp; Management. All rights reserved.
          </div>
          <div class="bg-blue-950/80 px-3 py-1 rounded text-amber-300 border border-blue-900 font-medium">
            Academic Project Demonstration • Strictly Not For Official Admission Processing
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
