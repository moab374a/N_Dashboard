-- Database Schema for Remote Electronic Business Management System

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    job_title VARCHAR(100),
    profile_image_url VARCHAR(255),
    phone_number VARCHAR(20),
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(100),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Roles Table - Defines system roles
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Roles - Many-to-many relationship between users and roles
CREATE TABLE user_roles (
    user_id INTEGER REFERENCES users(user_id),
    role_id INTEGER REFERENCES roles(role_id),
    PRIMARY KEY (user_id, role_id)
);

-- Permissions Table - Defines system permissions
CREATE TABLE permissions (
    permission_id SERIAL PRIMARY KEY,
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role Permissions - Many-to-many relationship between roles and permissions
CREATE TABLE role_permissions (
    role_id INTEGER REFERENCES roles(role_id),
    permission_id INTEGER REFERENCES permissions(permission_id),
    PRIMARY KEY (role_id, permission_id)
);

-- Teams Table - Defines work teams
CREATE TABLE teams (
    team_id SERIAL PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Team Members - Many-to-many relationship between users and teams
CREATE TABLE team_members (
    team_id INTEGER REFERENCES teams(team_id),
    user_id INTEGER REFERENCES users(user_id),
    role VARCHAR(50) NOT NULL, -- Role within the team (leader, member, etc.)
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, user_id)
);

-- Projects Table - Stores project information
CREATE TABLE projects (
    project_id SERIAL PRIMARY KEY,
    project_name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) NOT NULL, -- 'Not Started', 'In Progress', 'Completed', 'On Hold'
    priority VARCHAR(20) NOT NULL, -- 'Low', 'Medium', 'High', 'Critical'
    owner_id INTEGER REFERENCES users(user_id),
    team_id INTEGER REFERENCES teams(team_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Project Members - Many-to-many relationship between users and projects
CREATE TABLE project_members (
    project_id INTEGER REFERENCES projects(project_id),
    user_id INTEGER REFERENCES users(user_id),
    role VARCHAR(50) NOT NULL, -- Role on the project
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id)
);

-- Tasks Table - Stores task information
CREATE TABLE tasks (
    task_id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(project_id),
    parent_task_id INTEGER REFERENCES tasks(task_id), -- For subtasks
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE,
    due_date DATE,
    completed_date DATE,
    estimated_hours DECIMAL(6,2),
    actual_hours DECIMAL(6,2),
    status VARCHAR(20) NOT NULL, -- 'To Do', 'In Progress', 'Review', 'Completed', 'Blocked'
    priority VARCHAR(20) NOT NULL, -- 'Low', 'Medium', 'High', 'Critical'
    creator_id INTEGER REFERENCES users(user_id),
    assignee_id INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task Dependencies - Tasks that depend on other tasks
CREATE TABLE task_dependencies (
    dependent_task_id INTEGER REFERENCES tasks(task_id),
    prerequisite_task_id INTEGER REFERENCES tasks(task_id),
    PRIMARY KEY (dependent_task_id, prerequisite_task_id)
);

-- Task Comments - Comments on tasks
CREATE TABLE task_comments (
    comment_id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(task_id),
    user_id INTEGER REFERENCES users(user_id),
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Time Tracking - Records work time spent on tasks
CREATE TABLE time_entries (
    entry_id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(task_id),
    user_id INTEGER REFERENCES users(user_id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    description TEXT,
    hours_logged DECIMAL(6,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents Table - Document management
CREATE TABLE documents (
    document_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL, -- in bytes
    project_id INTEGER REFERENCES projects(project_id),
    task_id INTEGER REFERENCES tasks(task_id),
    uploader_id INTEGER REFERENCES users(user_id) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document Access - Controls who can access documents
CREATE TABLE document_access (
    document_id INTEGER REFERENCES documents(document_id),
    user_id INTEGER REFERENCES users(user_id),
    access_level VARCHAR(20) NOT NULL, -- 'read', 'edit', 'admin'
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (document_id, user_id)
);

-- Chat Channels - For communication
CREATE TABLE chat_channels (
    channel_id SERIAL PRIMARY KEY,
    channel_name VARCHAR(100) NOT NULL,
    channel_type VARCHAR(20) NOT NULL, -- 'direct', 'team', 'project'
    project_id INTEGER REFERENCES projects(project_id),
    team_id INTEGER REFERENCES teams(team_id),
    created_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Channel Members - Users in chat channels
CREATE TABLE channel_members (
    channel_id INTEGER REFERENCES chat_channels(channel_id),
    user_id INTEGER REFERENCES users(user_id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (channel_id, user_id)
);

-- Messages - Chat messages
CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    channel_id INTEGER REFERENCES chat_channels(channel_id),
    sender_id INTEGER REFERENCES users(user_id),
    message_text TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT false
);

-- Notifications Table
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    reference_id INTEGER, -- ID of related entity (task, project, etc.)
    reference_type VARCHAR(50), -- Type of related entity
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Logs - For auditing and tracking
CREATE TABLE system_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'user', 'project', 'task', etc.
    entity_id INTEGER NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Calendar Events
CREATE TABLE calendar_events (
    event_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location VARCHAR(255),
    is_all_day BOOLEAN DEFAULT false,
    project_id INTEGER REFERENCES projects(project_id),
    task_id INTEGER REFERENCES tasks(task_id),
    creator_id INTEGER REFERENCES users(user_id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event Attendees
CREATE TABLE event_attendees (
    event_id INTEGER REFERENCES calendar_events(event_id),
    user_id INTEGER REFERENCES users(user_id),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
    PRIMARY KEY (event_id, user_id)
);
-- Verification Tokens Table - For email verification
CREATE TABLE verification_tokens (
    token_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add an index for performance
CREATE INDEX idx_verification_tokens_user_id ON verification_tokens(user_id);
CREATE INDEX idx_verification_tokens_token ON verification_tokens(token);

-- Create indexes for performance optimization
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_messages_channel_id ON messages(channel_id);
CREATE INDEX idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
-- Remove  column if it exists
ALTER TABLE users DROP COLUMN IF EXISTS ;