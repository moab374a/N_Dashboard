// src/app/core/services/task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Task } from '../models/project.models';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getTasks(params?: {
    [key: string]: any;
  }): Observable<{ success: boolean; data: Task[]; count: number }> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<{ success: boolean; data: Task[]; count: number }>(
      this.apiUrl,
      { params: httpParams }
    );
  }

  getTask(id: number): Observable<{ success: boolean; data: Task }> {
    return this.http.get<{ success: boolean; data: Task }>(
      `${this.apiUrl}/${id}`
    );
  }

  createTask(task: any): Observable<{ success: boolean; data: Task }> {
    return this.http.post<{ success: boolean; data: Task }>(this.apiUrl, task);
  }

  updateTask(
    id: number,
    task: any
  ): Observable<{ success: boolean; data: Task }> {
    return this.http.put<{ success: boolean; data: Task }>(
      `${this.apiUrl}/${id}`,
      task
    );
  }

  deleteTask(id: number): Observable<{ success: boolean; data: {} }> {
    return this.http.delete<{ success: boolean; data: {} }>(
      `${this.apiUrl}/${id}`
    );
  }
}
