import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StudentDashboard from '@/components/StudentDashboard';
import { Navigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect admin users to admin dashboard
  if (profile?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // Redirect instructor users to instructor dashboard (when created)
  if (profile?.role === 'instructor') {
    return <Navigate to="/instructor" replace />;
  }

  // Default to student dashboard
  return <StudentDashboard />;
};

export default Dashboard;
