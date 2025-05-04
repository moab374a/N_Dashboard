// src/app/features/tasks/tasks.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TaskService } from '../../../core/services/task.service';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDividerModule, // Add this import
  ],
  template: `
    <div class="tasks-container">
      <div class="page-header">
        <h1>My Tasks</h1>
        <button mat-raised-button color="primary" routerLink="/tasks/new">
          <mat-icon>add</mat-icon> New Task
        </button>
      </div>

      <mat-card class="filter-card">
        <mat-card-content class="filter-content">
          <mat-form-field appearance="outline">
            <mat-label>Search</mat-label>
            <input
              matInput
              [(ngModel)]="filters.search"
              (keyup.enter)="loadTasks()"
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
              (selectionChange)="loadTasks()"
            >
              <mat-option [value]="">All</mat-option>
              <mat-option value="To Do">To Do</mat-option>
              <mat-option value="In Progress">In Progress</mat-option>
              <mat-option value="Review">Review</mat-option>
              <mat-option value="Completed">Completed</mat-option>
              <mat-option value="Blocked">Blocked</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Priority</mat-label>
            <mat-select
              [(ngModel)]="filters.priority"
              (selectionChange)="loadTasks()"
            >
              <mat-option [value]="">All</mat-option>
              <mat-option value="Low">Low</mat-option>
              <mat-option value="Medium">Medium</mat-option>
              <mat-option value="High">High</mat-option>
              <mat-option value="Critical">Critical</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-flat-button color="primary" (click)="loadTasks()">
            <mat-icon>search</mat-icon> Search
          </button>

          <button mat-stroked-button (click)="resetFilters()">
            <mat-icon>clear</mat-icon> Reset
          </button>
        </mat-card-content>
      </mat-card>

      <mat-tab-group animationDuration="0ms">
        <mat-tab label="All Tasks">
          <div class="tasks-list" *ngIf="tasks.length > 0">
            <div *ngFor="let task of tasks" class="task-item">
              <div
                class="task-status-indicator"
                [ngClass]="task.status.toLowerCase().replace(' ', '-')"
              ></div>

              <div class="task-content">
                <div class="task-header">
                  <h3 class="task-title">{{ task.title }}</h3>
                  <div class="task-project">{{ task.project_name }}</div>
                </div>

                <div class="task-details">
                  <div class="task-assignee" *ngIf="task.assignee_first_name">
                    <mat-icon>person</mat-icon>
                    <span
                      >{{ task.assignee_first_name }}
                      {{ task.assignee_last_name }}</span
                    >
                  </div>

                  <div class="task-assignee" *ngIf="!task.assignee_first_name">
                    <mat-icon>person_off</mat-icon>
                    <span>Unassigned</span>
                  </div>

                  <div class="task-due" *ngIf="task.due_date">
                    <mat-icon>event</mat-icon>
                    <span [class.overdue]="isOverdue(task.due_date)">
                      {{ task.due_date | date : 'mediumDate' }}
                      <span
                        *ngIf="isOverdue(task.due_date)"
                        class="overdue-badge"
                        >Overdue</span
                      >
                    </span>
                  </div>

                  <div class="task-estimates" *ngIf="task.estimated_hours">
                    <mat-icon>schedule</mat-icon>
                    <span>
                      {{ task.actual_hours || 0 }}/{{ task.estimated_hours }}
                      hours
                    </span>
                  </div>
                </div>
              </div>

              <div
                class="task-priority"
                [ngClass]="task.priority.toLowerCase()"
              >
                {{ task.priority }}
              </div>

              <button mat-icon-button [matMenuTriggerFor]="taskMenu">
                <mat-icon>more_vert</mat-icon>
              </button>

              <mat-menu #taskMenu="matMenu">
                <button mat-menu-item [routerLink]="['/tasks', task.task_id]">
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
                <button
                  mat-menu-item
                  (click)="setTaskStatus(task, 'In Progress')"
                  *ngIf="task.status !== 'In Progress'"
                >
                  <mat-icon>play_arrow</mat-icon>
                  <span>Mark In Progress</span>
                </button>
                <button
                  mat-menu-item
                  (click)="setTaskStatus(task, 'Completed')"
                  *ngIf="task.status !== 'Completed'"
                >
                  <mat-icon>check</mat-icon>
                  <span>Mark Complete</span>
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="confirmDeleteTask(task)">
                  <mat-icon color="warn">delete</mat-icon>
                  <span>Delete</span>
                </button>
              </mat-menu>
            </div>
          </div>

          <div *ngIf="tasks.length === 0" class="empty-state">
            <mat-icon>assignment</mat-icon>
            <h3>No tasks found</h3>
            <p>Try adjusting your filters or create a new task</p>
          </div>
        </mat-tab>

        <mat-tab label="My Tasks">
          <div class="tasks-list" *ngIf="myTasks.length > 0">
            <!-- Similar content as "All Tasks" tab but filtered to only show the current user's tasks -->
          </div>

          <div *ngIf="myTasks.length === 0" class="empty-state">
            <mat-icon>assignment_ind</mat-icon>
            <h3>No tasks assigned to you</h3>
            <p>You currently don't have any tasks assigned</p>
          </div>
        </mat-tab>

        <mat-tab label="Overdue">
          <div class="tasks-list" *ngIf="overdueTasks.length > 0">
            <!-- Similar content as "All Tasks" tab but filtered to only show overdue tasks -->
          </div>

          <div *ngIf="overdueTasks.length === 0" class="empty-state">
            <mat-icon>event_available</mat-icon>
            <h3>No overdue tasks</h3>
            <p>You're all caught up!</p>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .tasks-container {
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

      .tasks-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 24px 0;
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

      .task-status-indicator.review {
        background-color: #9c27b0;
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

      .task-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;
      }

      .task-title {
        margin: 0;
        font-size: 16px;
      }

      .task-project {
        font-size: 12px;
        padding: 2px 8px;
        background-color: #f5f5f5;
        border-radius: 4px;
      }

      .task-details {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
      }

      .task-assignee,
      .task-due,
      .task-estimates {
        display: flex;
        align-items: center;
        font-size: 12px;
      }

      .task-assignee mat-icon,
      .task-due mat-icon,
      .task-estimates mat-icon {
        font-size: 16px;
        height: 16px;
        width: 16px;
        margin-right: 4px;
        color: rgba(0, 0, 0, 0.6);
      }

      .overdue {
        color: #f44336;
      }

      .overdue-badge {
        background-color: #ffebee;
        color: #c62828;
        padding: 2px 6px;
        border-radius: 4px;
        margin-left: 4px;
        font-size: 10px;
      }

      .task-priority {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        margin: 0 16px;
      }

      .task-priority.low {
        background-color: #e8f5e9;
        color: #2e7d32;
      }

      .task-priority.medium {
        background-color: #e3f2fd;
        color: #1565c0;
      }

      .task-priority.high {
        background-color: #fff8e1;
        color: #f57f17;
      }

      .task-priority.critical {
        background-color: #ffebee;
        color: #c62828;
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
    `,
  ],
})
export class TasksComponent implements OnInit {
  tasks: any[] = [];
  myTasks: any[] = [];
  overdueTasks: any[] = [];
  loading: boolean = true;

  filters = {
    search: '',
    status: '',
    priority: '',
  };

  constructor(
    private taskService: TaskService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    const params = {
      search: this.filters.search || undefined,
      status: this.filters.status || undefined,
      priority: this.filters.priority || undefined,
    };

    this.taskService.getTasks(params).subscribe({
      next: (response) => {
        this.tasks = response.data;

        // Filter for "My Tasks" tab
        // In a real app, this would compare against the current user's ID
        const currentUserId = 1; // Replace with actual current user ID
        this.myTasks = this.tasks.filter(
          (task) => task.assignee_id === currentUserId
        );

        // Filter for "Overdue" tab
        this.overdueTasks = this.tasks.filter(
          (task) =>
            task.status !== 'Completed' &&
            task.due_date &&
            this.isOverdue(task.due_date)
        );

        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Failed to load tasks', 'Close', {
          duration: 5000,
        });
        this.loading = false;
      },
    });
  }

  clearSearch(): void {
    this.filters.search = '';
    this.loadTasks();
  }

  resetFilters(): void {
    this.filters = {
      search: '',
      status: '',
      priority: '',
    };
    this.loadTasks();
  }

  isOverdue(dueDate: string): boolean {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  }

  setTaskStatus(task: any, status: string): void {
    // This would call an API to update the task status
    // For now, we'll just show a notification
    this.snackBar.open(`Task "${task.title}" marked as ${status}`, 'Close', {
      duration: 3000,
    });
  }

  confirmDeleteTask(task: any): void {
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
}
