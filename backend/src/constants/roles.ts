export const Roles = {
  ADMIN: 'Admin',
  OWNER: 'WorkspaceOwner',
  MANAGER: 'ProjectManager',
  DEVELOPER: 'Developer',
  VIEWER: 'Viewer',
} as const;
//we assign role as a constant so there is no change during runtime