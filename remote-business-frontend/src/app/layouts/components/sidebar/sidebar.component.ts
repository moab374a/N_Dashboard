import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './sidebar.component.html',
  styles: [
    `
      .sidebar-container {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .user-info {
        padding: 16px;
        display: flex;
        align-items: center;
      }

      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #3f51b5;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        margin-right: 12px;
      }

      .user-name {
        font-weight: 500;
      }

      .user-role {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.54);
      }

      .active-link {
        background-color: rgba(63, 81, 181, 0.1);
        color: #3f51b5;
      }
    `,
  ],
})
export class SidebarComponent implements OnInit {
  userInitials: string = '';
  userName: string = '';
  userRole: string = '';
  isAdmin: boolean = false;
  isManager: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.userInitials = this.getInitials(user.firstName, user.lastName);
        this.userName = `${user.firstName} ${user.lastName}`;
        this.isAdmin = user.roles.includes('admin');
        this.isManager = user.roles.includes('manager');

        // Determine the highest role for display
        if (this.isAdmin) {
          this.userRole = 'Administrator';
        } else if (this.isManager) {
          this.userRole = 'Project Manager';
        } else {
          this.userRole = 'Team Member';
        }
      }
    });
  }

  private getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
}
