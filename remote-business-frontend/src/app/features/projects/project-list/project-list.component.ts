import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.models';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="project-list-container">
      <div class="page-header">
        <h1>Projects</h1>
        <button mat-raised-button color="primary" routerLink="/projects/new">
          <mat-icon>add</mat-icon> New Project
        </button>
      </div>

      <mat-card class="filter-card">
        <mat-card-content class="filter-content">
          <mat-form-field appearance="outline">
            <mat-label>Search</mat-label>
            <input
              matInput
              [(ngModel)]="filters.search"
              (keyup.enter)="loadProjects()"
            />
            <button
              *ngIf="filters.search"
              matSuffix
              mat-icon-button
              aria-label="Clear"
              (click)="clearSearch()"
            >
              <mat-icon>close</mat-icon>
            </button>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select
              [(ngModel)]="filters.status"
              (selectionChange)="loadProjects()"
            >
              <mat-option [value]="">All</mat-option>
              <mat-option value="Not Started">Not Started</mat-option>
              <mat-option value="In Progress">In Progress</mat-option>
              <mat-option value="On Hold">On Hold</mat-option>
              <mat-option value="Completed">Completed</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Priority</mat-label>
            <mat-select
              [(ngModel)]="filters.priority"
              (selectionChange)="loadProjects()"
            >
              <mat-option [value]="">All</mat-option>
              <mat-option value="Low">Low</mat-option>
              <mat-option value="Medium">Medium</mat-option>
              <mat-option value="High">High</mat-option>
              <mat-option value="Critical">Critical</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-flat-button color="primary" (click)="loadProjects()">
            <mat-icon>search</mat-icon> Search
          </button>

          <button mat-stroked-button (click)="resetFilters()">
            <mat-icon>clear</mat-icon> Reset
          </button>
        </mat-card-content>
      </mat-card>

      <div class="projects-grid">
        <mat-card
          *ngFor="let project of projects"
          class="project-card"
          [routerLink]="['/projects', project.project_id]"
        >
          <mat-card-header>
            <mat-card-title>{{ project.project_name }}</mat-card-title>
            <mat-card-subtitle>
              <span
                class="project-status"
                [ngClass]="project.status.toLowerCase().replace(' ', '-')"
              >
                {{ project.status }}
              </span>
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <p class="project-description" *ngIf="project.description">
              {{ project.description | slice : 0 : 150
              }}{{ project.description.length > 150 ? '...' : '' }}
            </p>

            <div class="project-dates">
              <div>
                <span class="date-label">Start:</span>
                <span class="date-value">{{
                  project.start_date | date : 'mediumDate'
                }}</span>
              </div>
              <div *ngIf="project.end_date">
                <span class="date-label">End:</span>
                <span class="date-value">{{
                  project.end_date | date : 'mediumDate'
                }}</span>
              </div>
            </div>

            <div class="project-progress">
              <div class="progress-header">
                <span>Progress</span>
                <span
                  >{{ project.completed_tasks }}/{{
                    project.task_count
                  }}
                  tasks</span
                >
              </div>
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

            <div class="project-info">
              <div class="project-owner" *ngIf="project.owner_first_name">
                <span class="info-label">Owner:</span>
                <span class="info-value"
                  >{{ project.owner_first_name }}
                  {{ project.owner_last_name }}</span
                >
              </div>

              <div class="project-team" *ngIf="project.team_name">
                <span class="info-label">Team:</span>
                <span class="info-value">{{ project.team_name }}</span>
              </div>

              <div class="project-priority">
                <span
                  class="priority-chip"
                  [ngClass]="project.priority.toLowerCase()"
                >
                  {{ project.priority }}
                </span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div *ngIf="projects.length === 0" class="no-projects">
        <mat-icon>folder_open</mat-icon>
        <h3>No projects found</h3>
        <p>Try adjusting your filters or create a new project</p>
      </div>

      <mat-paginator
        [length]="totalProjects"
        [pageSize]="pageSize"
        [pageSizeOptions]="[5, 10, 25, 50]"
        (page)="onPageChange($event)"
        *ngIf="totalProjects > pageSize"
      >
      </mat-paginator>
    </div>
  `,
  styles: [
    `
      .project-list-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 16px;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .filter-card {
        margin-bottom: 24px;
      }

      .filter-content {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
      }

      .filter-content mat-form-field {
        flex: 1;
        min-width: 200px;
      }

      .projects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 24px;
        margin-bottom: 24px;
      }

      .project-card {
        cursor: pointer;
        transition: box-shadow 0.3s ease, transform 0.3s ease;
      }

      .project-card:hover {
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        transform: translateY(-2px);
      }

      .project-description {
        margin-top: 16px;
        color: rgba(0, 0, 0, 0.7);
        font-size: 14px;
      }

      .project-dates {
        display: flex;
        justify-content: space-between;
        margin: 16px 0;
        font-size: 14px;
      }

      .date-label {
        color: rgba(0, 0, 0, 0.6);
        margin-right: 4px;
      }

      .project-progress {
        margin: 16px 0;
      }

      .progress-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
        font-size: 14px;
      }

      .project-info {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        margin-top: 16px;
      }

      .info-label {
        color: rgba(0, 0, 0, 0.6);
        margin-right: 4px;
        font-size: 14px;
      }

      .info-value {
        font-size: 14px;
      }

      .project-status {
        padding: 2px 8px;
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

      .priority-chip {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
      }

      .priority-chip.low {
        background-color: #e8f5e9;
        color: #2e7d32;
      }

      .priority-chip.medium {
        background-color: #e3f2fd;
        color: #1565c0;
      }

      .priority-chip.high {
        background-color: #fff8e1;
        color: #f57f17;
      }

      .priority-chip.critical {
        background-color: #ffebee;
        color: #c62828;
      }

      .no-projects {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px;
        text-align: center;
        color: rgba(0, 0, 0, 0.5);
      }

      .no-projects mat-icon {
        font-size: 48px;
        height: 48px;
        width: 48px;
        margin-bottom: 16px;
      }

      .no-projects h3 {
        margin: 0 0 8px;
        font-weight: 500;
      }
    `,
  ],
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  totalProjects: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;

  filters = {
    search: '',
    status: '',
    priority: '',
    team: '',
  };

  constructor(
    private projectService: ProjectService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    const params = {
      page: this.pageIndex + 1,
      limit: this.pageSize,
      search: this.filters.search || undefined,
      status: this.filters.status || undefined,
      priority: this.filters.priority || undefined,
      team: this.filters.team || undefined,
    };

    this.projectService.getProjects(params).subscribe({
      next: (response) => {
        this.projects = response.data;
        this.totalProjects = response.pagination.total;
      },
      error: (error) => {
        this.snackBar.open(
          error.message || 'Failed to load projects',
          'Close',
          {
            duration: 5000,
          }
        );
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadProjects();
  }

  clearSearch(): void {
    this.filters.search = '';
    this.loadProjects();
  }

  resetFilters(): void {
    this.filters = {
      search: '',
      status: '',
      priority: '',
      team: '',
    };
    this.loadProjects();
  }
}
