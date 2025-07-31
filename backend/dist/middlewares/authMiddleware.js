"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const appconfig_1 = require("../config/appconfig");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // removes "Bearer "
    console.log("🔐 Received token:", token); // For debugging
    if (!token) {
        return res.status(401).json({ message: 'Token missing' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, appconfig_1.config.jwt.secret);
        if (!decoded || typeof decoded !== 'object') {
            return res.status(403).json({ message: 'Invalid token structure' });
        }
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };
        console.log("✅ Token valid, user decoded:", req.user);
        console.log("Decoded token payload:", decoded);
        next();
    }
    catch (err) {
        console.log("❌ Token verification error:", err);
        return res.status(403).json({ message: 'Invalid token' });
    }
};
exports.authenticateToken = authenticateToken;
