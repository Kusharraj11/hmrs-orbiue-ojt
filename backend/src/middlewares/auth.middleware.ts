import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../middlewares/error/AppError';

interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
        email: string;
    };
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('You are not logged in', 401));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_123') as any;

        // Attach user to request
        (req as AuthRequest).user = {
            id: decoded.id,
            role: decoded.role,
            email: decoded.email
        };

        next();
    } catch (error) {
        return next(new AppError('Invalid token', 401));
    }
};

export const authorize = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as AuthRequest).user;
        if (!user || !roles.includes(user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
