import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
    const { user } = useAuth();

    // If no user, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Otherwise render child routes (Layout + Dashboard)
    return <Outlet />;
};
