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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-two-factor',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <h2>Two-Factor Authentication</h2>
    <p class="description">
      Enter the verification code from your authenticator app.
    </p>

    <form [formGroup]="twoFactorForm" (ngSubmit)="onSubmit()" *ngIf="!loading">
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Authentication Code</mat-label>
        <input
          matInput
          formControlName="twoFactorCode"
          required
          autocomplete="off"
          maxlength="6"
          pattern="[0-9]{6}"
        />
        <mat-hint>6-digit code from your authenticator app</mat-hint>
        <mat-error
          *ngIf="twoFactorForm.get('twoFactorCode')?.hasError('required')"
          >Code is required</mat-error
        >
        <mat-error
          *ngIf="twoFactorForm.get('twoFactorCode')?.hasError('pattern')"
          >Code must be 6 digits</mat-error
        >
      </mat-form-field>

      <div class="form-actions">
        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="twoFactorForm.invalid"
        >
          Verify
        </button>
        <a mat-button routerLink="/auth/login">Back to Login</a>
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
    `,
  ],
})
export class TwoFactorComponent implements OnInit {
  twoFactorForm: FormGroup;
  loading = false;
  tempToken: string | null = null;
  returnUrl: string = '/';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.twoFactorForm = this.formBuilder.group({
      twoFactorCode: [
        '',
        [Validators.required, Validators.pattern('[0-9]{6}')],
      ],
    });
  }

  ngOnInit(): void {
    this.tempToken = this.route.snapshot.queryParamMap.get('tempToken');
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';

    if (!this.tempToken) {
      this.router.navigate(['/auth/login']);
    }
  }

  onSubmit(): void {
    if (this.twoFactorForm.invalid || !this.tempToken) {
      return;
    }

    this.loading = true;

    this.authService
      .verifyTwoFactor(this.tempToken, this.twoFactorForm.value.twoFactorCode)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate([this.returnUrl]);
          }
        },
        error: (error) => {
          this.snackBar.open(
            error.message || 'Invalid verification code. Please try again.',
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
