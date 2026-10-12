import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { User, UserRole } from '../../models/models';

interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:5000/api/auth';

  currentUser = signal<User | null>(null);
  token = signal<string | null>(null);

  isAuthenticated = computed(() => !!this.currentUser());
  userRole = computed<UserRole | null>(() => this.currentUser()?.role || null);
  isStudent = computed(() => this.currentUser()?.role === 'student');
  isAdmin = computed(() => this.currentUser()?.role === 'admin');
  isVerifier = computed(() => this.currentUser()?.role === 'verifier');

  constructor() {
    this.loadSessionFromStorage();
  }

  private loadSessionFromStorage() {
    try {
      const savedToken = localStorage.getItem('iem_auth_token');
      const savedUser = localStorage.getItem('iem_auth_user');

      if (savedToken && savedUser) {
        this.token.set(savedToken);
        this.currentUser.set(JSON.parse(savedUser));
      }
    } catch (e) {
      this.clearSession();
    }
  }

  register(payload: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  login(payload: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  demoLogin(role: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/demo-login`, { role }).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  getMe(): Observable<{ success: boolean; user: User }> {
    return this.http.get<{ success: boolean; user: User }>(`${this.apiUrl}/me`).pipe(
      tap(res => {
        if (res.user) {
          this.currentUser.set(res.user);
          localStorage.setItem('iem_auth_user', JSON.stringify(res.user));
        }
      })
    );
  }

  private handleAuthSuccess(res: AuthResponse) {
    if (res.success && res.token && res.user) {
      this.token.set(res.token);
      this.currentUser.set(res.user);
      localStorage.setItem('iem_auth_token', res.token);
      localStorage.setItem('iem_auth_user', JSON.stringify(res.user));
    }
  }

  logout() {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  private clearSession() {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('iem_auth_token');
    localStorage.removeItem('iem_auth_user');
  }

  redirectByRole() {
    const role = this.userRole();
    if (role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else if (role === 'verifier') {
      this.router.navigate(['/verifier/dashboard']);
    } else {
      this.router.navigate(['/student/dashboard']);
    }
  }
}
