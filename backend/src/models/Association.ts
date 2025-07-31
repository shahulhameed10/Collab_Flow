import User from './User';
import Workspace from './Workspace';
import Project from './Project';
import Task from './Task';
import TaskComment from './Taskcomment';
import WorkspaceInvite from './WorkspaceInvite';

// User Associations
User.hasMany(Workspace, {
  foreignKey: 'ownerId',
  as: 'ownedWorkspaces',
});

User.hasMany(Task, {
  foreignKey: 'assignedTo',
  as: 'assignedTasks',
});

User.hasMany(TaskComment, {
  foreignKey: 'userId',
  as: 'comments',
});

User.belongsToMany(Project, {
  through: 'ProjectMembers',
  foreignKey: 'userId',
  otherKey: 'projectId',
  as: 'projects',
});

// Workspace Associations
Workspace.belongsTo(User, {
  foreignKey: 'ownerId',
  as: 'owner',
});

Workspace.hasMany(Project, {
  foreignKey: 'workspaceId',
  as: 'projects',
});

Workspace.hasMany(WorkspaceInvite, {
  foreignKey: 'workspaceId',
  as: 'invites',
});

// Project Associations
Project.belongsTo(Workspace, {
  foreignKey: 'workspaceId',
  as: 'workspace',
});

Project.belongsToMany(User, {
  through: 'ProjectMembers',
  foreignKey: 'projectId',
  otherKey: 'userId',
  as: 'members',
});

Project.hasMany(Task, {
  foreignKey: 'projectId',
  as: 'tasks',
});

// Task Associations
Task.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'project',
});

Task.belongsTo(User, {
  foreignKey: 'assignedTo',
  as: 'assignee',
});

Task.hasMany(TaskComment, {
  foreignKey: 'taskId',
  as: 'comments',
});

// TaskComment Associations
TaskComment.belongsTo(Task, {
  foreignKey: 'taskId',
  as: 'task',
});

TaskComment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'author',
});

// WorkspaceInvite Associations
WorkspaceInvite.belongsTo(Workspace, {
  foreignKey: 'workspaceId',
  as: 'invitedWorkspace',
});
