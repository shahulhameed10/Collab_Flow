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
exports.seedData = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid"); // Make sure to install uuid
const User_1 = __importDefault(require("../models/User"));
const Workspace_1 = __importDefault(require("../models/Workspace"));
const Project_1 = __importDefault(require("../models/Project"));
const Task_1 = __importDefault(require("../models/Task"));
const WorkspaceInvite_1 = __importDefault(require("../models/WorkspaceInvite"));
const seedData = () => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcrypt_1.default.hash('admin123', 10);
    // Create Users
    const users = yield User_1.default.bulkCreate([
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
    ], { returning: true });
    const adminUser = users.find((u) => u.role === 'Admin');
    const developerUser = users.find((u) => u.role === 'Developer');
    if (!adminUser || !developerUser) {
        throw new Error('Admin or Developer user not found after creation.');
    }
    // Create Workspace with ownerId
    const workspace = yield Workspace_1.default.create({
        name: 'CollabFlow Workspace',
        ownerId: adminUser.id,
        brandinglogo: 'https://media.istockphoto.com/id/2157427049/photo/business-men-with-colleague-traders-at-office-monitoring-stocks-data-on-screen-analyzing.jpg?s=1024x1024&w=is&k=20&c=sWVeJTALML-OtTsm4AuD_iBn-2ngGCf4ZxX3fgUzFh4='
    });
    // Create Project
    const project = yield Project_1.default.create({
        name: 'CollabFlow Project',
        description: 'Test project',
        workspaceId: workspace.id,
    });
    // Create Task
    yield Task_1.default.create({
        name: 'Sample Task',
        status: 'pending',
        priority: 'high',
        dueDate: new Date(),
        assignedTo: developerUser.id,
        projectId: project.id,
    });
    // ✅ Add WorkspaceInvite
    yield WorkspaceInvite_1.default.create({
        email: 'inviteduser@example.com',
        workspaceId: workspace.id,
        role: 'Member',
        token: (0, uuid_1.v4)(),
        accepted: false,
    });
    console.log('✅ Seeding completed');
});
exports.seedData = seedData;
