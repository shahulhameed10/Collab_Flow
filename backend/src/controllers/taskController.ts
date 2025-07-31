import { Request, Response } from 'express';
import Task from '../models/Task';
import { Op } from 'sequelize';
import { createClient } from 'redis';
import Project from '../models/Project';

// Redis client setup
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.connect()
  .then(() => console.log('🟢 Redis connected in taskController'))
  .catch(err => console.error('❌ Redis connection failed:', err));

// get project tasks based on cache key
const getCacheKey = (projectId: number) => `tasks_cache_${projectId}_all_all`;

// Utility to refresh project task cache
const refreshTaskCache = async (projectId: number) => {
  const tasks = await Task.findAll({ where: { projectId } });
  const key = getCacheKey(projectId);
  await redisClient.set(key, JSON.stringify(tasks), { EX: 60 });
};

// Create Task
export const createTask = async (req: Request, res: Response) => {
  const { name, status, priority, labels, dueDate, assignedTo, projectId } = req.body;

  try {
    const task = await Task.create({ name, status, priority, labels, dueDate, assignedTo, projectId });

    await refreshTaskCache(projectId);

    const io = req.app.locals.io;
    if (io) {
      io.emit('new-task', task);
    }

    res.status(201).json({
      message: 'Task created successfully',
      task,
    });
  } catch (err) {
    res.status(500).json({ message: 'Task creation failed', error: err });
  }
};

// Get tasks with filters
export const getTasks = async (req: Request, res: Response) => {
  const { priority, dueDate, projectId } = req.query;
  const whereClause: any = {};

  if (priority) whereClause.priority = priority;
  if (dueDate) whereClause.dueDate = { [Op.lte]: new Date(dueDate as string) };
  if (projectId) whereClause.projectId = Number(projectId);

  const cacheKey = `tasks_cache_${projectId || 'all'}_${priority || 'all'}_${dueDate || 'all'}`;

  try {
    const cachedTasks = await redisClient.get(cacheKey);
    if (cachedTasks) {
      return res.json({
        message: 'Tasks fetched from cache',
        tasks: JSON.parse(cachedTasks),
      });
    }

    const tasks = await Task.findAll({ where: whereClause });
    await redisClient.set(cacheKey, JSON.stringify(tasks), { EX: 60 });

    res.json({
      message: 'Tasks fetched from DB',
      tasks,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks', error: err });
  }
};

// Update Task
export const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, status, priority } = req.body; // only handling the fields you're using

  try {
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const updatedFields: any = {};
    if (name !== undefined) updatedFields.name = name;
    if (status !== undefined) updatedFields.status = status;
    if (priority !== undefined) updatedFields.priority = priority;

    await task.update(updatedFields);

    await refreshTaskCache(task.projectId); // 🔁 Update cache

    const io = req.app.locals.io;
    io.emit('task-updated', task);

    res.json({
      message: 'Task updated successfully',
      task,
    });
  } catch (err) {
    res.status(500).json({ message: 'Task update failed', error: err });
  }
};

// Update Task Status
export const updateTaskStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { newStatus } = req.body;

  try {
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.status = newStatus;
    await task.save();

    await refreshTaskCache(task.projectId);

    const io = req.app.locals.io;
    io.emit('task-status-updated', { id, newStatus });

    res.json({ id, newStatus });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status', error: err });
  }
};

// Delete Task
export const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await task.destroy();

    await refreshTaskCache(task.projectId); 

    const io = req.app.locals.io;
    io.emit('task-deleted', { id });

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Task deletion failed', error: err });
  }
};
