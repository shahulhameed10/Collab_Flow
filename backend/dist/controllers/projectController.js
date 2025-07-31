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
exports.deleteProject = exports.updateProject = exports.getProjectsByWorkspace = exports.createProject = void 0;
const Project_1 = __importDefault(require("../models/Project"));
const redis_1 = require("redis");
const Workspace_1 = __importDefault(require("../models/Workspace"));
//create a redisclient for cache
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL
});
redisClient.connect().then(() => {
    console.log('🟢 Redis connected in projectController');
}).catch(err => {
    console.error('❌ Redis connection failed:', err);
});
//Create a Project based on workspace id
const createProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, deadline, workspaceId } = req.body;
    try {
        console.log("Creating Project with workspaceId:", workspaceId);
        if (!workspaceId || isNaN(Number(workspaceId))) {
            return res.status(400).json({ message: 'Invalid workspaceId: Not a number' });
        }
        const workspace = yield Workspace_1.default.findByPk(workspaceId);
        if (!workspace) {
            return res.status(400).json({ message: 'Invalid workspaceId: Workspace not found' });
        }
        const project = yield Project_1.default.create({
            name,
            description,
            deadline: deadline ? new Date(deadline) : null,
            workspaceId: Number(workspaceId),
        });
        //key to sore or retrive project data based on workspace id
        const cacheKey = `projects_workspace_${workspaceId}`;
        yield redisClient.del(cacheKey);
        res.status(201).json({
            message: 'Project created successfully',
            project,
        });
    }
    catch (err) {
        console.error('Project Creation Error:', err);
        res.status(500).json({
            message: 'Project creation failed',
            error: err.message || err.errors || err,
        });
    }
});
exports.createProject = createProject;
// Get all projects from workspace id with Redis caching
const getProjectsByWorkspace = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { workspaceId } = req.params;
    try {
        if (!workspaceId) {
            return res.status(400).json({ message: "workspaceId is required" });
        }
        const cacheKey = `projects_workspace_${workspaceId}`;
        const cached = yield redisClient.get(cacheKey);
        if (cached) {
            return res.json({
                message: "Projects fetched from cache",
                projects: JSON.parse(cached),
            });
        }
        const projects = yield Project_1.default.findAll({
            where: { workspaceId: Number(workspaceId) },
            attributes: ['id', 'name', 'description', 'deadline'],
        });
        yield redisClient.set(cacheKey, JSON.stringify(projects), { EX: 60 });
        res.json({
            message: "Projects fetched from DB",
            projects,
        });
    }
    catch (err) {
        console.error("Error fetching projects by workspace:", err);
        res.status(500).json({ message: "Error fetching projects", error: err });
    }
});
exports.getProjectsByWorkspace = getProjectsByWorkspace;
// Update project
const updateProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const project = yield Project_1.default.findByPk(id);
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
        yield project.update({ name, description });
        const cacheKey = `projects_workspace_${project.workspaceId}`;
        yield redisClient.del(cacheKey);
        res.json({
            message: 'Project updated successfully',
            project
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Project update failed', error: err });
    }
});
exports.updateProject = updateProject;
// Delete project
const deleteProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const project = yield Project_1.default.findByPk(id);
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
        yield project.destroy();
        // Emit socket event
        const cacheKey = `projects_workspace_${project.workspaceId}`;
        yield redisClient.del(cacheKey);
        res.json({ message: 'Project deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ message: 'Project deletion failed', error: err });
    }
});
exports.deleteProject = deleteProject;
