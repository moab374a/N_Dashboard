// src/app/features/projects/projects.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const PROJECTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./project-list/project-list.component').then(
        (c) => c.ProjectListComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./project-form/project-form.component').then(
        (c) => c.ProjectFormComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./project-detail/project-detail.component').then(
        (c) => c.ProjectDetailComponent
      ),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./project-form/project-form.component').then(
        (c) => c.ProjectFormComponent
      ),
    canActivate: [authGuard],
  },
];
