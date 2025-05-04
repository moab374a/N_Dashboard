import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const TASKS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./tasks/tasks.component').then((c) => c.TasksComponent),
    canActivate: [authGuard],
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./task-form/task-form.component').then(
        (c) => c.TaskFormComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./task-form/task-form.component').then(
        (c) => c.TaskFormComponent
      ),
    canActivate: [authGuard],
  },
];
