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
exports.inviteMember = void 0;
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer")); // ✅ Make sure nodemailer is installed
const WorkspaceInvite_1 = __importDefault(require("../models/WorkspaceInvite"));
const redisClient_1 = __importDefault(require("../utils/redisClient"));
const inviteMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { email, role, workspaceId } = req.body;
    const inviterId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!email || !role || !workspaceId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        const token = crypto_1.default.randomBytes(24).toString('hex');
        // Save invite
        yield WorkspaceInvite_1.default.create({
            email,
            role,
            workspaceId,
            token,
            accepted: false,
        });
        //revalidate the workspace data
        yield redisClient_1.default.del("workspaces:all");
        // Prepare email
        const invitationLink = `http://localhost:3000/invite/accept?token=${token}`;
        const transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        yield transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Workspace Invitation - CollabFlow',
            html: `
        <p>Hello,</p>
        <p>You have been invited to join workspace <strong>${workspaceId}</strong> as <strong>${role}</strong>.</p>
        <p>Click <a href="${invitationLink}">here</a> to accept the invitation.</p>
      `,
        });
        res.status(200).json({ message: 'Invitation sent successfully' });
    }
    catch (err) {
        console.error('Invite Error:', err);
        res.status(500).json({ message: 'Failed to send invitation' });
    }
});
exports.inviteMember = inviteMember;
