import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProjectService } from '../../../core/services/project.service';
import { ProjectDetail, Task } from '../../../core/models/project.models';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDividerModule,
    MatTableModule,
    MatSortModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDialogModule,
    MatMenuModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="project-detail-container" *ngIf="project">
      <div class="project-header">
        <div class="project-title-section">
          <h1 class="project-title">{{ project.project_name }}</h1>
          <div class="project-badges">
            <span
              class="project-status"
              [ngClass]="project.status.toLowerCase().replace(' ', '-')"
            >
              {{ project.status }}
            </span>
            <span
              class="project-priority"
              [ngClass]="project.priority.toLowerCase()"
            >
              {{ project.priority }}
            </span>
          </div>
        </div>

        <div class="project-actions">
          <button
            mat-button
            color="primary"
            [routerLink]="['/projects', project.project_id, 'edit']"
          >
            <mat-icon>edit</mat-icon> Edit
          </button>
          <button mat-button color="warn" (click)="confirmDelete()">
            <mat-icon>delete</mat-icon> Delete
          </button>
        </div>
      </div>

      <div class="project-overview">
        <mat-card class="overview-card">
          <mat-card-content>
            <div class="overview-grid">
              <div class="overview-item">
                <div class="overview-label">Start Date</div>
                <div class="overview-value">
                  {{ project.start_date | date : 'mediumDate' }}
                </div>
              </div>

              <div class="overview-item" *ngIf="project.end_date">
                <div class="overview-label">End Date</div>
                <div class="overview-value">
                  {{ project.end_date | date : 'mediumDate' }}
                </div>
              </div>

              <div class="overview-item">
                <div class="overview-label">Owner</div>
                <div class="overview-value">
                  {{ project.owner_first_name }} {{ project.owner_last_name }}
                </div>
              </div>

              <div class="overview-item" *ngIf="project.team_name">
                <div class="overview-label">Team</div>
                <div class="overview-value">{{ project.team_name }}</div>
              </div>
            </div>

            <mat-divider class="overview-divider"></mat-divider>

            <div class="progress-section">
              <div class="progress-header">
                <span>Progress</span>
                <span
                  >{{ project.statistics.completed_tasks }}/{{
                    project.statistics.total_tasks
                  }}
                  tasks completed</span
                >
              </div>
              <mat-progress-bar
                mode="determinate"
                [value]="
                  project.statistics.total_tasks
                    ? (project.statistics.completed_tasks /
                        project.statistics.total_tasks) *
                      100
                    : 0
                "
              >
              </mat-progress-bar>
            </div>

            <div class="progress-stats">
              <div class="stat-item">
                <div class="stat-value">
                  {{ project.statistics.todo_tasks }}
                </div>
                <div class="stat-label">To Do</div>
              </div>

              <div class="stat-item">
                <div class="stat-value">
                  {{ project.statistics.in_progress_tasks }}
                </div>
                <div class="stat-label">In Progress</div>
              </div>

              <div class="stat-item">
                <div class="stat-value">
                  {{ project.statistics.completed_tasks }}
                </div>
                <div class="stat-label">Completed</div>
              </div>

              <div class="stat-item">
                <div class="stat-value red">
                  {{ project.statistics.overdue_tasks }}
                </div>
                <div class="stat-label">Overdue</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="project-description" *ngIf="project.description">
        <h2>Description</h2>
        <p>{{ project.description }}</p>
      </div>

      <mat-divider class="section-divider"></mat-divider>

      <div class="project-content">
        <mat-tab-group animationDuration="0ms">
          <mat-tab label="Tasks">
            <div class="tab-content">
              <div class="tab-header">
                <h2>Tasks</h2>
                <button
                  mat-raised-button
                  color="primary"
                  [routerLink]="[
                    '/projects',
                    project.project_id,
                    'tasks',
                    'new'
                  ]"
                >
                  <mat-icon>add</mat-icon> New Task
                </button>
              </div>

              <div class="tasks-list" *ngIf="project.tasks.length > 0">
                <div *ngFor="let task of project.tasks" class="task-item">
                  <div
                    class="task-status-indicator"
                    [ngClass]="task.status.toLowerCase().replace(' ', '-')"
                  ></div>

                  <div class="task-content">
                    <h3 class="task-title">{{ task.title }}</h3>

                    <div class="task-details">
                      <div class="task-detail">
                        <mat-icon>person</mat-icon>
                        <span>{{
                          task.assignee_first_name || 'Unassigned'
                        }}</span>
                      </div>

                      <div class="task-detail" *ngIf="task.due_date">
                        <mat-icon>event</mat-icon>
                        <span>{{ task.due_date | date : 'mediumDate' }}</span>
                      </div>

                      <div class="task-detail">
                        <mat-icon>priority_high</mat-icon>
                        <span
                          class="task-priority"
                          [ngClass]="task.priority.toLowerCase()"
                          >{{ task.priority }}</span
                        >
                      </div>
                    </div>
                  </div>

                  <button mat-icon-button [matMenuTriggerFor]="taskMenu">
                    <mat-icon>more_vert</mat-icon>
                  </button>

                  <mat-menu #taskMenu="matMenu">
                    <button
                      mat-menu-item
                      [routerLink]="['/tasks', task.task_id]"
                    >
                      <mat-icon>visibility</mat-icon>
                      <span>View</span>
                    </button>
                    <button
                      mat-menu-item
                      [routerLink]="['/tasks', task.task_id, 'edit']"
                    >
                      <mat-icon>edit</mat-icon>
                      <span>Edit</span>
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item (click)="confirmDeleteTask(task)">
                      <mat-icon color="warn">delete</mat-icon>
                      <span>Delete</span>
                    </button>
                  </mat-menu>
                </div>
              </div>

              <div *ngIf="project.tasks.length === 0" class="empty-state">
                <mat-icon>assignment</mat-icon>
                <h3>No tasks yet</h3>
                <p>Create your first task to get started</p>
                <button
                  mat-raised-button
                  color="primary"
                  [routerLink]="[
                    '/projects',
                    project.project_id,
                    'tasks',
                    'new'
                  ]"
                >
                  <mat-icon>add</mat-icon> Add Task
                </button>
              </div>
            </div>
          </mat-tab>

          <mat-tab label="Team">
            <div class="tab-content">
              <div class="tab-header">
                <h2>Team Members</h2>
                <button mat-raised-button color="primary">
                  <mat-icon>person_add</mat-icon> Add Member
                </button>
              </div>

              <div class="team-list" *ngIf="project.members.length > 0">
                <div *ngFor="let member of project.members" class="team-member">
                  <div class="member-avatar">
                    <div
                      *ngIf="!member.profile_image_url"
                      class="avatar-initials"
                    >
                      {{ getInitials(member.first_name, member.last_name) }}
                    </div>
                    <img
                      *ngIf="member.profile_image_url"
                      [src]="member.profile_image_url"
                      alt="Profile image"
                    />
                  </div>

                  <div class="member-info">
                    <h3 class="member-name">
                      {{ member.first_name }} {{ member.last_name }}
                    </h3>
                    <div class="member-details">
                      <span class="member-username">{{ member.username }}</span>
                      <span class="member-role">{{ member.role }}</span>
                    </div>
                  </div>

                  <button mat-icon-button [matMenuTriggerFor]="memberMenu">
                    <mat-icon>more_vert</mat-icon>
                  </button>

                  <mat-menu #memberMenu="matMenu">
                    <button mat-menu-item>
                      <mat-icon>edit</mat-icon>
                      <span>Change Role</span>
                    </button>
                    <button mat-menu-item color="warn">
                      <mat-icon color="warn">person_remove</mat-icon>
                      <span>Remove</span>
                    </button>
                  </mat-menu>
                </div>
              </div>

              <div *ngIf="project.members.length === 0" class="empty-state">
                <mat-icon>people</mat-icon>
                <h3>No team members yet</h3>
                <p>Add team members to collaborate on this project</p>
                <button mat-raised-button color="primary">
                  <mat-icon>person_add</mat-icon> Add Team Member
                </button>
              </div>
            </div>
          </mat-tab>

          <mat-tab
            label="Documents"
            [disabled]="!project.documents || project.documents.length === 0"
          >
            <div class="tab-content">
              <div class="tab-header">
                <h2>Documents</h2>
                <button mat-raised-button color="primary">
                  <mat-icon>upload_file</mat-icon> Upload Document
                </button>
              </div>

              <div
                class="documents-list"
                *ngIf="project.documents && project.documents.length > 0"
              >
                <div
                  *ngFor="let document of project.documents"
                  class="document-item"
                >
                  <div class="document-icon">
                    <mat-icon>description</mat-icon>
                  </div>

                  <div class="document-info">
                    <h3 class="document-title">{{ document.title }}</h3>
                    <div class="document-details">
                      <span class="document-type">{{
                        document.file_type
                      }}</span>
                      <span class="document-size">{{
                        formatFileSize(document.file_size)
                      }}</span>
                      <span class="document-date">{{
                        document.uploaded_at | date : 'medium'
                      }}</span>
                    </div>
                  </div>

                  <div class="document-actions">
                    <button mat-icon-button matTooltip="Download">
                      <mat-icon>download</mat-icon>
                    </button>
                    <button mat-icon-button matTooltip="Delete">
                      <mat-icon color="warn">delete</mat-icon>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>

    <div *ngIf="loading" class="loading-indicator">
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    </div>

    <div *ngIf="!loading && !project" class="not-found">
      <mat-icon>error</mat-icon>
      <h2>Project not found</h2>
      <p>
        The project you're looking for doesn't exist or you don't have access to
        it.
      </p>
      <button mat-raised-button color="primary" routerLink="/projects">
        Back to Projects
      </button>
    </div>
  `,
  styles: [
    `
      .project-detail-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 16px;
      }

      .project-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
      }

      .project-title {
        margin: 0 0 8px;
        font-size: 28px;
      }

      .project-badges {
        display: flex;
        gap: 8px;
      }

      .project-status,
      .project-priority {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
      }

      .project-status.not-started {
        background-color: #f5f5f5;
        color: #616161;
      }

      .project-status.in-progress {
        background-color: #e3f2fd;
        color: #1565c0;
      }

      .project-status.on-hold {
        background-color: #fff8e1;
        color: #f57f17;
      }

      .project-status.completed {
        background-color: #e8f5e9;
        color: #2e7d32;
      }

      .project-priority.low {
        background-color: #e8f5e9;
        color: #2e7d32;
      }

      .project-priority.medium {
        background-color: #e3f2fd;
        color: #1565c0;
      }

      .project-priority.high {
        background-color: #fff8e1;
        color: #f57f17;
      }

      .project-priority.critical {
        background-color: #ffebee;
        color: #c62828;
      }

      .project-overview {
        margin-bottom: 24px;
      }

      .overview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 16px;
      }

      .overview-label {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
        margin-bottom: 4px;
      }

      .overview-value {
        font-size: 16px;
        font-weight: 500;
      }

      .overview-divider {
        margin: 16px 0;
      }

      .progress-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;
      }

      .progress-stats {
        display: flex;
        justify-content: space-between;
        margin-top: 16px;
      }

      .stat-item {
        text-align: center;
      }

      .stat-value {
        font-size: 24px;
        font-weight: 500;
      }

      .stat-value.red {
        color: #c62828;
      }

      .stat-label {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
      }

      .project-description {
        margin-bottom: 24px;
      }

      .project-description h2 {
        margin-bottom: 8px;
        font-size: 20px;
      }

      .section-divider {
        margin: 24px 0;
      }

      .tab-content {
        padding: 24px 0;
      }

      .tab-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .tab-header h2 {
        margin: 0;
      }

      .tasks-list,
      .team-list,
      .documents-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .task-item {
        display: flex;
        align-items: center;
        padding: 16px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .task-status-indicator {
        width: 4px;
        height: 40px;
        border-radius: 2px;
        margin-right: 16px;
      }

      .task-status-indicator.to-do {
        background-color: #9e9e9e;
      }

      .task-status-indicator.in-progress {
        background-color: #2196f3;
      }

      .task-status-indicator.completed {
        background-color: #4caf50;
      }

      .task-status-indicator.blocked {
        background-color: #f44336;
      }

      .task-content {
        flex: 1;
      }

      .task-title {
        margin: 0 0 8px;
        font-size: 16px;
      }

      .task-details {
        display: flex;
        gap: 16px;
      }

      .task-detail {
        display: flex;
        align-items: center;
        font-size: 12px;
      }

      .task-detail mat-icon {
        font-size: 16px;
        height: 16px;
        width: 16px;
        margin-right: 4px;
        color: rgba(0, 0, 0, 0.6);
      }

      .task-priority {
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
      }

      .team-member {
        display: flex;
        align-items: center;
        padding: 16px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .member-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        margin-right: 16px;
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
        font-size: 18px;
      }

      .member-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .member-info {
        flex: 1;
      }

      .member-name {
        margin: 0 0 4px;
        font-size: 16px;
      }

      .member-details {
        display: flex;
        align-items: center;
        font-size: 12px;
      }

      .member-username {
        color: rgba(0, 0, 0, 0.6);
        margin-right: 8px;
      }

      .member-role {
        padding: 2px 6px;
        background-color: #f5f5f5;
        border-radius: 4px;
      }

      .document-item {
        display: flex;
        align-items: center;
        padding: 16px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .document-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        background-color: #f5f5f5;
        border-radius: 4px;
        margin-right: 16px;
      }

      .document-info {
        flex: 1;
      }

      .document-title {
        margin: 0 0 4px;
        font-size: 16px;
      }

      .document-details {
        display: flex;
        gap: 16px;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px;
        text-align: center;
        color: rgba(0, 0, 0, 0.5);
      }

      .empty-state mat-icon {
        font-size: 48px;
        height: 48px;
        width: 48px;
        margin-bottom: 16px;
      }

      .empty-state h3 {
        margin: 0 0 8px;
        font-weight: 500;
      }

      .empty-state button {
        margin-top: 16px;
      }

      .loading-indicator {
        margin: 48px 0;
      }

      .not-found {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px;
        text-align: center;
      }

      .not-found mat-icon {
        font-size: 64px;
        height: 64px;
        width: 64px;
        margin-bottom: 16px;
        color: #f44336;
      }

      .not-found h2 {
        margin: 0 0 8px;
      }

      .not-found button {
        margin-top: 16px;
      }
    `,
  ],
})
export class ProjectDetailComponent implements OnInit {
  project: ProjectDetail | null = null;
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProject();
  }

  loadProject(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (!projectId) {
      this.loading = false;
      return;
    }

    this.projectService.getProject(Number(projectId)).subscribe({
      next: (response) => {
        this.project = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Failed to load project', 'Close', {
          duration: 5000,
        });
        this.loading = false;
      },
    });
  }

  confirmDelete(): void {
    if (
      confirm(
        'Are you sure you want to delete this project? This action cannot be undone.'
      )
    ) {
      if (this.project) {
        this.projectService.deleteProject(this.project.project_id).subscribe({
          next: () => {
            this.snackBar.open('Project deleted successfully', 'Close', {
              duration: 3000,
            });
            this.router.navigate(['/projects']);
          },
          error: (error) => {
            this.snackBar.open(
              error.message || 'Failed to delete project',
              'Close',
              {
                duration: 5000,
              }
            );
          },
        });
      }
    }
  }

  confirmDeleteTask(task: Task): void {
    if (
      confirm(
        `Are you sure you want to delete task "${task.title}"? This action cannot be undone.`
      )
    ) {
      // Task deletion logic would go here
      this.snackBar.open('Task deletion is not implemented yet', 'Close', {
        duration: 3000,
      });
    }
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
