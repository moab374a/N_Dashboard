import { Component, EventEmitter, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/auth.models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
  ],
  template: `
    <mat-toolbar color="primary" class="header-toolbar">
      <button
        mat-icon-button
        class="menu-button"
        (click)="toggleSidebar.emit()"
      >
        <mat-icon>menu</mat-icon>
      </button>

      <span class="app-title">Smart Bussiness</span>

      <span class="spacer"></span>

      <ng-container *ngIf="currentUser">
        <button
          mat-icon-button
          [matMenuTriggerFor]="notificationsMenu"
          class="notification-button"
        >
          <mat-icon [matBadge]="3" matBadgeColor="accent"
            >notifications</mat-icon
          >
        </button>

        <mat-menu #notificationsMenu="matMenu" class="notifications-menu">
          <div class="notifications-header">
            <h3 class="notifications-title">Notifications</h3>
            <button mat-button color="primary">Mark all as read</button>
          </div>
          <mat-divider></mat-divider>
          <div class="notification-item">
            <mat-icon color="primary">task</mat-icon>
            <div class="notification-content">
              <p class="notification-text">You have been assigned a new task</p>
              <p class="notification-time">2 hours ago</p>
            </div>
          </div>
          <mat-divider></mat-divider>
          <div class="notification-item">
            <mat-icon color="accent">group</mat-icon>
            <div class="notification-content">
              <p class="notification-text">
                You've been added to Project Alpha team
              </p>
              <p class="notification-time">Yesterday</p>
            </div>
          </div>
          <mat-divider></mat-divider>
          <div class="notification-item">
            <mat-icon color="warn">warning</mat-icon>
            <div class="notification-content">
              <p class="notification-text">
                Task deadline approaching: UI Design
              </p>
              <p class="notification-time">2 days ago</p>
            </div>
          </div>
          <mat-divider></mat-divider>
          <div class="notifications-footer">
            <button mat-button color="primary" routerLink="/notifications">
              View all notifications
            </button>
          </div>
        </mat-menu>

        <button
          mat-button
          [matMenuTriggerFor]="userMenu"
          class="user-menu-button"
        >
          <span class="user-name"
            >{{ currentUser.firstName }} {{ currentUser.lastName }}</span
          >
          <mat-icon>arrow_drop_down</mat-icon>
        </button>

        <mat-menu #userMenu="matMenu">
          <button mat-menu-item routerLink="/profile">
            <mat-icon>account_circle</mat-icon>
            <span>Profile</span>
          </button>

          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon>exit_to_app</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </ng-container>
    </mat-toolbar>
  `,
  styles: [
    `
      .header-toolbar {
        position: sticky;
        top: 0;
        z-index: 1000;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .spacer {
        flex: 1 1 auto;
      }

      .app-title {
        margin-left: 8px;
        font-size: 1.2rem;
        font-weight: 500;
      }

      .user-menu-button {
        margin-left: 8px;
      }

      .user-name {
        margin-right: 4px;
      }

      .notifications-menu {
        max-width: 320px;
      }

      .notifications-header,
      .notifications-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 16px;
      }

      .notifications-title {
        margin: 0;
        font-size: 16px;
      }

      .notification-item {
        display: flex;
        padding: 12px 16px;
        align-items: flex-start;
      }

      .notification-item mat-icon {
        margin-right: 12px;
        margin-top: 2px;
      }

      .notification-content {
        flex: 1;
      }

      .notification-text {
        margin: 0 0 4px;
      }

      .notification-time {
        margin: 0;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.54);
      }
    `,
  ],
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  currentUser: User | null = null;

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}
