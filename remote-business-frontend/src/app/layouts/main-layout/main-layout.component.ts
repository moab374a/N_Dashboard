import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HeaderComponent } from '../components/header/header.component';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { FooterComponent } from '../components/footer/footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    MatSidenavModule,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
  ],
  template: `
    <div class="app-container">
      <app-header (toggleSidebar)="drawer.toggle()"></app-header>

      <mat-sidenav-container class="content-container">
        <mat-sidenav #drawer mode="side" opened class="sidenav">
          <app-sidebar></app-sidebar>
        </mat-sidenav>

        <mat-sidenav-content class="content">
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>

      <app-footer></app-footer>
    </div>
  `,
  styles: [
    `
      .app-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
      }

      .content-container {
        flex: 1;
      }

      .sidenav {
        width: 250px;
        background-color: #fafafa;
        border-right: 1px solid #e0e0e0;
      }

      .content {
        padding: 20px;
      }
    `,
  ],
})
export class MainLayoutComponent {}
