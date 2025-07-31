"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const db_1 = __importDefault(require("./utils/db"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const workspaceRoutes_1 = __importDefault(require("./routes/workspaceRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const taskCommentRoutes_1 = __importDefault(require("./routes/taskCommentRoutes"));
const statsRoutes_1 = __importDefault(require("./routes/statsRoutes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const seed_1 = require("./utils/seed");
const dotenv = __importStar(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
require("./models/Association");
dotenv.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json());
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/workspaces', workspaceRoutes_1.default);
app.use('/api/projects', projectRoutes_1.default);
app.use('/api/tasks', taskRoutes_1.default);
app.use('/api/comments', taskCommentRoutes_1.default);
app.use('/api', statsRoutes_1.default);
// Basic test route
app.get('/', (_req, res) => {
    res.send('🚀 CollabFlow API is running!');
});
// Centralized error handler
app.use(errorHandler_1.errorHandler);
// Create HTTP server and attach Socket.IO
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
// Share io instance across the app
app.locals.io = io;
// Socket.IO Events
io.on('connection', (socket) => {
    console.log('🔗 A user connected');
    socket.on('new-task', (task) => {
        socket.broadcast.emit('task-updated', task);
    });
    socket.on('new-comment', (comment) => {
        socket.broadcast.emit('new-comment', comment);
    });
    socket.on('disconnect', () => {
        console.log('❌ User disconnected');
    });
    socket.on('error', (err) => {
        console.error('Socket error received:', err);
    });
});
// Start server with DB connection
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_1.default.authenticate();
        console.log('🟢 Database connected successfully.');
        // Sync models and seed data (optional in production)
        yield db_1.default.sync({ force: true });
        yield (0, seed_1.seedData)();
        server.listen(PORT, () => {
            console.log(`🚀 Server with Socket.IO running at http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error('❌ Error starting the server:', error);
    }
});
startServer();
