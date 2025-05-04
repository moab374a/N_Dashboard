// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { ProjectService } from '../../core/services/project.service';
import { TaskService } from '../../core/services/task.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatDividerModule,
  ],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>

      <div class="greeting-card">
        <h2>Good {{ greeting }}, {{ userName }}!</h2>
        <p>Here's an overview of your work</p>
      </div>

      <div class="dashboard-stats">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon color="primary">folder</mat-icon>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.projects }}</span>
              <span class="stat-label">Active Projects</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon color="accent">assignment</mat-icon>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.tasks }}</span>
              <span class="stat-label">Open Tasks</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon color="warn">warning</mat-icon>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.overdue }}</span>
              <span class="stat-label">Overdue Tasks</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon color="primary">check_circle</mat-icon>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stats.completed }}</span>
              <span class="stat-label">Completed Tasks</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="dashboard-content">
        <div class="dashboard-column">
          <mat-card class="projects-card">
            <mat-card-header>
              <mat-card-title>Recent Projects</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="projects.length === 0" class="empty-state">
                <p>No projects found</p>
              </div>
              <div *ngFor="let project of projects" class="project-item">
                <div class="project-info">
                  <h3 class="project-name">{{ project.project_name }}</h3>
                  <p class="project-details">
                    <span
                      class="project-status"
                      [ngClass]="project.status.toLowerCase()"
                      >{{ project.status }}</span
                    >
                    <span class="task-count"
                      >{{ project.completed_tasks }}/{{
                        project.task_count
                      }}
                      tasks</span
                    >
                  </p>
                  <div class="progress-bar">
                    <mat-progress-bar
                      mode="determinate"
                      [value]="
                        project.task_count
                          ? (project.completed_tasks / project.task_count) * 100
                          : 0
                      "
                    >
                    </mat-progress-bar>
                  </div>
                </div>
                <button
                  mat-icon-button
                  [routerLink]="['/projects', project.project_id]"
                >
                  <mat-icon>chevron_right</mat-icon>
                </button>
              </div>
              <div class="card-actions">
                <a mat-button color="primary" routerLink="/projects"
                  >View All Projects</a
                >
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="dashboard-column">
          <mat-card class="tasks-card">
            <mat-card-header>
              <mat-card-title>My Tasks</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="tasks.length === 0" class="empty-state">
                <p>No tasks assigned to you</p>
              </div>
              <div *ngFor="let task of tasks" class="task-item">
                <div
                  class="task-status"
                  [ngClass]="task.status.toLowerCase().replace(' ', '-')"
                ></div>
                <div class="task-info">
                  <h3 class="task-title">{{ task.title }}</h3>
                  <p class="task-details">
                    <span class="task-project">{{ task.project_name }}</span>
                    <span class="task-due" *ngIf="task.due_date"
                      >Due: {{ task.due_date | date : 'mediumDate' }}</span
                    >
                  </p>
                </div>
                <div
                  class="task-priority"
                  [ngClass]="task.priority.toLowerCase()"
                >
                  {{ task.priority }}
                </div>
              </div>
              <div class="card-actions">
                <a mat-button color="primary" routerLink="/tasks"
                  >View All Tasks</a
                >
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 16px;
      }

      .greeting-card {
        background-color: #3f51b5;
        color: white;
        border-radius: 8px;
        padding: 24px;
        margin-bottom: 24px;
      }

      .greeting-card h2 {
        margin: 0 0 8px;
        font-size: 24px;
      }

      .greeting-card p {
        margin: 0;
        opacity: 0.9;
      }

      .dashboard-stats {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }

      .stat-card {
        height: 100%;
      }

      .stat-card mat-card-content {
        display: flex;
        align-items: center;
        padding: 16px;
      }

      .stat-icon {
        margin-right: 16px;
      }

      .stat-icon mat-icon {
        font-size: 36px;
        height: 36px;
        width: 36px;
      }

      .stat-content {
        display: flex;
        flex-direction: column;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 500;
        line-height: 1.2;
      }

      .stat-label {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
      }

      .dashboard-content {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
        gap: 24px;
      }

      @media (max-width: 768px) {
        .dashboard-content {
          grid-template-columns: 1fr;
        }
      }

      .projects-card,
      .tasks-card {
        height: 100%;
      }

      .project-item,
      .task-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
      }

      .project-info,
      .task-info {
        flex: 1;
      }

      .project-name,
      .task-title {
        margin: 0 0 4px;
        font-size: 16px;
        font-weight: 500;
      }

      .project-details,
      .task-details {
        display: flex;
        margin: 0;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
      }

      .project-status,
      .task-priority {
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        margin-right: 8px;
      }

      .project-status.completed,
      .task-priority.low {
        background-color: #e8f5e9;
        color: #2e7d32;
      }

      .project-status.in.progress,
      .task-priority.medium {
        background-color: #e3f2fd;
        color: #1565c0;
      }

      .project-status.not.started,
      .task-priority.high {
        background-color: #fff8e1;
        color: #f57f17;
      }

      .project-status.on.hold,
      .task-priority.critical {
        background-color: #ffebee;
        color: #c62828;
      }

      .progress-bar {
        margin-top: 8px;
      }

      .task-status {
        width: 4px;
        height: 36px;
        border-radius: 2px;
        margin-right: 12px;
      }

      .task-status.to-do {
        background-color: #9e9e9e;
      }

      .task-status.in-progress {
        background-color: #2196f3;
      }

      .task-status.completed {
        background-color: #4caf50;
      }

      .task-status.blocked {
        background-color: #f44336;
      }

      .card-actions {
        margin-top: 16px;
        text-align: center;
      }

      .empty-state {
        text-align: center;
        padding: 24px;
        color: rgba(0, 0, 0, 0.6);
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  userName: string = '';
  greeting: string = '';
  stats = {
    projects: 0,
    tasks: 0,
    overdue: 0,
    completed: 0,
  };
  projects: any[] = [];
  tasks: any[] = [];

  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'morning';
    } else if (hour < 18) {
      this.greeting = 'afternoon';
    } else {
      this.greeting = 'evening';
    }

    // Get user name
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.userName = user.firstName;
      }
    });

    // Load projects
    this.projectService.getProjects({ limit: 5 }).subscribe((response) => {
      if (response.success) {
        this.projects = response.data;
        this.stats.projects = response.pagination.total;
      }
    });

    // Load tasks
    this.taskService.getTasks().subscribe((response) => {
      if (response.success) {
        this.tasks = response.data.slice(0, 5);

        // Calculate stats
        this.stats.tasks = response.data.filter(
          (task) => task.status !== 'Completed'
        ).length;
        this.stats.completed = response.data.filter(
          (task) => task.status === 'Completed'
        ).length;
        this.stats.overdue = response.data.filter((task) => {
          if (task.status !== 'Completed' && task.due_date) {
            const dueDate = new Date(task.due_date);
            return dueDate < new Date();
          }
          return false;
        }).length;
      }
    });
  }
}
