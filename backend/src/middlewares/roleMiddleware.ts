import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/AuthRequest';
import { Roles } from '../constants/roles';

//authorise the user based on role
export const authorizeRoles = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: Access denied' });
        }

        next();//if the user is allowed next func() call.
    };
};