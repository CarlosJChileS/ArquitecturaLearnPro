import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Lock, Play, User } from 'lucide-react';

interface CourseEnrollmentProps {
  courseId: string;
  coursePrice?: number;
  isPublished?: boolean;
  onEnrollmentChange?: (enrolled: boolean) => void;
}

const CourseEnrollment: React.FC<CourseEnrollmentProps> = ({ 
  courseId, 
  coursePrice = 0, 
  isPublished = true,
  onEnrollmentChange 
}) => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { toast } = useToast();
  
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && courseId) {
      checkEnrollment();
    }
  }, [user, courseId]);

  const checkEnrollment = async () => {
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('id')
        .eq('user_id', user?.id)
        .eq('course_id', courseId)
        .single();

      const enrolled = !error && !!data;
      setIsEnrolled(enrolled);
      onEnrollmentChange?.(enrolled);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollment = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para inscribirte al curso",
        variant: "destructive"
      });
      return;
    }

    if (!isPublished) {
      toast({
        title: "Curso no disponible",
        description: "Este curso aún no está publicado",
        variant: "destructive"
      });
      return;
    }

    // Check if course is paid and user has subscription
    if (coursePrice > 0 && !subscription.subscribed) {
      toast({
        title: "Suscripción requerida",
        description: "Este curso requiere una suscripción activa",
        variant: "destructive"
      });
      return;
    }

    setIsEnrolling(true);

    try {
      const { data, error } = await supabase.functions.invoke('course-enrollment', {
        body: { course_id: courseId }
      });

      if (error) throw error;
      
      setIsEnrolled(true);
      onEnrollmentChange?.(true);
      
      toast({
        title: "¡Inscripción exitosa!",
        description: "Ya puedes comenzar a estudiar este curso",
      });
    } catch (error: any) {
      console.error('Error enrolling:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo completar la inscripción",
        variant: "destructive"
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  if (loading) {
    return (
      <Button disabled className="w-full">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Verificando...
      </Button>
    );
  }

  if (!user) {
    return (
      <Button onClick={() => window.location.href = '/login'} className="w-full">
        <User className="h-4 w-4 mr-2" />
        Inicia sesión para inscribirte
      </Button>
    );
  }

  if (isEnrolled) {
    return (
      <Button disabled className="w-full bg-green-600 hover:bg-green-700">
        <CheckCircle className="h-4 w-4 mr-2" />
        Inscrito - Comenzar curso
      </Button>
    );
  }

  // Check if user can enroll based on course type and subscription
  const canEnroll = coursePrice === 0 || subscription.subscribed;

  if (!canEnroll) {
    return (
      <Button 
        onClick={() => window.location.href = '/subscription'} 
        variant="outline" 
        className="w-full"
      >
        <Lock className="h-4 w-4 mr-2" />
        Suscríbete para acceder
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleEnrollment} 
      disabled={isEnrolling || !isPublished} 
      className="w-full"
    >
      {isEnrolling ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Inscribiendo...
        </>
      ) : (
        <>
          <Play className="h-4 w-4 mr-2" />
          {coursePrice > 0 ? 'Inscribirse al curso' : 'Inscribirse gratis'}
        </>
      )}
    </Button>
  );
};

export default CourseEnrollment;