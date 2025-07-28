import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StudentDashboard from '@/components/StudentDashboard';
import { Navigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Default to student dashboard - sin verificar role
  return <StudentDashboard />;
};

export default Dashboard;
