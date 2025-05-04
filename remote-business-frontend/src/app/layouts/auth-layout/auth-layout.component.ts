import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, MatCardModule],
  template: `
    <div class="auth-container">
      <div class="auth-content">
        <mat-card class="auth-card">
          <div class="auth-header">
            <h1 class="app-name">Remote Business</h1>
          </div>
          <mat-card-content>
            <router-outlet></router-outlet>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #f5f5f5;
      }

      .auth-content {
        width: 100%;
        max-width: 400px;
        padding: 16px;
      }

      .auth-card {
        overflow: hidden;
      }

      .auth-header {
        padding: 24px;
        text-align: center;
        background-color: #3f51b5;
        color: white;
        margin-bottom: 16px;
      }

      .app-name {
        margin: 0;
        font-size: 24px;
        font-weight: 500;
      }

      mat-card-content {
        padding: 16px;
      }
    `,
  ],
})
export class AuthLayoutComponent {}
