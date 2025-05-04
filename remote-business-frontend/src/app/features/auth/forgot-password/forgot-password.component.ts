import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  selector: 'app-forgot-password',
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
    <h2>Forgot Password</h2>
    <p class="description">
      Enter your email address and we'll send you a link to reset your password.
    </p>

    <form
      [formGroup]="forgotPasswordForm"
      (ngSubmit)="onSubmit()"
      *ngIf="!loading && !emailSent"
    >
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Email</mat-label>
        <input matInput type="email" formControlName="email" required />
        <mat-error *ngIf="forgotPasswordForm.get('email')?.hasError('required')"
          >Email is required</mat-error
        >
        <mat-error *ngIf="forgotPasswordForm.get('email')?.hasError('email')"
          >Please enter a valid email</mat-error
        >
      </mat-form-field>

      <div class="form-actions">
        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="forgotPasswordForm.invalid"
        >
          Send Reset Link
        </button>
        <a mat-button routerLink="/auth/login">Back to Login</a>
      </div>
    </form>

    <div *ngIf="loading" class="spinner-container">
      <mat-spinner diameter="40"></mat-spinner>
    </div>

    <div *ngIf="emailSent" class="success-message">
      <mat-icon color="primary">check_circle</mat-icon>
      <h3>Reset Link Sent</h3>
      <p>
        We've sent a password reset link to your email address. Please check
        your inbox.
      </p>
      <a mat-button color="primary" routerLink="/auth/login">Back to Login</a>
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
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .spinner-container {
        display: flex;
        justify-content: center;
        margin: 20px 0;
      }

      .success-message {
        text-align: center;
        padding: 20px 0;
      }

      .success-message mat-icon {
        font-size: 48px;
        height: 48px;
        width: 48px;
        margin-bottom: 16px;
      }
    `,
  ],
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  loading = false;
  emailSent = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.loading = true;

    this.authService
      .forgotPassword(this.forgotPasswordForm.value.email)
      .subscribe({
        next: () => {
          this.loading = false;
          this.emailSent = true;
        },
        error: (error) => {
          this.snackBar.open(
            error.message || 'Failed to send reset email. Please try again.',
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
