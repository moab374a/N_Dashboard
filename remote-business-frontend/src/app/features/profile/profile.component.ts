// src/app/features/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/auth.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="profile-container" *ngIf="user">
      <div class="profile-header">
        <div class="user-avatar">
          <div *ngIf="!user.profileImageUrl" class="avatar-initials">
            {{ getInitials(user.firstName, user.lastName) }}
          </div>
          <img
            *ngIf="user.profileImageUrl"
            [src]="user.profileImageUrl"
            alt="Profile image"
          />
        </div>

        <div class="user-info">
          <h1 class="user-name">{{ user.firstName }} {{ user.lastName }}</h1>
          <p class="user-username">{{ user.username }}</p>
          <p class="user-job-title" *ngIf="user.jobTitle">
            {{ user.jobTitle }}
          </p>
        </div>
      </div>

      <mat-tab-group animationDuration="0ms">
        <mat-tab label="Profile Information">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Personal Information</mat-card-title>
              </mat-card-header>

              <mat-card-content>
                <form [formGroup]="profileForm" (ngSubmit)="onProfileSubmit()">
                  <div class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>First Name</mat-label>
                      <input matInput formControlName="firstName" />
                      <mat-error
                        *ngIf="
                          profileForm.get('firstName')?.hasError('required')
                        "
                      >
                        First name is required
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Last Name</mat-label>
                      <input matInput formControlName="lastName" />
                      <mat-error
                        *ngIf="
                          profileForm.get('lastName')?.hasError('required')
                        "
                      >
                        Last name is required
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Email</mat-label>
                    <input matInput formControlName="email" readonly />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Username</mat-label>
                    <input matInput formControlName="username" readonly />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Job Title</mat-label>
                    <input matInput formControlName="jobTitle" />
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Phone Number</mat-label>
                    <input matInput formControlName="phoneNumber" />
                  </mat-form-field>

                  <div class="form-actions">
                    <button
                      mat-raised-button
                      color="primary"
                      type="submit"
                      [disabled]="profileForm.invalid || !profileForm.dirty"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <mat-tab label="Security">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Change Password</mat-card-title>
              </mat-card-header>

              <mat-card-content>
                <form
                  [formGroup]="passwordForm"
                  (ngSubmit)="onPasswordSubmit()"
                >
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Current Password</mat-label>
                    <input
                      matInput
                      type="password"
                      formControlName="currentPassword"
                    />
                    <mat-error
                      *ngIf="
                        passwordForm
                          .get('currentPassword')
                          ?.hasError('required')
                      "
                    >
                      Current password is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>New Password</mat-label>
                    <input
                      matInput
                      type="password"
                      formControlName="newPassword"
                    />
                    <mat-error
                      *ngIf="
                        passwordForm.get('newPassword')?.hasError('required')
                      "
                    >
                      New password is required
                    </mat-error>
                    <mat-error
                      *ngIf="
                        passwordForm.get('newPassword')?.hasError('minlength')
                      "
                    >
                      Password must be at least 6 characters
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Confirm New Password</mat-label>
                    <input
                      matInput
                      type="password"
                      formControlName="confirmPassword"
                    />
                    <mat-error
                      *ngIf="
                        passwordForm
                          .get('confirmPassword')
                          ?.hasError('required')
                      "
                    >
                      Confirm password is required
                    </mat-error>
                    <mat-error
                      *ngIf="
                        passwordForm
                          .get('confirmPassword')
                          ?.hasError('passwordMismatch')
                      "
                    >
                      Passwords don't match
                    </mat-error>
                  </mat-form-field>

                  <div class="form-actions">
                    <button
                      mat-raised-button
                      color="primary"
                      type="submit"
                      [disabled]="passwordForm.invalid"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>

            <mat-card class="mt-24">
              <mat-card-header>
                <mat-card-title>Two-Factor Authentication</mat-card-title>
              </mat-card-header>

              <mat-card-content>
                <div class="two-factor-status">
                  <div>
                    <p class="status-text">
                      <strong>Status:</strong>
                      <span
                        class="status-value"
                        [class.enabled]="twoFactorEnabled"
                        [class.disabled]="!twoFactorEnabled"
                      >
                        {{ twoFactorEnabled ? 'Enabled' : 'Disabled' }}
                      </span>
                    </p>
                    <p class="status-description">
                      Two-factor authentication adds an extra layer of security
                      to your account by requiring a verification code in
                      addition to your password.
                    </p>
                  </div>

                  <button
                    mat-raised-button
                    color="primary"
                    *ngIf="!twoFactorEnabled"
                    (click)="setupTwoFactor()"
                  >
                    Enable
                  </button>
                  <button
                    mat-raised-button
                    color="warn"
                    *ngIf="twoFactorEnabled"
                    (click)="disableTwoFactor()"
                  >
                    Disable
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>

    <div class="loading-container" *ngIf="!user">
      <mat-card>
        <mat-card-content>
          <p>Loading profile...</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .profile-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 16px;
      }

      .profile-header {
        display: flex;
        align-items: center;
        margin-bottom: 32px;
      }

      .user-avatar {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        margin-right: 24px;
        overflow: hidden;
      }

      .avatar-initials {
        width: 100%;
        height: 100%;
        background-color: #3f51b5;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        font-size: 36px;
      }

      .user-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .user-name {
        margin: 0 0 4px;
        font-size: 24px;
      }

      .user-username {
        margin: 0 0 4px;
        color: rgba(0, 0, 0, 0.6);
      }

      .user-job-title {
        margin: 0;
        font-style: italic;
      }

      .tab-content {
        padding: 24px 0;
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
        justify-content: flex-end;
        margin-top: 16px;
      }

      .mt-24 {
        margin-top: 24px;
      }

      .two-factor-status {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .status-text {
        margin: 0 0 8px;
      }

      .status-value {
        font-weight: 500;
      }

      .status-value.enabled {
        color: #2e7d32;
      }

      .status-value.disabled {
        color: #c62828;
      }

      .status-description {
        margin: 0;
        color: rgba(0, 0, 0, 0.6);
        max-width: 500px;
      }

      .loading-container {
        max-width: 800px;
        margin: 32px auto;
        padding: 16px;
      }
    `,
  ],
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  twoFactorEnabled: boolean = false;
  profileForm: FormGroup;
  passwordForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      username: [{ value: '', disabled: true }],
      jobTitle: [''],
      phoneNumber: [''],
    });

    this.passwordForm = this.formBuilder.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.user = user;
        this.twoFactorEnabled = !!user.twoFactorEnabled;

        // Fill profile form
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          jobTitle: user.jobTitle || '',
          phoneNumber: user.phoneNumber || '',
        });
      }
    });
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
      return null;
    }
  }

  onProfileSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    const profileData = {
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
      jobTitle: this.profileForm.value.jobTitle,
      phone: this.profileForm.value.phoneNumber,
    };

    this.authService.updateProfile(profileData).subscribe({
      next: () => {
        this.snackBar.open('Profile updated successfully', 'Close', {
          duration: 3000,
        });
        this.profileForm.markAsPristine();
      },
      error: (error) => {
        this.snackBar.open(
          error.message || 'Failed to update profile',
          'Close',
          {
            duration: 5000,
          }
        );
      },
    });
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    this.authService
      .updatePassword(
        this.passwordForm.value.currentPassword,
        this.passwordForm.value.newPassword
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Password updated successfully', 'Close', {
            duration: 3000,
          });
          this.passwordForm.reset();
        },
        error: (error) => {
          this.snackBar.open(
            error.message || 'Failed to update password',
            'Close',
            {
              duration: 5000,
            }
          );
        },
      });
  }

  setupTwoFactor(): void {
    // In a real application, this would show a QR code and enable 2FA
    this.snackBar.open(
      'Two-factor authentication setup is not implemented in this demo',
      'Close',
      {
        duration: 5000,
      }
    );
  }

  disableTwoFactor(): void {
    // In a real application, this would disable 2FA after confirmation
    this.snackBar.open(
      'Two-factor authentication disable is not implemented in this demo',
      'Close',
      {
        duration: 5000,
      }
    );
  }
}
