import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Project,
  ProjectDetail,
  ProjectCreateRequest,
  ProjectUpdateRequest,
} from '../models/project.models';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  getProjects(params?: {
    [key: string]: any;
  }): Observable<{ success: boolean; data: Project[]; pagination: any }> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<{
      success: boolean;
      data: Project[];
      pagination: any;
    }>(this.apiUrl, { params: httpParams });
  }

  getProject(
    id: number
  ): Observable<{ success: boolean; data: ProjectDetail }> {
    return this.http.get<{ success: boolean; data: ProjectDetail }>(
      `${this.apiUrl}/${id}`
    );
  }

  createProject(
    project: ProjectCreateRequest
  ): Observable<{ success: boolean; data: Project }> {
    return this.http.post<{ success: boolean; data: Project }>(
      this.apiUrl,
      project
    );
  }

  updateProject(
    projectId: number,
    project: ProjectUpdateRequest
  ): Observable<{ success: boolean; data: Project }> {
    return this.http.put<{ success: boolean; data: Project }>(
      `${this.apiUrl}/${projectId}`,
      project
    );
  }

  deleteProject(id: number): Observable<{ success: boolean; data: {} }> {
    return this.http.delete<{ success: boolean; data: {} }>(
      `${this.apiUrl}/${id}`
    );
  }

  getProjectStatistics(
    id: number
  ): Observable<{ success: boolean; data: any }> {
    return this.http.get<{ success: boolean; data: any }>(
      `${this.apiUrl}/${id}/statistics`
    );
  }
}
