import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from '../models/auth.models';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    // Only attempt to load if we have a token
    if (!this.tokenService.getToken() || this.tokenService.isTokenExpired()) {
      return;
    }

    this.getProfile().subscribe();
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          if (
            response.success &&
            response.token &&
            !response.twoFactorRequired
          ) {
            this.tokenService.saveToken(response.token);
            this.currentUserSubject.next(response.user || null);
          }
        }),
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData);
  }

  logout(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/logout`).pipe(
      tap(() => {
        this.tokenService.removeToken();
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/login']);
      }),
      catchError((error) => {
        // Even if the API call fails, we still want to clear local state
        this.tokenService.removeToken();
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/login']);
        return throwError(() => error);
      })
    );
  }

  getProfile(): Observable<User> {
    return this.http
      .get<{ success: boolean; data: User }>(`${this.apiUrl}/me`)
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            this.currentUserSubject.next(response.data);
            return response.data;
          }
          throw new Error('Failed to load user profile');
        }),
        catchError((error) => {
          // If we can't load the profile, log the user out
          this.tokenService.removeToken();
          this.currentUserSubject.next(null);
          return throwError(() => error);
        })
      );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgotpassword`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/resetpassword/${token}`, {
      password,
    });
  }

  verifyTwoFactor(
    tempToken: string,
    twoFactorCode: string
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/verify-2fa`, {
        tempToken,
        twoFactorCode,
      })
      .pipe(
        tap((response) => {
          if (response.success && response.token) {
            this.tokenService.saveToken(response.token);
            this.currentUserSubject.next(response.user || null);
          }
        })
      );
  }

  setupTwoFactor(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/setup-2fa`, {});
  }

  enableTwoFactor(token: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/enable-2fa`, { token });
  }

  disableTwoFactor(password: string, token: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/disable-2fa`, {
      password,
      token,
    });
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http
      .put<{ success: boolean; data: User }>(
        `${this.apiUrl}/updatedetails`,
        userData
      )
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            const updatedUser = { ...this.currentUserValue, ...response.data };
            this.currentUserSubject.next(updatedUser as User);
            return response.data;
          }
          throw new Error('Failed to update profile');
        })
      );
  }

  updatePassword(
    currentPassword: string,
    newPassword: string
  ): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/updatepassword`, {
      currentPassword,
      newPassword,
    });
  }

  hasRole(role: string): boolean {
    return this.currentUserValue?.roles.includes(role) || false;
  }

  isAuthenticated(): boolean {
    return (
      !!this.tokenService.getToken() && !this.tokenService.isTokenExpired()
    );
  }
}
