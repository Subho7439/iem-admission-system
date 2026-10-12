import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Top University Banner Header -->
    <header class="bg-iem-navy text-white shadow-md border-b border-blue-900 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          
          <!-- Logo & Brand -->
          <div class="flex items-center gap-3">
            <a routerLink="/" class="flex items-center gap-3 group">
              <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-iem-dark flex items-center justify-center font-extrabold text-white text-xl border border-blue-400 shadow-inner group-hover:scale-105 transition-transform">
                IEM
              </div>
              <div class="flex flex-col">
                <span class="font-bold tracking-tight text-base sm:text-lg text-white group-hover:text-blue-200 transition">
                  IEM Admission Portal
                </span>
                <span class="text-[10px] text-blue-300 font-medium tracking-wider uppercase hidden sm:block">
                  Institute of Engineering & Management • Kolkata
                </span>
              </div>
            </a>
            
            <span class="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-950 text-blue-200 border border-blue-800">
              Lab PCC-CS504
            </span>
          </div>

          <!-- Navigation Links (Public or Active Context) -->
          <nav class="hidden lg:flex items-center space-x-1">
            @if (!authService.isAuthenticated()) {
              <a routerLink="/" routerLinkActive="text-white bg-blue-900/60" [routerLinkActiveOptions]="{exact: true}"
                class="px-3 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-blue-900/40 transition">
                Home
              </a>
              <a routerLink="/programmes" routerLinkActive="text-white bg-blue-900/60"
                class="px-3 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-blue-900/40 transition">
                Programmes
              </a>
              <a routerLink="/merit-list" routerLinkActive="text-white bg-blue-900/60"
                class="px-3 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-blue-900/40 transition">
                Merit List
              </a>
            } @else {
              <!-- Role Dashboard Quick Link -->
              <a (click)="authService.redirectByRole()"
                class="cursor-pointer px-3 py-1.5 rounded-md text-sm font-medium text-blue-200 hover:text-white hover:bg-blue-900/40 transition flex items-center gap-1.5">
                <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                Dashboard
              </a>
            }
          </nav>

          <!-- Right Controls: Demo Switcher, Notifications, Auth Actions -->
          <div class="flex items-center gap-3">

            <!-- Quick Demo Accounts Switcher Pill -->
            <div class="relative">
              <button (click)="toggleDemoMenu()" class="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span class="hidden sm:inline">Switch Demo Role</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              </button>

              @if (showDemoMenu) {
                <div class="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 text-slate-100 border border-slate-700 shadow-2xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div class="px-3 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Instant Demo Login (Lab Evaluator)
                  </div>
                  <button (click)="switchDemoRole('admin')" class="w-full text-left px-3 py-2 hover:bg-blue-900/50 flex items-center justify-between transition">
                    <span>👑 Administrator (Full Control)</span>
                    <span class="text-[10px] text-blue-400 font-mono">admin</span>
                  </button>
                  <button (click)="switchDemoRole('verifier')" class="w-full text-left px-3 py-2 hover:bg-blue-900/50 flex items-center justify-between transition">
                    <span>📑 Document Verifier</span>
                    <span class="text-[10px] text-emerald-400 font-mono">verifier</span>
                  </button>
                  <div class="border-t border-slate-800 my-1"></div>
                  <button (click)="switchDemoRole('student_draft')" class="w-full text-left px-3 py-1.5 hover:bg-blue-900/50 flex items-center justify-between transition">
                    <span>📝 Candidate (Draft State)</span>
                    <span class="text-[10px] text-slate-400 font-mono">draft</span>
                  </button>
                  <button (click)="switchDemoRole('student_rejected_doc')" class="w-full text-left px-3 py-1.5 hover:bg-blue-900/50 flex items-center justify-between transition">
                    <span>⚠️ Candidate (Doc Rejected)</span>
                    <span class="text-[10px] text-rose-400 font-mono">action req</span>
                  </button>
                  <button (click)="switchDemoRole('student_verified')" class="w-full text-left px-3 py-1.5 hover:bg-blue-900/50 flex items-center justify-between transition">
                    <span>✅ Candidate (Verified & Eligible)</span>
                    <span class="text-[10px] text-teal-400 font-mono">verified</span>
                  </button>
                  <button (click)="switchDemoRole('student_allotted')" class="w-full text-left px-3 py-1.5 hover:bg-blue-900/50 flex items-center justify-between transition">
                    <span>🎟️ Candidate (Seat Allotted)</span>
                    <span class="text-[10px] text-purple-400 font-mono">allotted</span>
                  </button>
                </div>
              }
            </div>

            <!-- In-App Notification Bell (If Authenticated) -->
            @if (authService.isAuthenticated()) {
              <div class="relative">
                <button (click)="toggleNotifMenu()" class="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-blue-900/50 transition">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                  @if (notificationService.unreadCount() > 0) {
                    <span class="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-bounce">
                      {{ notificationService.unreadCount() }}
                    </span>
                  }
                </button>

                <!-- Notifications Dropdown -->
                @if (showNotifMenu) {
                  <div class="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white text-slate-800 border border-slate-200 shadow-2xl z-50 overflow-hidden">
                    <div class="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <span class="font-semibold text-xs text-slate-700 uppercase tracking-wider">In-App Notifications</span>
                      <button (click)="markAllNotificationsRead()" class="text-xs text-blue-600 hover:underline font-medium">
                        Mark all as read
                      </button>
                    </div>
                    <div class="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      @if (notificationService.notifications().length === 0) {
                        <div class="p-6 text-center text-slate-400 text-xs">
                          No notifications yet.
                        </div>
                      }
                      @for (notif of notificationService.notifications(); track notif._id) {
                        <div (click)="handleNotifClick(notif)" class="p-3 hover:bg-slate-50 transition cursor-pointer flex gap-3" [ngClass]="{'bg-blue-50/50': !notif.isRead}">
                          <div class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" [ngClass]="notif.isRead ? 'bg-transparent' : 'bg-blue-600'"></div>
                          <div class="flex-1">
                            <h5 class="text-xs font-semibold text-slate-900">{{ notif.title }}</h5>
                            <p class="text-xs text-slate-600 mt-0.5 leading-relaxed">{{ notif.message }}</p>
                            <span class="text-[10px] text-slate-400 mt-1 block">{{ notif.createdAt | date:'short' }}</span>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- User Profile & Logout -->
              <div class="flex items-center gap-2 pl-2 border-l border-blue-900">
                <div class="hidden md:flex flex-col text-right">
                  <span class="text-xs font-semibold text-white leading-tight">{{ authService.currentUser()?.name }}</span>
                  <span class="text-[10px] font-mono capitalize" [ngClass]="{
                    'text-amber-400': authService.isAdmin(),
                    'text-emerald-400': authService.isVerifier(),
                    'text-blue-300': authService.isStudent()
                  }">{{ authService.userRole() }}</span>
                </div>
                <button (click)="logout()" title="Logout" class="p-2 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-rose-950/30 transition">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                </button>
              </div>
            } @else {
              <!-- Public Sign In & Register Buttons -->
              <div class="flex items-center gap-2">
                <a routerLink="/auth/login" class="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 transition shadow-sm">
                  Sign In
                </a>
                <a routerLink="/auth/register" class="px-3 py-1.5 rounded-lg text-xs font-semibold text-iem-navy bg-white hover:bg-slate-100 transition shadow-sm">
                  Register
                </a>
              </div>
            }

          </div>
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent implements OnInit {
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  toastService = inject(ToastService);
  router = inject(Router);

  showDemoMenu = false;
  showNotifMenu = false;

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.notificationService.fetchNotifications().subscribe();
    }
  }

  toggleDemoMenu() {
    this.showDemoMenu = !this.showDemoMenu;
    this.showNotifMenu = false;
  }

  toggleNotifMenu() {
    this.showNotifMenu = !this.showNotifMenu;
    this.showDemoMenu = false;
    if (this.showNotifMenu) {
      this.notificationService.fetchNotifications().subscribe();
    }
  }

  switchDemoRole(role: string) {
    this.showDemoMenu = false;
    this.authService.demoLogin(role).subscribe({
      next: (res) => {
        this.toastService.success(`Logged in as ${res.user.name} (${res.user.role})`);
        this.authService.redirectByRole();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to switch demo account');
      }
    });
  }

  markAllNotificationsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => this.toastService.success('All notifications marked as read')
    });
  }

  handleNotifClick(notif: any) {
    this.showNotifMenu = false;
    if (!notif.isRead) {
      this.notificationService.markAsRead(notif._id).subscribe();
    }
    if (notif.link) {
      this.router.navigateByUrl(notif.link);
    }
  }

  logout() {
    this.authService.logout();
    this.toastService.info('You have been logged out');
  }
}
