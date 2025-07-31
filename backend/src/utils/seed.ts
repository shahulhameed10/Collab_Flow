import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid'; // Make sure to install uuid
import User from '../models/User';
import Workspace from '../models/Workspace';
import Project from '../models/Project';
import Task from '../models/Task';
import WorkspaceInvite from '../models/WorkspaceInvite';

export const seedData = async () => {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create Users
  const users = await User.bulkCreate(
    [
      {
        email: 'admin@collabflow.com',
        password: hashedPassword,
        role: 'Admin',
        isVerified: true,
      },
      {
        email: 'developer@example.com',
        password: hashedPassword,
        role: 'Developer',
        isVerified: true,
      },
      {
        email: 'manager@example.com',
        password: hashedPassword,
        role: 'ProjectManager',
        isVerified: true,
      },
    ],
    { returning: true }
  );

  const adminUser = users.find((u) => u.role === 'Admin');
  const developerUser = users.find((u) => u.role === 'Developer');

  if (!adminUser || !developerUser) {
    throw new Error('Admin or Developer user not found after creation.');
  }

  // Create Workspace with ownerId
  const workspace = await Workspace.create({
    name: 'CollabFlow Workspace',
    ownerId: adminUser.id,
    brandinglogo:'https://media.istockphoto.com/id/2157427049/photo/business-men-with-colleague-traders-at-office-monitoring-stocks-data-on-screen-analyzing.jpg?s=1024x1024&w=is&k=20&c=sWVeJTALML-OtTsm4AuD_iBn-2ngGCf4ZxX3fgUzFh4='
  });

  // Create Project
  const project = await Project.create({
    name: 'CollabFlow Project',
    description: 'Test project',
    workspaceId: workspace.id,
  });

  // Create Task
  await Task.create({
    name: 'Sample Task',
    status: 'pending',
    priority: 'high',
    dueDate: new Date(),
    assignedTo: developerUser.id,
    projectId: project.id,
  });

  // ✅ Add WorkspaceInvite
  await WorkspaceInvite.create({
    email: 'inviteduser@example.com',
    workspaceId: workspace.id,
    role: 'Member',
    token: uuidv4(),
    accepted: false,
  });

  console.log('✅ Seeding completed');
};
