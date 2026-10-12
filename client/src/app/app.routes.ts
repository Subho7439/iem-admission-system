import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public Routes
  {
    path: '',
    loadComponent: () => import('./features/public/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'programmes',
    loadComponent: () => import('./features/public/programmes.component').then(m => m.ProgrammesComponent)
  },
  {
    path: 'merit-list',
    loadComponent: () => import('./features/public/public-merit.component').then(m => m.PublicMeritComponent)
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
  },

  // Student Routes (Protected by AuthGuard & RoleGuard)
  {
    path: 'student',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['student'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/student/student-dashboard.component').then(m => m.StudentDashboardComponent)
      },
      {
        path: 'application',
        loadComponent: () => import('./features/student/application-form.component').then(m => m.ApplicationFormComponent)
      },
      {
        path: 'documents',
        loadComponent: () => import('./features/student/document-status.component').then(m => m.DocumentStatusComponent)
      },
      {
        path: 'status',
        loadComponent: () => import('./features/student/document-status.component').then(m => m.DocumentStatusComponent)
      },
      {
        path: 'merit',
        loadComponent: () => import('./features/student/merit-view.component').then(m => m.MeritViewComponent)
      },
      {
        path: 'allotment',
        loadComponent: () => import('./features/student/seat-allotment.component').then(m => m.SeatAllotmentComponent)
      },
      {
        path: 'receipt',
        loadComponent: () => import('./features/student/receipt.component').then(m => m.ReceiptComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Admin Routes (Protected by AuthGuard & RoleGuard)
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'applications',
        loadComponent: () => import('./features/admin/applications-list.component').then(m => m.ApplicationsListComponent)
      },
      {
        path: 'merit',
        loadComponent: () => import('./features/admin/merit-management.component').then(m => m.MeritManagementComponent)
      },
      {
        path: 'seats',
        loadComponent: () => import('./features/admin/seat-management.component').then(m => m.SeatManagementComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/admin/reports.component').then(m => m.ReportsComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Verifier Routes (Protected by AuthGuard & RoleGuard)
  {
    path: 'verifier',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['verifier', 'admin'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/verifier/verifier-dashboard.component').then(m => m.VerifierDashboardComponent)
      },
      {
        path: 'applications',
        loadComponent: () => import('./features/admin/applications-list.component').then(m => m.ApplicationsListComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Wildcard fallback
  {
    path: '**',
    redirectTo: ''
  }
];
