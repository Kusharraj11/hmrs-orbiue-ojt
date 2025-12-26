import { createContext, useContext, useState, type ReactNode } from 'react';

// For MVP, we will simulate a user session.
// In a real app, this would handle JWT tokens and Login API.
// We will store an "activeEmployeeId" to use for "My Leave" / "My Attendance" features.

interface AuthContextType {
    user: User | null;
    login: (email: string, pass: string) => Promise<boolean>;
    logout: () => void;
    activeEmployeeId: string | null;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProviderWait = ({ children }: { children: ReactNode }) => {
    // Basic Persistence
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

    const login = async (email: string, pass: string) => {
        try {
            // Updated to use Real API
            // Note: client.ts uses relative path /api or absolute? BaseURL is http://localhost:3000/api
            const res = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pass })
            });

            if (!res.ok) throw new Error('Login failed');

            const data = await res.json();
            const userData = data.data.user; // { id, email, role, employeeId }

            const newUser = {
                id: userData.employeeId || userData.id, // Prefer EmployeeID for logic
                userId: userData.id,
                name: userData.email.split('@')[0],
                email: userData.email,
                role: userData.role
            };

            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, activeEmployeeId: user?.id || null }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
