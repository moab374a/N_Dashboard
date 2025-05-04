import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
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
  selector: 'app-reset-password',
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
    <h2>Reset Password</h2>
    <p class="description" *ngIf="token">Enter your new password below.</p>

    <div *ngIf="!token" class="error-message">
      <mat-icon color="warn">error</mat-icon>
      <h3>Invalid or Expired Link</h3>
      <p>
        The password reset link is invalid or has expired. Please request a new
        one.
      </p>
      <a mat-button color="primary" routerLink="/auth/forgot-password"
        >Request New Link</a
      >
    </div>

    <form
      [formGroup]="resetForm"
      (ngSubmit)="onSubmit()"
      *ngIf="!loading && token && !resetComplete"
    >
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>New Password</mat-label>
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
        <mat-error *ngIf="resetForm.get('password')?.hasError('required')"
          >Password is required</mat-error
        >
        <mat-error *ngIf="resetForm.get('password')?.hasError('minlength')"
          >Password must be at least 6 characters</mat-error
        >
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Confirm New Password</mat-label>
        <input
          matInput
          [type]="hideConfirmPassword ? 'password' : 'text'"
          formControlName="confirmPassword"
          required
        />
        <button
          mat-icon-button
          matSuffix
          (click)="hideConfirmPassword = !hideConfirmPassword"
          type="button"
        >
          <mat-icon>{{
            hideConfirmPassword ? 'visibility_off' : 'visibility'
          }}</mat-icon>
        </button>
        <mat-error
          *ngIf="resetForm.get('confirmPassword')?.hasError('required')"
          >Confirm password is required</mat-error
        >
        <mat-error
          *ngIf="resetForm.get('confirmPassword')?.hasError('passwordMismatch')"
          >Passwords don't match</mat-error
        >
      </mat-form-field>

      <div class="form-actions">
        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="resetForm.invalid"
        >
          Reset Password
        </button>
      </div>
    </form>

    <div *ngIf="loading" class="spinner-container">
      <mat-spinner diameter="40"></mat-spinner>
    </div>

    <div *ngIf="resetComplete" class="success-message">
      <mat-icon color="primary">check_circle</mat-icon>
      <h3>Password Reset Successfully</h3>
      <p>
        Your password has been reset. You can now log in with your new password.
      </p>
      <a mat-button color="primary" routerLink="/auth/login">Go to Login</a>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .description {
        margin-bottom: 20px;
        color: rgba(0, 0, 0, 0.6);
      }

      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }

      .form-actions {
        display: flex;
        justify-content: center;
        margin-bottom: 16px;
      }

      .spinner-container {
        display: flex;
        justify-content: center;
        margin: 20px 0;
      }

      .success-message,
      .error-message {
        text-align: center;
        padding: 20px 0;
      }

      .success-message mat-icon,
      .error-message mat-icon {
        font-size: 48px;
        height: 48px;
        width: 48px;
        margin-bottom: 16px;
      }

      .error-message {
        color: rgba(0, 0, 0, 0.7);
      }
    `,
  ],
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  loading = false;
  token: string | null = null;
  resetComplete = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.resetForm = this.formBuilder.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
      return null;
    }
  }

  onSubmit(): void {
    if (this.resetForm.invalid || !this.token) {
      return;
    }

    this.loading = true;

    this.authService
      .resetPassword(this.token, this.resetForm.value.password)
      .subscribe({
        next: () => {
          this.loading = false;
          this.resetComplete = true;
        },
        error: (error) => {
          this.snackBar.open(
            error.message || 'Failed to reset password. Please try again.',
            'Close',
            {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
            }
          );
          this.loading = false;
        },
      });
  }
}
