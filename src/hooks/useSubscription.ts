import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-mvp';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionAccess {
  hasAccess: boolean;
  reason: string;
  requiresUpgrade?: boolean;
  subscription?: {
    planName: string;
    status: string;
    expiresAt: string;
  };
  course?: {
    title: string;
    tier: string;
  };
}

interface StudentProgress {
  overview: {
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    totalLessons: number;
    completedLessons: number;
    completionRate: number;
    totalWatchTimeHours: number;
  };
  subscription: {
    planName: string;
    status: string;
    expiresAt: string;
    daysRemaining: number;
  } | null;
  enrollments: Array<{
    id: string;
    courseId: string;
    title: string;
    instructor: string;
    thumbnail: string;
    progress: number;
    status: string;
    enrolledAt: string;
    completedAt?: string;
  }>;
  recentActivity: Array<{
    type: string;
    lessonTitle: string;
    courseTitle: string;
    progress: number;
    completed: boolean;
    timestamp: string;
  }>;
  achievements: Array<{
    name: string;
    description: string;
  }>;
  recommendations: Array<{
    courseId: string;
    title: string;
    instructor: string;
    reason: string;
  }>;
}

export const useSubscriptionAccess = () => {
  const { user } = useAuth();
  
  const checkAccess = async (courseId: string): Promise<SubscriptionAccess> => {
    if (!user) {
      return {
        hasAccess: false,
        reason: 'User not authenticated',
        requiresUpgrade: true
      };
    }

    try {
      const { data, error } = await supabase.functions.invoke('subscription-access', {
        body: {
          userId: user.id,
          courseId
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking subscription access:', error);
      return {
        hasAccess: false,
        reason: 'Error checking access',
        requiresUpgrade: true
      };
    }
  };

  return { checkAccess };
};

export const useStudentProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProgress = async () => {
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('student-progress', {
        body: { userId: user.id }
      });

      if (error) throw error;
      setProgress(data);
      setError(null);
    } catch (err) {
      console.error('Error loading student progress:', err);
      setError(err instanceof Error ? err.message : 'Error loading progress');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, [user]);

  return {
    progress,
    loading,
    error,
    refresh: loadProgress
  };
};

export const useStripeCheckout = () => {
  const { user } = useAuth();
  
  const createCheckoutSession = async (planId: string, successUrl: string, cancelUrl: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          userId: user.id,
          planId,
          successUrl,
          cancelUrl
        }
      });

      if (error) throw error;
      
      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
      
      return data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  };

  const createCustomerPortal = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: { userId: user.id }
      });

      if (error) throw error;
      
      // Redirect to Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url;
      }
      
      return data;
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      throw error;
    }
  };

  return {
    createCheckoutSession,
    createCustomerPortal
  };
};

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-notifications', {
        method: 'GET',
        body: { userId: user.id }
      });

      if (!error && data?.data) {
        setNotifications(data.data);
        setUnreadCount(data.data.filter((n: any) => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase.functions.invoke('admin-notifications', {
        method: 'PUT',
        body: { notificationId, is_read: true }
      });
      await loadNotifications(); // Refresh
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  return {
    notifications,
    unreadCount,
    loadNotifications,
    markAsRead
  };
};
