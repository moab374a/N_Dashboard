// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (c) => c.DashboardComponent
          ),
      },
      {
        path: 'privacy-policy',
        loadComponent: () =>
          import('./Pages/privacy-policy/privacy-policy.component').then(
            (c) => c.PrivacyPolicyComponent
          ),
      },
      {
        path: 'terms-of-service',
        loadComponent: () =>
          import('./Pages/terms-of-service/terms-of-service.component').then(
            (c) => c.TermsOfServiceComponent
          ),
      },
      {
        path: 'help',
        loadComponent: () =>
          import('./Pages/Help/help.component').then((c) => c.HelpComponent),
      },
    ],
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(
            (c) => c.LoginComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
