import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Auto logout if 401 response returned from API
        tokenService.removeToken();
        router.navigate(['/auth/login']);
      }

      // Get error message from server or use default
      const errorMessage =
        error.error?.error || error.statusText || 'Unknown error occurred';

      return throwError(() => new Error(errorMessage));
    })
  );
};
