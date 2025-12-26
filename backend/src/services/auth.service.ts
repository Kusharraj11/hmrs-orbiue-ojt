import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../middlewares/error/AppError';

export class AuthService {
    // Generate Token
    private generateToken(payload: { id: string; role: string; email: string }) {
        return jwt.sign(payload, process.env.JWT_SECRET || 'secret_key_123', { expiresIn: '1d' });
    }

    // Login
    async login(email: string, pass: string) {
        console.log(`[AuthService] Attempting login for: ${email}`);

        const user = await prisma.user.findUnique({
            where: { email },
            include: { employee: true }
        });

        if (!user) {
            console.log(`[AuthService] User not found: ${email}`);
            throw new AppError('Invalid credentials', 401);
        }

        console.log(`[AuthService] User found. ID: ${user.id}, Role: ${user.role}`);
        // console.log(`[AuthService] Stored Hash: ${user.password}`); // CAUTION: Don't log in prod, but helpful for debug logic verification
        // console.log(`[AuthService] Incoming Password: ${pass}`);

        const isMatch = await bcrypt.compare(pass, user.password);
        console.log(`[AuthService] Password Match Result: ${isMatch}`);

        if (!isMatch) {
            console.log(`[AuthService] Password mismatch for: ${email}`);
            throw new AppError('Invalid credentials', 401);
        }

        const token = this.generateToken({
            id: user.id,
            role: user.role,
            email: user.email
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                employeeId: user.employee?.id
            },
            token
        };
    }
}
