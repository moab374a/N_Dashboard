import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <h2>Login</h2>

    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" *ngIf="!loading">
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Email</mat-label>
        <input matInput type="email" formControlName="email" required />
        <mat-error *ngIf="loginForm.get('email')?.hasError('required')"
          >Email is required</mat-error
        >
        <mat-error *ngIf="loginForm.get('email')?.hasError('email')"
          >Please enter a valid email</mat-error
        >
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Password</mat-label>
        <input
          matInput
          [type]="hidePassword ? 'password' : 'text'"
          formControlName="password"
          required
        />
        <button
          mat-icon-button
          matSuffix
          (click)="hidePassword = !hidePassword"
          type="button"
        >
          <mat-icon>{{
            hidePassword ? 'visibility_off' : 'visibility'
          }}</mat-icon>
        </button>
        <mat-error *ngIf="loginForm.get('password')?.hasError('required')"
          >Password is required</mat-error
        >
      </mat-form-field>

      <div class="form-actions">
        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="loginForm.invalid"
        >
          Login
        </button>
        <a mat-button routerLink="/auth/forgot-password">Forgot Password?</a>
      </div>

      <div class="register-link">
        <span>Don't have an account?</span>
        <a mat-button color="accent" routerLink="/auth/register">Register</a>
      </div>
    </form>

    <div *ngIf="loading" class="spinner-container">
      <mat-spinner diameter="40"></mat-spinner>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }

      .form-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .register-link {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 16px;
      }

      .spinner-container {
        display: flex;
        justify-content: center;
        margin: 20px 0;
      }
    `,
  ],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;
  returnUrl: string = '/';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        if (response.twoFactorRequired && response.tempToken) {
          // Redirect to 2FA verification with temp token
          this.router.navigate(['/auth/two-factor'], {
            queryParams: {
              tempToken: response.tempToken,
              returnUrl: this.returnUrl,
            },
          });
        } else if (response.success) {
          // Login successful, redirect to return URL
          this.router.navigate([this.returnUrl]);
        }
      },
      error: (error) => {
        this.snackBar.open(
          error.message || 'Login failed. Please try again.',
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
          }
        );
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
