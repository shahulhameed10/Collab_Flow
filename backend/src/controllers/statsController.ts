import { Request, Response } from "express";
import User from "../models/User";
import Task from "../models/Task";
import Workspace from "../models/Workspace";
import Project from "../models/Project";

export const getStats = async (req: Request, res: Response) => {
  try {
    const [userCount, taskCount, workspaceCount, projectCount] = await Promise.all([
      User.count(),
      Task.count(),
      Workspace.count(),
      Project.count(),
    ]);

    // Fetch the latest 3 projects and tasks
    const recentProjects = await Project.findAll({
      order: [["createdAt", "DESC"]],
      limit: 3,
      attributes: ["id", "name", "createdAt"], // Send only what's needed
    });

    const recentTasks = await Task.findAll({
      order: [["createdAt", "DESC"]],
      limit: 3,
      attributes: ["id", "name", "createdAt"],
    });

    res.json({
      users: userCount,
      tasks: taskCount,
      workspaces: workspaceCount,
      projects: projectCount,
      recentProjects,
      recentTasks,
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};
