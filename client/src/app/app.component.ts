import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { ToastComponent } from './shared/toast/toast.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    FooterComponent,
    ToastComponent
  ],
  template: `
    <div class="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans">
      <!-- Universal University Header Navbar -->
      <app-navbar></app-navbar>

      <!-- Main Layout Body -->
      <div class="flex-1 flex flex-col md:flex-row">
        
        <!-- Persistent Sidebar on Authenticated Dashboards -->
        @if (authService.isAuthenticated()) {
          <app-sidebar class="hidden md:block"></app-sidebar>
        }

        <!-- Dynamic Content Router Outlet -->
        <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <router-outlet></router-outlet>
        </main>

      </div>

      <!-- University Footer -->
      <app-footer></app-footer>

      <!-- Global Toast Notifications -->
      <app-toast></app-toast>
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  authService = inject(AuthService);
}
