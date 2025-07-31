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
exports.getComments = exports.addComment = void 0;
const Taskcomment_1 = __importDefault(require("../models/Taskcomment"));
const Task_1 = __importDefault(require("../models/Task"));
const User_1 = __importDefault(require("../models/User"));
// Add Comment to Task
const addComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { taskId } = req.params;
    const { content } = req.body;
    const task = yield Task_1.default.findByPk(taskId);
    if (!task)
        return res.status(404).json({ message: 'Task not found' });
    const comment = yield Taskcomment_1.default.create({
        content,
        taskId: Number(taskId),
        userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id
    });
    const populatedComment = yield Taskcomment_1.default.findByPk(comment.id, {
        include: [{
                model: User_1.default,
                as: 'author',
                attributes: ['id', 'email']
            }]
    });
    // Emit socket event to all clients (except sender)
    req.app.locals.io.emit('new-comment', populatedComment);
    res.status(201).json(populatedComment);
});
exports.addComment = addComment;
// Get Comments
const getComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId } = req.params;
    const comments = yield Taskcomment_1.default.findAll({
        where: { taskId: Number(taskId) },
        include: [{
                model: User_1.default,
                as: 'author',
                attributes: ['id', 'email']
            }],
        order: [['createdAt', 'DESC']],
        limit: 5
    });
    res.json(comments);
});
exports.getComments = getComments;
