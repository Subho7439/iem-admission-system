import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="w-64 bg-white border-r border-slate-200 flex-shrink-0 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 shadow-sm">
      <div class="space-y-6">
        
        <!-- User Welcome Box -->
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 text-blue-800 font-bold flex items-center justify-center text-sm">
            {{ getInitials(authService.currentUser()?.name) }}
          </div>
          <div class="overflow-hidden">
            <h4 class="text-xs font-bold text-slate-900 truncate">{{ authService.currentUser()?.name }}</h4>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="w-1.5 h-1.5 rounded-full" [ngClass]="{
                'bg-amber-500': authService.isAdmin(),
                'bg-emerald-500': authService.isVerifier(),
                'bg-blue-600': authService.isStudent()
              }"></span>
              <span class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{{ authService.userRole() }}</span>
            </div>
          </div>
        </div>

        <!-- Role Nav Menu -->
        <nav class="space-y-1">

          <!-- STUDENT NAVIGATION -->
          @if (authService.isStudent()) {
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Student Portal</div>
            
            <a routerLink="/student/dashboard" routerLinkActive="bg-blue-50 text-blue-700 font-semibold border-r-4 border-blue-700" [routerLinkActiveOptions]="{exact: true}"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
              <span>Dashboard</span>
            </a>

            <a routerLink="/student/application" routerLinkActive="bg-blue-50 text-blue-700 font-semibold border-r-4 border-blue-700"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">
              <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>Application Form</span>
            </a>

            <a routerLink="/student/documents" routerLinkActive="bg-blue-50 text-blue-700 font-semibold border-r-4 border-blue-700"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">
              <svg class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              <span>Document Status</span>
            </a>

            <a routerLink="/student/merit" routerLinkActive="bg-blue-50 text-blue-700 font-semibold border-r-4 border-blue-700"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">
              <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
              <span>Merit Standings</span>
            </a>

            <a routerLink="/student/allotment" routerLinkActive="bg-blue-50 text-blue-700 font-semibold border-r-4 border-blue-700"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">
              <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
              <span>Seat Allotment & Pay</span>
            </a>

            <a routerLink="/student/receipt" routerLinkActive="bg-blue-50 text-blue-700 font-semibold border-r-4 border-blue-700"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">
              <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>Admission Receipt</span>
            </a>
          }

          <!-- ADMIN NAVIGATION -->
          @if (authService.isAdmin()) {
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Admin Portal</div>
            
            <a routerLink="/admin/dashboard" routerLinkActive="bg-blue-50 text-blue-700 font-semibold border-r-4 border-blue-700" [routerLinkActiveOptions]="{exact: true}"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
              <span>Dashboard & KPIs</span>
            </a>

            <a routerLink="/admin/applications" routerLinkActive="bg-blue-50 text-blue-700 font-semibold border-r-4 border-blue-700"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">
              <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
              <span>Application Manager</span>
            </a>

            <a routerLink="/admin/merit" routerLinkActive="bg-blue-50 text-blue-700 font-semibold border-r-4 border-blue-700"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">
              <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              <span>Merit Calculation</span>
            </a>

            <a routerLink="/admin/seats" routerLinkActive="bg-blue-50 text-blue-700 font-semibold border-r-4 border-blue-700"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">
              <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              <span>Seat Allotment</span>
            </a>

            <a routerLink="/admin/reports" routerLinkActive="bg-blue-50 text-blue-700 font-semibold border-r-4 border-blue-700"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">
              <svg class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>Reports & CSV</span>
            </a>
          }

          <!-- VERIFIER NAVIGATION -->
          @if (authService.isVerifier()) {
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Verifier Portal</div>
            
            <a routerLink="/verifier/dashboard" routerLinkActive="bg-blue-50 text-blue-700 font-semibold border-r-4 border-blue-700"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">
              <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
              <span>Document Queue</span>
            </a>
          }

        </nav>
      </div>

      <!-- Quick Session Indicator -->
      <div class="pt-4 border-t border-slate-100 text-center">
        <span class="text-[11px] text-slate-400 font-mono">Academic Demo PCC-CS504</span>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  authService = inject(AuthService);

  getInitials(name?: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }
}
