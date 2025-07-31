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
exports.deleteWorkspace = exports.updateWorkspace = exports.getAllWorkspaces = exports.createWorkspace = void 0;
const Workspace_1 = __importDefault(require("../models/Workspace"));
const mailer_1 = require("../utils/mailer");
const redisClient_1 = __importDefault(require("../utils/redisClient"));
const WorkspaceInvite_1 = __importDefault(require("../models/WorkspaceInvite"));
// ✅ Create Workspace
const createWorkspace = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, brandingLogo, members = [] } = req.body;
    const ownerId = req.user.id;
    try {
        yield redisClient_1.default.del("workspaces:all");
        const workspace = yield Workspace_1.default.create({ name, ownerId, brandingLogo });
        for (const email of members) {
            try {
                yield WorkspaceInvite_1.default.create({
                    email,
                    workspaceId: workspace.id,
                    accepted: false,
                });
                yield (0, mailer_1.sendInvitationEmail)(email, workspace.name, req.user.email);
                console.log(`📨 Invitation sent to ${email}`);
            }
            catch (err) {
                console.error(`❌ Failed to invite ${email}:`, err);
            }
        }
        res.status(201).json({ message: "Workspace created successfully", workspace });
    }
    catch (err) {
        console.error("❌ Error creating workspace:", err);
        res.status(500).json({ message: "Workspace creation failed" });
    }
});
exports.createWorkspace = createWorkspace;
// ✅ Get all workspaces (with Redis cache)
const getAllWorkspaces = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cacheKey = "workspaces:all";
        const cached = yield redisClient_1.default.get(cacheKey);
        if (cached) {
            console.log("🧠 Fetched workspaces from Redis cache");
            return res.json(JSON.parse(cached));
        }
        const workspaces = yield Workspace_1.default.findAll({
            include: [
                {
                    model: WorkspaceInvite_1.default,
                    as: "invites",
                    attributes: ["email", "role", "accepted"],
                },
            ],
        });
        yield redisClient_1.default.set(cacheKey, JSON.stringify(workspaces), { EX: 3600 });
        console.log("🐘 Fetched workspaces from DB and stored in Redis");
        res.json(workspaces);
    }
    catch (err) {
        console.error("❌ Redis Workspace Fetch Error:", err);
        res.status(500).json({ message: "Error fetching workspaces" });
    }
});
exports.getAllWorkspaces = getAllWorkspaces;
// ✅ Update workspace
const updateWorkspace = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const { name, brandingLogo } = req.body;
        console.log("🌐 Attempting to update workspace ID:", id);
        const workspace = yield Workspace_1.default.findByPk(id);
        if (!workspace) {
            console.warn("❌ Workspace not found in DB for ID:", id);
            return res.status(404).json({ message: "Workspace not found" });
        }
        workspace.name = name;
        workspace.brandingLogo = brandingLogo;
        yield workspace.save();
        yield redisClient_1.default.del("workspaces:all"); // invalidate cache
        console.log("✅ Workspace updated:", workspace.toJSON());
        res.json({ message: "Workspace updated", workspace });
    }
    catch (err) {
        console.error("❌ Error updating workspace:", err);
        res.status(500).json({ message: "Update failed" });
    }
});
exports.updateWorkspace = updateWorkspace;
// ✅ Delete workspace
const deleteWorkspace = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        console.log("🗑️ Attempting to delete workspace ID:", id);
        const workspace = yield Workspace_1.default.findByPk(id);
        if (!workspace) {
            console.warn("❌ Workspace not found in DB for ID:", id);
            return res.status(404).json({ message: "Workspace not found" });
        }
        yield workspace.destroy();
        yield redisClient_1.default.del("workspaces:all"); // invalidate cache
        console.log("🗑️ Workspace deleted:", id);
        res.json({ message: "Workspace deleted" });
    }
    catch (err) {
        console.error("❌ Error deleting workspace:", err);
        res.status(500).json({ message: "Delete failed" });
    }
});
exports.deleteWorkspace = deleteWorkspace;
