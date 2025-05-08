import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Import RouterModule for routerLink

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule], // Add RouterModule to imports
  template: `
    <footer class="footer">
      <div class="footer-content">
        <span>&copy; {{ currentYear }} Smart Bussiness</span>
        <div class="footer-links">
          <a routerLink="/privacy-policy" class="footer-link">Privacy Policy</a>
          <a routerLink="/terms-of-service" class="footer-link">Terms of Service</a>
          <a routerLink="/help" class="footer-link">Help</a>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      .footer {
        background-color: #f5f5f5;
        border-top: 1px solid #e0e0e0;
        padding: 16px;
      }

      .footer-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1200px;
        margin: 0 auto;
      }

      .footer-links {
        display: flex;
        gap: 16px;
      }

      .footer-link {
        color: rgba(0, 0, 0, 0.6);
        text-decoration: none;
        font-size: 14px;
      }

      .footer-link:hover {
        color: rgba(0, 0, 0, 0.8);
        text-decoration: underline;
      }
    `,
  ],
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
}
