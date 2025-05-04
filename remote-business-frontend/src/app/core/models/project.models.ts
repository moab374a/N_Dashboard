import { User } from './auth.models';

export interface Project {
  project_id: number;
  project_name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  owner_id: number;
  owner_username: string;
  owner_first_name: string;
  owner_last_name: string;
  team_id?: number;
  team_name?: string;
  task_count: number;
  completed_tasks: number;
  members: ProjectMember[];
}

export interface ProjectMember {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_image_url?: string;
  role: string;
}

export interface ProjectDetail extends Project {
  tasks: Task[];
  documents: Document[];
  statistics: ProjectStatistics;
}

export interface Task {
  task_id: number;
  title: string;
  description?: string;
  start_date?: string;
  due_date?: string;
  completed_date?: string;
  status: string;
  priority: string;
  estimated_hours?: number;
  actual_hours?: number;
  assignee_id?: number;
  assignee_username?: string;
  assignee_first_name?: string;
  assignee_last_name?: string;
}

export interface Document {
  document_id: number;
  title: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  uploader_id: number;
  uploader_username: string;
}

export interface ProjectStatistics {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  todo_tasks: number;
  blocked_tasks: number;
  overdue_tasks: number;
  total_estimated_hours: number;
  total_actual_hours: number;
}

export interface ProjectCreateRequest {
  projectName: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: string;
  priority: string;
  teamId?: number;
  members?: {
    userId: number;
    role: string;
  }[];
}

export interface ProjectUpdateRequest extends ProjectCreateRequest {
  projectId: number | null;
}
