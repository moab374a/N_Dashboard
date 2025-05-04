// src/app/features/tasks/task-form/task-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TaskService } from '../../../core/services/task.service';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="task-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{
            isEditMode ? 'Edit Task' : 'Create New Task'
          }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Task Title</mat-label>
              <input matInput formControlName="title" required />
              <mat-error *ngIf="taskForm.get('title')?.hasError('required')">
                Title is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea
                matInput
                formControlName="description"
                rows="4"
              ></textarea>
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Project</mat-label>
                <mat-select formControlName="projectId" required>
                  <mat-option
                    *ngFor="let project of projects"
                    [value]="project.project_id"
                  >
                    {{ project.project_name }}
                  </mat-option>
                </mat-select>
                <mat-error
                  *ngIf="taskForm.get('projectId')?.hasError('required')"
                >
                  Project is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Start Date</mat-label>
                <input
                  matInput
                  [matDatepicker]="startPicker"
                  formControlName="startDate"
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="startPicker"
                ></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Due Date</mat-label>
                <input
                  matInput
                  [matDatepicker]="duePicker"
                  formControlName="dueDate"
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="duePicker"
                ></mat-datepicker-toggle>
                <mat-datepicker #duePicker></mat-datepicker>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status" required>
                  <mat-option value="To Do">To Do</mat-option>
                  <mat-option value="In Progress">In Progress</mat-option>
                  <mat-option value="Review">Review</mat-option>
                  <mat-option value="Completed">Completed</mat-option>
                  <mat-option value="Blocked">Blocked</mat-option>
                </mat-select>
                <mat-error *ngIf="taskForm.get('status')?.hasError('required')">
                  Status is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Priority</mat-label>
                <mat-select formControlName="priority" required>
                  <mat-option value="Low">Low</mat-option>
                  <mat-option value="Medium">Medium</mat-option>
                  <mat-option value="High">High</mat-option>
                  <mat-option value="Critical">Critical</mat-option>
                </mat-select>
                <mat-error
                  *ngIf="taskForm.get('priority')?.hasError('required')"
                >
                  Priority is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Estimated Hours</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="estimatedHours"
                  min="0"
                  step="0.5"
                />
              </mat-form-field>

              <mat-form-field appearance="outline" *ngIf="isEditMode">
                <mat-label>Actual Hours</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="actualHours"
                  min="0"
                  step="0.5"
                />
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button
                mat-button
                color="primary"
                type="button"
                routerLink="/tasks"
              >
                Cancel
              </button>
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="taskForm.invalid"
              >
                {{ isEditMode ? 'Update Task' : 'Create Task' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .task-form-container {
        max-width: 800px;
        margin: 24px auto;
        padding: 16px;
      }

      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }

      .form-row {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
      }

      .form-row > * {
        flex: 1;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 24px;
      }
    `,
  ],
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  isEditMode = false;
  taskId: number | null = null;
  projects: any[] = [];
  users: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private taskService: TaskService,
    private projectService: ProjectService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.taskForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: [''],
      projectId: [null, Validators.required],
      assigneeId: [null],
      startDate: [null],
      dueDate: [null],
      status: ['To Do', Validators.required],
      priority: ['Medium', Validators.required],
      estimatedHours: [null],
      actualHours: [null],
    });
  }

  ngOnInit(): void {
    // Check if editing existing task
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.taskId = +id;
      this.loadTask(this.taskId);
    }

    // Load projects and users for dropdowns
    this.loadProjects();
    this.loadUsers();
  }

  loadTask(taskId: number): void {
    this.taskService.getTask(taskId).subscribe({
      next: (response) => {
        const task = response.data;

        // Format dates for the form
        const startDate = task.start_date ? new Date(task.start_date) : null;
        const dueDate = task.due_date ? new Date(task.due_date) : null;

        this.taskForm.patchValue({
          title: task.title,
          description: task.description,
          projectId: task.task_id,
          assigneeId: task.assignee_id,
          startDate: startDate,
          dueDate: dueDate,
          status: task.status,
          priority: task.priority,
          estimatedHours: task.estimated_hours,
          actualHours: task.actual_hours,
        });
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Failed to load task', 'Close', {
          duration: 5000,
        });
        this.router.navigate(['/tasks']);
      },
    });
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (response) => {
        this.projects = response.data;

        // Pre-select project ID if provided in query params (for creating tasks from project page)
        const projectId = this.route.snapshot.queryParamMap.get('projectId');
        if (projectId && !this.isEditMode) {
          this.taskForm.patchValue({ projectId: +projectId });
        }
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

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (response) => {
        this.users = response.data;
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Failed to load users', 'Close', {
          duration: 5000,
        });
      },
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      return;
    }

    // Format the task data for API
    const taskData = {
      title: this.taskForm.value.title,
      description: this.taskForm.value.description,
      projectId: this.taskForm.value.projectId,
      assigneeId: this.taskForm.value.assigneeId,
      startDate: this.taskForm.value.startDate,
      dueDate: this.taskForm.value.dueDate,
      status: this.taskForm.value.status,
      priority: this.taskForm.value.priority,
      estimatedHours: this.taskForm.value.estimatedHours,
      actualHours: this.taskForm.value.actualHours,
    };

    if (this.isEditMode && this.taskId) {
      // Update existing task
      this.taskService.updateTask(this.taskId, taskData).subscribe({
        next: () => {
          this.snackBar.open('Task updated successfully', 'Close', {
            duration: 3000,
          });
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          this.snackBar.open(
            error.message || 'Failed to update task',
            'Close',
            {
              duration: 5000,
            }
          );
        },
      });
    } else {
      // Create new task
      this.taskService.createTask(taskData).subscribe({
        next: () => {
          this.snackBar.open('Task created successfully', 'Close', {
            duration: 3000,
          });
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          this.snackBar.open(
            error.message || 'Failed to create task',
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
