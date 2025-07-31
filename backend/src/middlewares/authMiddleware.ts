import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../config/appconfig';
import { AuthRequest } from '../types/AuthRequest';

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // removes "Bearer "

  console.log("🔐 Received token:", token); // For debugging

  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

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
  } catch (err) {
    console.log("❌ Token verification error:", err);
    return res.status(403).json({ message: 'Invalid token' });
  }
};
