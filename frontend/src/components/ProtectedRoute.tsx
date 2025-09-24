import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('donor' | 'ngo' | 'volunteer')[];
    requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles = [],
    requireAuth = true,
}) => {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Redirect to auth if authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // If no specific roles are required, allow access for any authenticated user
    if (allowedRoles.length === 0) {
        return <>{children}</>;
    }

    // Check if user has required role
    if (user && allowedRoles.includes(user.user_type)) {
        return <>{children}</>;
    }

    // User doesn't have required role - redirect to home
    return <Navigate to="/" replace />;
};

export default ProtectedRoute;