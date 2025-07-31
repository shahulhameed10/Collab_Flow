import { Request, Response } from 'express';
import Project from '../models/Project';
import { createClient } from 'redis';
import Workspace from '../models/Workspace';

//create a redisclient for cache
const redisClient = createClient({
  url: process.env.REDIS_URL
});
redisClient.connect().then(() => {
  console.log('🟢 Redis connected in projectController');
}).catch(err => {
  console.error('❌ Redis connection failed:', err);
});


//Create a Project based on workspace id
export const createProject = async (req: Request, res: Response) => {
  const { name, description, deadline, workspaceId } = req.body;

  try {
    console.log("Creating Project with workspaceId:", workspaceId);

    if (!workspaceId || isNaN(Number(workspaceId))) {
      return res.status(400).json({ message: 'Invalid workspaceId: Not a number' });
    }

    const workspace = await Workspace.findByPk(workspaceId);
    if (!workspace) {
      return res.status(400).json({ message: 'Invalid workspaceId: Workspace not found' });
    }

    const project = await Project.create({
      name,
      description,
      deadline: deadline ? new Date(deadline) : null,
      workspaceId: Number(workspaceId),
    });

    //key to sore or retrive project data based on workspace id
    const cacheKey = `projects_workspace_${workspaceId}`;
    await redisClient.del(cacheKey);

    res.status(201).json({
      message: 'Project created successfully',
      project,
    });
  } catch (err: any) {
    console.error('Project Creation Error:', err);
    res.status(500).json({
      message: 'Project creation failed',
      error: err.message || err.errors || err,
    });
  }
};


// Get all projects from workspace id with Redis caching
export const getProjectsByWorkspace = async (req: Request, res: Response) => {
  const { workspaceId } = req.params;

  try {
    if (!workspaceId) {
      return res.status(400).json({ message: "workspaceId is required" });
    }

    const cacheKey = `projects_workspace_${workspaceId}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json({
        message: "Projects fetched from cache",
        projects: JSON.parse(cached),
      });
    }

    const projects = await Project.findAll({
      where: { workspaceId: Number(workspaceId) },
      attributes: ['id', 'name', 'description', 'deadline'],
    });

    await redisClient.set(cacheKey, JSON.stringify(projects), { EX: 60 });

    res.json({
      message: "Projects fetched from DB",
      projects,
    });
  } catch (err) {
    console.error("Error fetching projects by workspace:", err);
    res.status(500).json({ message: "Error fetching projects", error: err });
  }
};



// Update project
export const updateProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const project = await Project.findByPk(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await project.update({ name, description });


    const cacheKey = `projects_workspace_${project.workspaceId}`;
    await redisClient.del(cacheKey);

    res.json({
      message: 'Project updated successfully',
      project
    });
  } catch (err) {
    res.status(500).json({ message: 'Project update failed', error: err });
  }
};

// Delete project
export const deleteProject = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const project = await Project.findByPk(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await project.destroy();

    // Emit socket event

    const cacheKey = `projects_workspace_${project.workspaceId}`;
    await redisClient.del(cacheKey);


    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Project deletion failed', error: err });
  }
};
