"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taskComment_1 = require("../controllers/taskComment");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post('/:taskId', authMiddleware_1.authenticateToken, taskComment_1.addComment);
router.get('/:taskId', authMiddleware_1.authenticateToken, taskComment_1.getComments);
exports.default = router;
