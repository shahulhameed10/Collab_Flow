"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectController_1 = require("../controllers/projectController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const roles_1 = require("../constants/roles");
const router = (0, express_1.Router)();
// Create Project inside a specific workspace
router.post('/', authMiddleware_1.authenticateToken, (0, roleMiddleware_1.authorizeRoles)(roles_1.Roles.ADMIN, roles_1.Roles.OWNER, roles_1.Roles.MANAGER), projectController_1.createProject);
// Get Projects by Workspace ID
router.get('/workspace/:workspaceId', authMiddleware_1.authenticateToken, projectController_1.getProjectsByWorkspace);
// Update Project
router.put('/:id', authMiddleware_1.authenticateToken, (0, roleMiddleware_1.authorizeRoles)(roles_1.Roles.ADMIN, roles_1.Roles.MANAGER), projectController_1.updateProject);
// Delete Project
router.delete('/:id', authMiddleware_1.authenticateToken, (0, roleMiddleware_1.authorizeRoles)(roles_1.Roles.ADMIN), projectController_1.deleteProject);
exports.default = router;
