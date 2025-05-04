// src/app/features/projects/project-form/project-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-project-form',
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
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="project-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{
            isEditMode ? 'Edit Project' : 'Create New Project'
          }}</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="projectForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Project Name</mat-label>
              <input matInput formControlName="projectName" required />
              <mat-error
                *ngIf="projectForm.get('projectName')?.hasError('required')"
              >
                Project name is required
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
                <mat-label>Start Date</mat-label>
                <input
                  matInput
                  [matDatepicker]="startPicker"
                  formControlName="startDate"
                  required
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="startPicker"
                ></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
                <mat-error
                  *ngIf="projectForm.get('startDate')?.hasError('required')"
                >
                  Start date is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>End Date</mat-label>
                <input
                  matInput
                  [matDatepicker]="endPicker"
                  formControlName="endDate"
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="endPicker"
                ></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status" required>
                  <mat-option value="Not Started">Not Started</mat-option>
                  <mat-option value="In Progress">In Progress</mat-option>
                  <mat-option value="On Hold">On Hold</mat-option>
                  <mat-option value="Completed">Completed</mat-option>
                </mat-select>
                <mat-error
                  *ngIf="projectForm.get('status')?.hasError('required')"
                >
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
                  *ngIf="projectForm.get('priority')?.hasError('required')"
                >
                  Priority is required
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Team</mat-label>
              <mat-select formControlName="teamId">
                <mat-option [value]="null">No Team</mat-option>
                <mat-option *ngFor="let team of teams" [value]="team.team_id">
                  {{ team.team_name }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <div class="form-actions">
              <button
                mat-button
                color="primary"
                type="button"
                routerLink="/projects"
              >
                Cancel
              </button>
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="projectForm.invalid"
              >
                {{ isEditMode ? 'Update Project' : 'Create Project' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .project-form-container {
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
export class ProjectFormComponent implements OnInit {
  projectForm: FormGroup;
  isEditMode = false;
  projectId: number | null = null;
  teams: any[] = [];
  users: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private projectService: ProjectService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.projectForm = this.formBuilder.group({
      projectName: ['', Validators.required],
      description: [''],
      startDate: [new Date(), Validators.required],
      endDate: [null],
      status: ['Not Started', Validators.required],
      priority: ['Medium', Validators.required],
      teamId: [null],
    });
  }

  ngOnInit(): void {
    // Check if editing existing project
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.projectId = +id;
      this.loadProject(this.projectId);
    }

    // Load teams
    this.loadTeams();
  }

  loadProject(projectId: number): void {
    this.projectService.getProject(projectId).subscribe({
      next: (response) => {
        const project = response.data;

        // Format dates for the form
        const startDate = project.start_date
          ? new Date(project.start_date)
          : null;
        const endDate = project.end_date ? new Date(project.end_date) : null;

        this.projectForm.patchValue({
          projectName: project.project_name,
          description: project.description,
          startDate: startDate,
          endDate: endDate,
          status: project.status,
          priority: project.priority,
          teamId: project.team_id || null,
        });
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Failed to load project', 'Close', {
          duration: 5000,
        });
        this.router.navigate(['/projects']);
      },
    });
  }

  loadTeams(): void {
    // In a real app, this would call a team service
    // For now, we'll use a placeholder
    this.teams = [
      { team_id: 1, team_name: 'Development Team' },
      { team_id: 2, team_name: 'Design Team' },
      { team_id: 3, team_name: 'Marketing Team' },
    ];
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      return;
    }

    // Format the project data for API
    const projectData = {
      projectId: this.projectId,
      projectName: this.projectForm.value.projectName,
      description: this.projectForm.value.description,
      startDate: this.projectForm.value.startDate,
      endDate: this.projectForm.value.endDate,
      status: this.projectForm.value.status,
      priority: this.projectForm.value.priority,
      teamId: this.projectForm.value.teamId,
    };

    if (this.isEditMode && this.projectId) {
      // Update existing project
      this.projectService.updateProject(this.projectId, projectData).subscribe({
        next: (response) => {
          this.snackBar.open('Project updated successfully', 'Close', {
            duration: 3000,
          });
          this.router.navigate(['/projects', this.projectId]);
        },
        error: (error) => {
          this.snackBar.open(
            error.message || 'Failed to update project',
            'Close',
            {
              duration: 5000,
            }
          );
        },
      });
    } else {
      // Create new project
      this.projectService.createProject(projectData).subscribe({
        next: (response) => {
          this.snackBar.open('Project created successfully', 'Close', {
            duration: 3000,
          });
          this.router.navigate(['/projects', response.data.project_id]);
        },
        error: (error) => {
          this.snackBar.open(
            error.message || 'Failed to create project',
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
