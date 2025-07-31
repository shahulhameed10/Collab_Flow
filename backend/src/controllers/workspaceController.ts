import { Request, Response } from "express";
import Workspace from "../models/Workspace";
import { AuthRequest } from "../types/AuthRequest";
import { sendInvitationEmail } from "../utils/mailer";
import redis from "../utils/redisClient";
import WorkspaceInvite from "../models/WorkspaceInvite";

// ✅ Create Workspace
export const createWorkspace = async (req: AuthRequest, res: Response) => {
  const { name, brandingLogo, members = [] } = req.body;
  const ownerId = req.user!.id;

  try {
    await redis.del("workspaces:all");

    const workspace = await Workspace.create({ name, ownerId, brandingLogo });

    for (const email of members) {
      try {
        await WorkspaceInvite.create({
          email,
          workspaceId: workspace.id,
          accepted: false,
        });

        await sendInvitationEmail(email, workspace.name, req.user!.email);
        console.log(`📨 Invitation sent to ${email}`);
      } catch (err) {
        console.error(`❌ Failed to invite ${email}:`, err);
      }
    }

    res.status(201).json({ message: "Workspace created successfully", workspace });
  } catch (err) {
    console.error("❌ Error creating workspace:", err);
    res.status(500).json({ message: "Workspace creation failed" });
  }
};

// ✅ Get all workspaces (with Redis cache)
export const getAllWorkspaces = async (req: Request, res: Response) => {
  try {
    const cacheKey = "workspaces:all";
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log("🧠 Fetched workspaces from Redis cache");
      return res.json(JSON.parse(cached));
    }

    const workspaces = await Workspace.findAll({
      include: [
        {
          model: WorkspaceInvite,
          as: "invites",
          attributes: ["email", "role", "accepted"],
        },
      ],
    });

    await redis.set(cacheKey, JSON.stringify(workspaces), { EX: 3600 });
    console.log("🐘 Fetched workspaces from DB and stored in Redis");
    res.json(workspaces);
  } catch (err) {
    console.error("❌ Redis Workspace Fetch Error:", err);
    res.status(500).json({ message: "Error fetching workspaces" });
  }
};

// ✅ Update workspace
export const updateWorkspace = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { name, brandingLogo } = req.body;

    console.log("🌐 Attempting to update workspace ID:", id);

    const workspace = await Workspace.findByPk(id);

    if (!workspace) {
      console.warn("❌ Workspace not found in DB for ID:", id);
      return res.status(404).json({ message: "Workspace not found" });
    }

    workspace.name = name;
    workspace.brandingLogo = brandingLogo;

    await workspace.save();
    await redis.del("workspaces:all"); // invalidate cache

    console.log("✅ Workspace updated:", workspace.toJSON());
    res.json({ message: "Workspace updated", workspace });
  } catch (err) {
    console.error("❌ Error updating workspace:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

// ✅ Delete workspace
export const deleteWorkspace = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    console.log("🗑️ Attempting to delete workspace ID:", id);

    const workspace = await Workspace.findByPk(id);
    if (!workspace) {
      console.warn("❌ Workspace not found in DB for ID:", id);
      return res.status(404).json({ message: "Workspace not found" });
    }

    await workspace.destroy();
    await redis.del("workspaces:all"); // invalidate cache

    console.log("🗑️ Workspace deleted:", id);
    res.json({ message: "Workspace deleted" });
  } catch (err) {
    console.error("❌ Error deleting workspace:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};
