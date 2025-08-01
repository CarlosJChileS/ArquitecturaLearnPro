import React, { useState, useEffect } from 'react';
import { useSubscriptionAccess } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Star, Clock } from 'lucide-react';

interface ProtectedCourseProps {
  courseId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedCourse: React.FC<ProtectedCourseProps> = ({ 
  courseId, 
  children, 
  fallback 
}) => {
  // MODO DEMO: Permitir acceso completo a todos los cursos sin restricciones
  console.log(`ProtectedCourse: Permitiendo acceso completo al curso ${courseId}`);
  
  // Devolver directamente el contenido sin verificaciones
  return <>{children}</>;
};

interface SubscriptionTierBadgeProps {
  tier: 'free' | 'basic' | 'premium';
  className?: string;
}

export const SubscriptionTierBadge: React.FC<SubscriptionTierBadgeProps> = ({ 
  tier, 
  className = '' 
}) => {
  const tierConfig = {
    free: {
      label: 'Gratuito',
      icon: <Clock className="w-3 h-3" />,
      variant: 'secondary' as const,
      className: 'bg-gray-100 text-gray-800'
    },
    basic: {
      label: 'Básico',
      icon: <Star className="w-3 h-3" />,
      variant: 'default' as const,
      className: 'bg-blue-100 text-blue-800'
    },
    premium: {
      label: 'Premium',
      icon: <Crown className="w-3 h-3" />,
      variant: 'default' as const,
      className: 'bg-yellow-100 text-yellow-800'
    }
  };

  const config = tierConfig[tier];

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${className}`}
    >
      {config.icon}
      <span className="ml-1">{config.label}</span>
    </Badge>
  );
};
