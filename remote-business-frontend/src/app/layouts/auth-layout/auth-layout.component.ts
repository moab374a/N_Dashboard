import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, MatCardModule],
  templateUrl: `./auth-layout.component.html`,
  styleUrls: [`./auth-layout.component.scss`],
})
export class AuthLayoutComponent {}
