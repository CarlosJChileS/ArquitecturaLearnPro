import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StudentDashboardReal from '@/components/StudentDashboardReal';
import { Navigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, profile, loading } = useAuth();

  // MODO DEMO: Permitir acceso sin autenticación estricta
  if (profile?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <StudentDashboardReal />;
};

export default Dashboard;
