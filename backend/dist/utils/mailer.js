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
exports.sendInvitationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const sendInvitationEmail = (to, workspaceName, invitedBy) => __awaiter(void 0, void 0, void 0, function* () {
    const info = yield transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: `You're invited to join ${workspaceName}`,
        html: `
      <p>Hello,</p>
      <p><strong>${invitedBy}</strong> has invited you to join the workspace <strong>${workspaceName}</strong>.</p>
      <p><a href="http://localhost:5173/login">Click here to join</a></p>
    `,
    });
    console.log("✅ Email sent:", info.messageId);
});
exports.sendInvitationEmail = sendInvitationEmail;
