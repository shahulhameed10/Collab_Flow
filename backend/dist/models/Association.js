"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("./User"));
const Workspace_1 = __importDefault(require("./Workspace"));
const Project_1 = __importDefault(require("./Project"));
const Task_1 = __importDefault(require("./Task"));
const Taskcomment_1 = __importDefault(require("./Taskcomment"));
const WorkspaceInvite_1 = __importDefault(require("./WorkspaceInvite"));
// User Associations
User_1.default.hasMany(Workspace_1.default, {
    foreignKey: 'ownerId',
    as: 'ownedWorkspaces',
});
User_1.default.hasMany(Task_1.default, {
    foreignKey: 'assignedTo',
    as: 'assignedTasks',
});
User_1.default.hasMany(Taskcomment_1.default, {
    foreignKey: 'userId',
    as: 'comments',
});
User_1.default.belongsToMany(Project_1.default, {
    through: 'ProjectMembers',
    foreignKey: 'userId',
    otherKey: 'projectId',
    as: 'projects',
});
// Workspace Associations
Workspace_1.default.belongsTo(User_1.default, {
    foreignKey: 'ownerId',
    as: 'owner',
});
Workspace_1.default.hasMany(Project_1.default, {
    foreignKey: 'workspaceId',
    as: 'projects',
});
Workspace_1.default.hasMany(WorkspaceInvite_1.default, {
    foreignKey: 'workspaceId',
    as: 'invites',
});
// Project Associations
Project_1.default.belongsTo(Workspace_1.default, {
    foreignKey: 'workspaceId',
    as: 'workspace',
});
Project_1.default.belongsToMany(User_1.default, {
    through: 'ProjectMembers',
    foreignKey: 'projectId',
    otherKey: 'userId',
    as: 'members',
});
Project_1.default.hasMany(Task_1.default, {
    foreignKey: 'projectId',
    as: 'tasks',
});
// Task Associations
Task_1.default.belongsTo(Project_1.default, {
    foreignKey: 'projectId',
    as: 'project',
});
Task_1.default.belongsTo(User_1.default, {
    foreignKey: 'assignedTo',
    as: 'assignee',
});
Task_1.default.hasMany(Taskcomment_1.default, {
    foreignKey: 'taskId',
    as: 'comments',
});
// TaskComment Associations
Taskcomment_1.default.belongsTo(Task_1.default, {
    foreignKey: 'taskId',
    as: 'task',
});
Taskcomment_1.default.belongsTo(User_1.default, {
    foreignKey: 'userId',
    as: 'author',
});
// WorkspaceInvite Associations
WorkspaceInvite_1.default.belongsTo(Workspace_1.default, {
    foreignKey: 'workspaceId',
    as: 'invitedWorkspace',
});
