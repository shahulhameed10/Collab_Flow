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
exports.deleteUser = exports.updateUser = exports.getAllUsers = exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
// ✅ User Registration
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, role } = req.body;
    try {
        const existingUser = yield User_1.default.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        yield User_1.default.create({
            name,
            email,
            password: hashedPassword,
            role,
        });
        return res.status(201).json({ message: 'User registered successfully' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.register = register;
// ✅ User Login
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Login payload received:', req.body);
    const { email, password } = req.body;
    try {
        const user = yield User_1.default.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email' });
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, (process.env.JWT_SECRET || 'secret'), { expiresIn: '1d' });
        // ✅ Send both token and user info (excluding password)
        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role.toLowerCase(),
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.login = login;
// ✅ Get Profile
const getProfile = (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        res.json({ user: req.user });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getProfile = getProfile;
// ✅ Get All Users (Admin only)
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('🔐 getAllUsers accessed by:', req.user);
        const users = yield User_1.default.findAll({
            attributes: ['id', 'email', 'role'],
        });
        res.json(users);
    }
    catch (err) {
        console.error('❌ Failed to fetch users:', err);
        res.status(500).json({ message: 'Server error fetching users' });
    }
});
exports.getAllUsers = getAllUsers;
// ✅ Update User (Admin only)
// controllers/authController.ts
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const { role } = req.body;
    try {
        const user = yield User_1.default.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.role = role;
        yield user.save();
        return res.status(200).json({ message: 'User updated successfully' });
    }
    catch (err) {
        console.error('❌ Error updating user:', err);
        return res.status(500).json({ message: 'Server error while updating user' });
    }
});
exports.updateUser = updateUser;
// ✅ Delete User (Admin only)
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    try {
        const user = yield User_1.default.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        yield user.destroy();
        return res.json({ message: 'User deleted successfully' });
    }
    catch (err) {
        console.error('❌ Error deleting user:', err);
        return res.status(500).json({ message: 'Error deleting user' });
    }
});
exports.deleteUser = deleteUser;
