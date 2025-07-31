"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTaskStatus = exports.updateTask = exports.getTasks = exports.createTask = void 0;
const Task_1 = __importDefault(require("../models/Task"));
const sequelize_1 = require("sequelize");
const redis_1 = require("redis");
// Redis client setup
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL,
});
redisClient.connect()
    .then(() => console.log('🟢 Redis connected in taskController'))
    .catch(err => console.error('❌ Redis connection failed:', err));
// get project tasks based on cache key
const getCacheKey = (projectId) => `tasks_cache_${projectId}_all_all`;
// Utility to refresh project task cache
const refreshTaskCache = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    const tasks = yield Task_1.default.findAll({ where: { projectId } });
    const key = getCacheKey(projectId);
    yield redisClient.set(key, JSON.stringify(tasks), { EX: 60 });
});
// Create Task
const createTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, status, priority, labels, dueDate, assignedTo, projectId } = req.body;
    try {
        const task = yield Task_1.default.create({ name, status, priority, labels, dueDate, assignedTo, projectId });
        yield refreshTaskCache(projectId);
        const io = req.app.locals.io;
        if (io) {
            io.emit('new-task', task);
        }
        res.status(201).json({
            message: 'Task created successfully',
            task,
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Task creation failed', error: err });
    }
});
exports.createTask = createTask;
// Get tasks with filters
const getTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { priority, dueDate, projectId } = req.query;
    const whereClause = {};
    if (priority)
        whereClause.priority = priority;
    if (dueDate)
        whereClause.dueDate = { [sequelize_1.Op.lte]: new Date(dueDate) };
    if (projectId)
        whereClause.projectId = Number(projectId);
    const cacheKey = `tasks_cache_${projectId || 'all'}_${priority || 'all'}_${dueDate || 'all'}`;
    try {
        const cachedTasks = yield redisClient.get(cacheKey);
        if (cachedTasks) {
            return res.json({
                message: 'Tasks fetched from cache',
                tasks: JSON.parse(cachedTasks),
            });
        }
        const tasks = yield Task_1.default.findAll({ where: whereClause });
        yield redisClient.set(cacheKey, JSON.stringify(tasks), { EX: 60 });
        res.json({
            message: 'Tasks fetched from DB',
            tasks,
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Error fetching tasks', error: err });
    }
});
exports.getTasks = getTasks;
// Update Task
const updateTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, status, priority } = req.body; // only handling the fields you're using
    try {
        const task = yield Task_1.default.findByPk(id);
        if (!task)
            return res.status(404).json({ message: 'Task not found' });
        const updatedFields = {};
        if (name !== undefined)
            updatedFields.name = name;
        if (status !== undefined)
            updatedFields.status = status;
        if (priority !== undefined)
            updatedFields.priority = priority;
        yield task.update(updatedFields);
        yield refreshTaskCache(task.projectId); // 🔁 Update cache
        const io = req.app.locals.io;
        io.emit('task-updated', task);
        res.json({
            message: 'Task updated successfully',
            task,
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Task update failed', error: err });
    }
});
exports.updateTask = updateTask;
// Update Task Status
const updateTaskStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { newStatus } = req.body;
    try {
        const task = yield Task_1.default.findByPk(id);
        if (!task)
            return res.status(404).json({ message: 'Task not found' });
        task.status = newStatus;
        yield task.save();
        yield refreshTaskCache(task.projectId);
        const io = req.app.locals.io;
        io.emit('task-status-updated', { id, newStatus });
        res.json({ id, newStatus });
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to update status', error: err });
    }
});
exports.updateTaskStatus = updateTaskStatus;
// Delete Task
const deleteTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const task = yield Task_1.default.findByPk(id);
        if (!task)
            return res.status(404).json({ message: 'Task not found' });
        yield task.destroy();
        yield refreshTaskCache(task.projectId);
        const io = req.app.locals.io;
        io.emit('task-deleted', { id });
        res.json({ message: 'Task deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ message: 'Task deletion failed', error: err });
    }
});
exports.deleteTask = deleteTask;
