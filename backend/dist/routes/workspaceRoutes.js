"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workspaceController_1 = require("../controllers/workspaceController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const roles_1 = require("../constants/roles");
const router = (0, express_1.Router)();
//create a new workspace
router.post('/', authMiddleware_1.authenticateToken, (0, roleMiddleware_1.authorizeRoles)(roles_1.Roles.ADMIN, roles_1.Roles.OWNER), workspaceController_1.createWorkspace);
// get all workspace
router.get('/', authMiddleware_1.authenticateToken, workspaceController_1.getAllWorkspaces);
//update workspace
router.put('/:id', authMiddleware_1.authenticateToken, (0, roleMiddleware_1.authorizeRoles)(roles_1.Roles.ADMIN, roles_1.Roles.OWNER), workspaceController_1.updateWorkspace);
// Only Admin can delete a workspace
router.delete('/:id', authMiddleware_1.authenticateToken, (0, roleMiddleware_1.authorizeRoles)(roles_1.Roles.ADMIN, roles_1.Roles.OWNER), workspaceController_1.deleteWorkspace);
exports.default = router;
