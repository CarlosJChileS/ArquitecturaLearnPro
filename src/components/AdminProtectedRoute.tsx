import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // Loading simple y rápido
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Sin usuario = redirect al login
  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }

  // Con usuario = acceso directo (el login ya valida los permisos)
  return <>{children}</>;
};

export default AdminProtectedRoute;
