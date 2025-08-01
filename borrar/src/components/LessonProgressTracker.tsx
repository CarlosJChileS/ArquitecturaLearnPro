import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface LessonProgressTrackerProps {
  lessonId: string;
  courseId: string;
  onProgressUpdate?: (progress: number) => void;
}

const LessonProgressTracker: React.FC<LessonProgressTrackerProps> = ({
  lessonId,
  courseId,
  onProgressUpdate
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [watchTime, setWatchTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && lessonId) {
      loadProgress();
    }
  }, [user, lessonId]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Update watch time every 5 seconds when video is playing
      setWatchTime(prev => prev + 5);
      updateProgress(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [lessonId, watchTime]);

  const loadProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('watch_time_seconds, is_completed')
        .eq('user_id', user?.id)
        .eq('lesson_id', lessonId)
        .eq('course_id', courseId)
        .maybeSingle();

      if (data) {
        setWatchTime(data.watch_time_seconds || 0);
        setIsCompleted(data.is_completed || false);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (completed: boolean = false) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('lesson-progress', {
        body: {
          lesson_id: lessonId,
          course_id: courseId,
          watch_time_seconds: watchTime,
          is_completed: completed
        }
      });

      if (error) throw error;

      if (completed && !isCompleted) {
        setIsCompleted(true);
        toast({
          title: "¡Lección completada!",
          description: "Has marcado esta lección como completada. ¡Sigue así!"
        });
        
        if (data?.course_progress) {
          onProgressUpdate?.(data.course_progress);
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const calculateCourseProgress = async (): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('progress_percentage')
        .eq('user_id', user?.id)
        .eq('course_id', courseId)
        .single();

      return data?.progress_percentage || 0;
    } catch (error) {
      console.error('Error calculating course progress:', error);
      return 0;
    }
  };

  const markAsCompleted = () => {
    updateProgress(true);
  };

  if (loading) {
    return null;
  }

  return (
    <div className="hidden">
      {/* This component works in the background to track progress */}
      {/* It could expose functions or state to parent components */}
    </div>
  );
};

// Helper hook for lesson progress
export const useLessonProgress = (lessonId: string, courseId: string) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState({
    watchTime: 0,
    isCompleted: false,
    loading: true
  });

  useEffect(() => {
    if (user && lessonId) {
      loadProgress();
    }
  }, [user, lessonId]);

  const loadProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('watch_time_seconds, is_completed')
        .eq('user_id', user?.id)
        .eq('lesson_id', lessonId)
        .eq('course_id', courseId)
        .maybeSingle();

      setProgress({
        watchTime: data?.watch_time_seconds || 0,
        isCompleted: data?.is_completed || false,
        loading: false
      });
    } catch (error) {
      console.error('Error loading progress:', error);
      setProgress(prev => ({ ...prev, loading: false }));
    }
  };

  const markCompleted = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.functions.invoke('lesson-progress', {
        body: {
          lesson_id: lessonId,
          course_id: courseId,
          watch_time_seconds: progress.watchTime,
          is_completed: true
        }
      });

      if (error) throw error;
      
      setProgress(prev => ({ ...prev, isCompleted: true }));
      return true;
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      return false;
    }
  };

  const updateWatchTime = async (seconds: number) => {
    if (!user) return;

    try {
      const { error } = await supabase.functions.invoke('lesson-progress', {
        body: {
          lesson_id: lessonId,
          course_id: courseId,
          watch_time_seconds: seconds,
          is_completed: progress.isCompleted
        }
      });

      if (error) throw error;
      
      setProgress(prev => ({ ...prev, watchTime: seconds }));
    } catch (error) {
      console.error('Error updating watch time:', error);
    }
  };

  return {
    ...progress,
    markCompleted,
    updateWatchTime
  };
};

export default LessonProgressTracker;