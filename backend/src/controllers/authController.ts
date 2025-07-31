import { Response } from 'express';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import User from '../models/User';
import { config } from '../config/appconfig';
import { AuthRequest } from '../types/AuthRequest';

// ✅ User Registration
export const register = async (req: AuthRequest, res: Response) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// ✅ User Login
export const login = async (req: AuthRequest, res: Response) => {
  console.log('Login payload received:', req.body);
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      (process.env.JWT_SECRET || 'secret') as jwt.Secret,
      { expiresIn: '1d' }
    );

    // ✅ Send both token and user info (excluding password)
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role.toLowerCase(),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// ✅ Get Profile
export const getProfile = (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    res.json({ user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Get All Users (Admin only)
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔐 getAllUsers accessed by:', req.user);
    const users = await User.findAll({
      attributes: ['id', 'email', 'role'],
    });
    res.json(users);
  } catch (err) {
    console.error('❌ Failed to fetch users:', err);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// ✅ Update User (Admin only)
// controllers/authController.ts

export const updateUser = async (req: AuthRequest, res: Response) => {
  const userId = req.params.id;
  const { role } = req.body;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('❌ Error updating user:', err);
    return res.status(500).json({ message: 'Server error while updating user' });
  }
};


// ✅ Delete User (Admin only)
export const deleteUser = async (req: AuthRequest, res: Response) => {
  const userId = req.params.id;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();

    return res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting user:', err);
    return res.status(500).json({ message: 'Error deleting user' });
  }
};
