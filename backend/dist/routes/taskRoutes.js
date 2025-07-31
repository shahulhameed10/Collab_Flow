"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taskController_1 = require("../controllers/taskController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const roles_1 = require("../constants/roles");
const router = (0, express_1.Router)();
// Create Task 
router.post('/', authMiddleware_1.authenticateToken, (0, roleMiddleware_1.authorizeRoles)(roles_1.Roles.ADMIN, roles_1.Roles.MANAGER, roles_1.Roles.DEVELOPER), taskController_1.createTask);
// Get All Tasks
router.get('/', authMiddleware_1.authenticateToken, taskController_1.getTasks);
// Update Task 
router.put('/:id', authMiddleware_1.authenticateToken, (0, roleMiddleware_1.authorizeRoles)(roles_1.Roles.ADMIN, roles_1.Roles.MANAGER, roles_1.Roles.DEVELOPER), taskController_1.updateTask);
// Delete Task 
router.delete('/:id', authMiddleware_1.authenticateToken, (0, roleMiddleware_1.authorizeRoles)(roles_1.Roles.ADMIN, roles_1.Roles.MANAGER), taskController_1.deleteTask);
// Update status
router.put('/:id/status', taskController_1.updateTask);
exports.default = router;
