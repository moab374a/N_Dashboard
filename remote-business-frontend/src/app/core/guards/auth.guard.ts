import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // Check if route has role requirements
    const requiredRoles = route.data['roles'] as Array<string>;

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Check if user has at least one of the required roles
    const hasRequiredRole = requiredRoles.some((role) =>
      authService.hasRole(role)
    );

    if (hasRequiredRole) {
      return true;
    }

    // If user doesn't have required role, redirect to dashboard
    return router.createUrlTree(['/dashboard']);
  }

  // Not logged in, redirect to login page with return url
  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
};
