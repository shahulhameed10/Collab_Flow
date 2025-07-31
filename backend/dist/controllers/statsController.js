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
exports.getStats = void 0;
const User_1 = __importDefault(require("../models/User"));
const Task_1 = __importDefault(require("../models/Task"));
const Workspace_1 = __importDefault(require("../models/Workspace"));
const Project_1 = __importDefault(require("../models/Project"));
const getStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [userCount, taskCount, workspaceCount, projectCount] = yield Promise.all([
            User_1.default.count(),
            Task_1.default.count(),
            Workspace_1.default.count(),
            Project_1.default.count(),
        ]);
        // Fetch the latest 3 projects and tasks
        const recentProjects = yield Project_1.default.findAll({
            order: [["createdAt", "DESC"]],
            limit: 3,
            attributes: ["id", "name", "createdAt"], // Send only what's needed
        });
        const recentTasks = yield Task_1.default.findAll({
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
    }
    catch (error) {
        console.error("Stats fetch error:", error);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});
exports.getStats = getStats;
