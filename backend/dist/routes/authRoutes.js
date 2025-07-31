"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const roles_1 = require("../constants/roles");
const router = (0, express_1.Router)();
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
router.get('/profile', authMiddleware_1.authenticateToken, authController_1.getProfile);
router.get('/users', authMiddleware_1.authenticateToken, authController_1.getAllUsers);
router.put('/users/:id', authMiddleware_1.authenticateToken, (0, roleMiddleware_1.authorizeRoles)(roles_1.Roles.ADMIN), authController_1.updateUser);
router.delete('/users/:id', authMiddleware_1.authenticateToken, (0, roleMiddleware_1.authorizeRoles)(roles_1.Roles.ADMIN), authController_1.deleteUser);
// Admin-only user management route 
router.get('/admin/users', authMiddleware_1.authenticateToken, (0, roleMiddleware_1.authorizeRoles)(roles_1.Roles.ADMIN), (req, res) => {
    res.json({ message: 'Admin-only user management route' });
});
exports.default = router;
