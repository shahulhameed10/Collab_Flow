import { Response } from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer'; // ✅ Make sure nodemailer is installed
import WorkspaceInvite from '../models/WorkspaceInvite';
import { AuthRequest } from '../types/AuthRequest';
import redis from '../utils/redisClient';

export const inviteMember = async (req: AuthRequest, res: Response) => {
  const { email, role, workspaceId } = req.body;
  const inviterId = req.user?.id;

  if (!email || !role || !workspaceId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const token = crypto.randomBytes(24).toString('hex');

    // Save invite
    await WorkspaceInvite.create({
      email,
      role,
      workspaceId,
      token,
      accepted: false,
    });
    //revalidate the workspace data
    await redis.del("workspaces:all");

    // Prepare email
    const invitationLink = `http://localhost:3000/invite/accept?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
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
  } catch (err) {
    console.error('Invite Error:', err);
    res.status(500).json({ message: 'Failed to send invitation' });
  }
};
