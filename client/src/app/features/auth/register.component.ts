import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { AdmissionProgramme } from '../../models/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div class="max-w-xl w-full space-y-6">
        
        <div class="text-center space-y-1">
          <div class="inline-flex w-12 h-12 rounded-xl bg-iem-navy text-white font-extrabold text-2xl items-center justify-center shadow-md">
            IEM
          </div>
          <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">New Candidate Registration</h2>
          <p class="text-xs text-slate-500">Create an official applicant account for Session 2026–2027</p>
        </div>

        <div class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <form (ngSubmit)="handleRegister()" class="space-y-4">
            
            <!-- Full Name -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name (as per Class 10 certificate) *</label>
              <input type="text" [(ngModel)]="name" name="name" required placeholder="e.g. Rahul Sharma"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none">
            </div>

            <!-- Email & Mobile Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address *</label>
                <input type="email" [(ngModel)]="email" name="email" required placeholder="name@domain.com"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Mobile Number (10 Digits) *</label>
                <input type="tel" [(ngModel)]="mobile" name="mobile" required maxlength="10" placeholder="e.g. 9830012345"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none">
              </div>
            </div>

            <!-- DOB & Course -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Date of Birth *</label>
                <input type="date" [(ngModel)]="dob" name="dob" required
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Programme Applying For *</label>
                <select [(ngModel)]="programmeId" name="programmeId" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  @for (prog of programmes; track prog._id) {
                    <option [value]="prog._id">{{ prog.name }}</option>
                  }
                </select>
              </div>
            </div>

            <!-- Password & Confirm Password -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Password (Min 6 chars) *</label>
                <input type="password" [(ngModel)]="password" name="password" required placeholder="••••••••"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Confirm Password *</label>
                <input type="password" [(ngModel)]="confirmPassword" name="confirmPassword" required placeholder="••••••••"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none">
              </div>
            </div>

            <button type="submit" [disabled]="loading"
              class="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md transition flex items-center justify-center gap-2">
              @if (loading) {
                <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Creating Account...</span>
              } @else {
                <span>Register &amp; Proceed to Application</span>
              }
            </button>
          </form>

          <div class="pt-4 border-t border-slate-100 text-center">
            <p class="text-xs text-slate-500">
              Already have an account? 
              <a routerLink="/auth/login" class="text-blue-600 font-bold hover:underline">Sign In Here</a>
            </p>
          </div>
        </div>

      </div>
    </div>
  `
})
export class RegisterComponent implements OnInit {
  authService = inject(AuthService);
  adminService = inject(AdminService);
  toastService = inject(ToastService);
  router = inject(Router);

  name = '';
  email = '';
  mobile = '';
  dob = '';
  password = '';
  confirmPassword = '';
  programmeId = '';
  programmes: AdmissionProgramme[] = [];
  loading = false;

  ngOnInit() {
    this.adminService.getProgrammes().subscribe({
      next: (res) => {
        if (res.success && res.programmes.length > 0) {
          this.programmes = res.programmes;
          this.programmeId = this.programmes[0]._id;
        }
      }
    });
  }

  handleRegister() {
    if (!this.name.trim() || !this.email.trim() || !this.mobile.trim() || !this.password) {
      this.toastService.warning('Please fill in all mandatory fields');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.toastService.error('Passwords do not match');
      return;
    }

    if (this.password.length < 6) {
      this.toastService.warning('Password must be at least 6 characters');
      return;
    }

    this.loading = true;
    this.authService.register({
      name: this.name,
      email: this.email,
      mobile: this.mobile,
      dob: this.dob,
      password: this.password,
      programmeId: this.programmeId
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.toastService.success('Registration successful! Welcome to IEM Admission Portal.');
        this.router.navigate(['/student/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.toastService.error(err.error?.message || 'Registration failed');
      }
    });
  }
}
