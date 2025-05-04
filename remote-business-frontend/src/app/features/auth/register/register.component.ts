import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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
  selector: 'app-register',
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
    <h2>Create Account</h2>

    <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" *ngIf="!loading">
      <div class="form-row">
        <mat-form-field appearance="outline">
          <mat-label>First Name</mat-label>
          <input matInput formControlName="firstName" required />
          <mat-error *ngIf="registerForm.get('firstName')?.hasError('required')"
            >First name is required</mat-error
          >
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Last Name</mat-label>
          <input matInput formControlName="lastName" required />
          <mat-error *ngIf="registerForm.get('lastName')?.hasError('required')"
            >Last name is required</mat-error
          >
        </mat-form-field>
      </div>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Username</mat-label>
        <input matInput formControlName="username" required />
        <mat-error *ngIf="registerForm.get('username')?.hasError('required')"
          >Username is required</mat-error
        >
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Email</mat-label>
        <input matInput type="email" formControlName="email" required />
        <mat-error *ngIf="registerForm.get('email')?.hasError('required')"
          >Email is required</mat-error
        >
        <mat-error *ngIf="registerForm.get('email')?.hasError('email')"
          >Please enter a valid email</mat-error
        >
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Job Title (Optional)</mat-label>
        <input matInput formControlName="jobTitle" />
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
        <mat-error *ngIf="registerForm.get('password')?.hasError('required')"
          >Password is required</mat-error
        >
        <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')"
          >Password must be at least 6 characters</mat-error
        >
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Confirm Password</mat-label>
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
          *ngIf="registerForm.get('confirmPassword')?.hasError('required')"
          >Confirm password is required</mat-error
        >
        <mat-error
          *ngIf="
            registerForm.get('confirmPassword')?.hasError('passwordMismatch')
          "
          >Passwords don't match</mat-error
        >
      </mat-form-field>

      <div class="form-actions">
        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="registerForm.invalid"
        >
          Register
        </button>
      </div>

      <div class="login-link">
        <span>Already have an account?</span>
        <a mat-button color="accent" routerLink="/auth/login">Login</a>
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

      .form-row {
        display: flex;
        gap: 16px;
      }

      .form-row mat-form-field {
        flex: 1;
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

      .login-link {
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
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.formBuilder.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        jobTitle: [''],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
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
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;

    // Create registration object from form values
    const registrationData = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      jobTitle: this.registerForm.value.jobTitle,
      password: this.registerForm.value.password,
    };

    this.authService.register(registrationData).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open(
            'Registration successful! You can now log in.',
            'Close',
            {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
            }
          );
          this.router.navigate(['/auth/login']);
        }
      },
      error: (error) => {
        this.snackBar.open(
          error.message || 'Registration failed. Please try again.',
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
