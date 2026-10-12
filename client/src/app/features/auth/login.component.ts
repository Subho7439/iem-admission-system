import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div class="max-w-md w-full space-y-6">
        
        <!-- Header -->
        <div class="text-center space-y-2">
          <div class="inline-flex w-12 h-12 rounded-xl bg-iem-navy text-white font-extrabold text-2xl items-center justify-center shadow-md">
            IEM
          </div>
          <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Sign In to Admission Portal</h2>
          <p class="text-xs text-slate-500">Enter your registered email and password to access your dashboard</p>
        </div>

        <!-- Login Form Card -->
        <div class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <form (ngSubmit)="handleLogin()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
              <input type="email" [(ngModel)]="email" name="email" required placeholder="e.g. yourname@domain.com"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm">
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
              </div>
              <input type="password" [(ngModel)]="password" name="password" required placeholder="••••••••"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm">
            </div>

            <button type="submit" [disabled]="loading"
              class="w-full py-3 px-4 rounded-xl font-bold text-sm bg-iem-navy hover:bg-blue-900 text-white shadow-md transition flex items-center justify-center gap-2">
              @if (loading) {
                <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Authenticating...</span>
              } @else {
                <span>Sign In</span>
              }
            </button>
          </form>

          <div class="pt-4 border-t border-slate-100 text-center">
            <p class="text-xs text-slate-500">
              New Applicant? 
              <a routerLink="/auth/register" class="text-blue-600 font-bold hover:underline">Register New Account</a>
            </p>
          </div>
        </div>

        <!-- Academic Lab Demo Credentials Box -->
        <div class="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-5 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-blue-600"></span>
              PCC-CS504 Demo Accounts
            </span>
            <span class="text-[10px] text-blue-600 font-semibold">1-Click Sign In</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs">
            <button (click)="fillAndLogin('admin@iemcal.edu', 'AdminPassword123!')" class="p-2.5 rounded-xl bg-white border border-blue-200 hover:border-blue-400 hover:shadow-sm text-left transition">
              <span class="font-bold text-slate-800 block">👑 Administrator</span>
              <span class="text-[10px] text-slate-500 block">admin&#64;iemcal.edu</span>
            </button>

            <button (click)="fillAndLogin('verifier@iemcal.edu', 'VerifierPassword123!')" class="p-2.5 rounded-xl bg-white border border-blue-200 hover:border-blue-400 hover:shadow-sm text-left transition">
              <span class="font-bold text-slate-800 block">📑 Doc Verifier</span>
              <span class="text-[10px] text-slate-500 block">verifier&#64;iemcal.edu</span>
            </button>

            <button (click)="fillAndLogin('verified.student@iemcal.edu', 'StudentPassword123!')" class="p-2.5 rounded-xl bg-white border border-blue-200 hover:border-blue-400 hover:shadow-sm text-left transition">
              <span class="font-bold text-slate-800 block">✅ Student (Verified)</span>
              <span class="text-[10px] text-slate-500 block">verified.student&#64;iemcal.edu</span>
            </button>

            <button (click)="fillAndLogin('allotted.student@iemcal.edu', 'StudentPassword123!')" class="p-2.5 rounded-xl bg-white border border-blue-200 hover:border-blue-400 hover:shadow-sm text-left transition">
              <span class="font-bold text-slate-800 block">🎟️ Student (Allotted)</span>
              <span class="text-[10px] text-slate-500 block">allotted.student&#64;iemcal.edu</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class LoginComponent {
  authService = inject(AuthService);
  toastService = inject(ToastService);
  router = inject(Router);

  email = '';
  password = '';
  loading = false;

  handleLogin() {
    if (!this.email || !this.password) {
      this.toastService.warning('Please enter both email and password');
      return;
    }

    this.loading = true;
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        this.toastService.success(`Welcome back, ${res.user.name}`);
        this.authService.redirectByRole();
      },
      error: (err) => {
        this.loading = false;
        this.toastService.error(err.error?.message || 'Login failed. Please check your credentials.');
      }
    });
  }

  fillAndLogin(email: string, pass: string) {
    this.email = email;
    this.password = pass;
    this.handleLogin();
  }
}
