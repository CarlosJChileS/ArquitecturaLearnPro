import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { edgeFunctions } from '@/integrations/supabase/edgeFunctions';

interface UseEdgeFunctionOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

// Create a type for the service methods
type ServiceMethod = (...args: any[]) => Promise<any>;

// Helper function to get nested method from service object
const getServiceMethod = (serviceName: keyof typeof edgeFunctions, methodName: string): ServiceMethod => {
  const service = edgeFunctions[serviceName] as any;
  const method = service?.[methodName];
  if (!method) {
    throw new Error(`Método ${methodName} no existe en el servicio ${serviceName}`);
  }
  return method as ServiceMethod;
};

export const useEdgeFunction = (
  serviceName: keyof typeof edgeFunctions,
  methodName: string,
  options: UseEdgeFunctionOptions = {}
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const { session } = useAuth();
  const { toast } = useToast();

  const {
    onSuccess,
    onError,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operación completada exitosamente',
    errorMessage = 'Ocurrió un error al procesar la solicitud'
  } = options;

  const execute = useCallback(async (...args: any[]) => {
    if (!session) {
      const authError = new Error('No hay sesión activa');
      setError(authError);
      if (showErrorToast) {
        toast({
          title: "Error de autenticación",
          description: "Debes iniciar sesión para realizar esta acción",
          variant: "destructive",
        });
      }
      onError?.(authError);
      return { error: authError, data: null };
    }

    setLoading(true);
    setError(null);

    try {
      const method = getServiceMethod(serviceName, methodName);
      const result = await method(...args);
      
      setData(result);
      
      if (showSuccessToast) {
        toast({
          title: "Éxito",
          description: successMessage,
        });
      }
      
      onSuccess?.(result);
      return { data: result, error: null };
    } catch (err: any) {
      setError(err);
      
      if (showErrorToast) {
        toast({
          title: "Error",
          description: err.message || errorMessage,
          variant: "destructive",
        });
      }
      
      onError?.(err);
      return { error: err, data: null };
    } finally {
      setLoading(false);
    }
  }, [session, serviceName, methodName, onSuccess, onError, showSuccessToast, showErrorToast, successMessage, errorMessage, toast]);

  const reset = useCallback(() => {
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    loading,
    error,
    data,
    reset
  };
};

// Specific hooks for common operations
export const useCreateCheckout = (options?: UseEdgeFunctionOptions) => {
  return useEdgeFunction('payment', 'createStripeCheckout', {
    showSuccessToast: true,
    successMessage: 'Redirigiendo al checkout...',
    ...options
  });
};

export const useStripePayment = (options?: UseEdgeFunctionOptions) => {
  return useEdgeFunction('payment', 'processStripePayment', {
    showSuccessToast: true,
    successMessage: 'Procesando pago...',
    ...options
  });
};

export const useCreateCheckoutSession = (options?: UseEdgeFunctionOptions) => {
  return useEdgeFunction('payment', 'createCheckout', {
    showSuccessToast: true,
    successMessage: 'Creando sesión de checkout...',
    ...options
  });
};

export const useEnrollInCourse = (options?: UseEdgeFunctionOptions) => {
  return useEdgeFunction('course', 'enrollInCourse', {
    showSuccessToast: true,
    successMessage: 'Te has inscrito exitosamente al curso',
    ...options
  });
};

export const useCreateCourse = (options?: UseEdgeFunctionOptions) => {
  return useEdgeFunction('admin', 'createCourse', {
    showSuccessToast: true,
    successMessage: 'Curso creado exitosamente',
    ...options
  });
};

export const useUpdateCourse = (options?: UseEdgeFunctionOptions) => {
  return useEdgeFunction('admin', 'updateCourse', {
    showSuccessToast: true,
    successMessage: 'Curso actualizado exitosamente',
    ...options
  });
};

export const useDeleteCourse = (options?: UseEdgeFunctionOptions) => {
  return useEdgeFunction('admin', 'deleteCourse', {
    showSuccessToast: true,
    successMessage: 'Curso eliminado exitosamente',
    ...options
  });
};

export const useCreateUser = (options?: UseEdgeFunctionOptions) => {
  return useEdgeFunction('admin', 'createUser', {
    showSuccessToast: true,
    successMessage: 'Usuario creado exitosamente',
    ...options
  });
};

export const useUpdateUser = (options?: UseEdgeFunctionOptions) => {
  return useEdgeFunction('admin', 'updateUser', {
    showSuccessToast: true,
    successMessage: 'Usuario actualizado exitosamente',
    ...options
  });
};

export const useDeleteUser = (options?: UseEdgeFunctionOptions) => {
  return useEdgeFunction('admin', 'deleteUser', {
    showSuccessToast: true,
    successMessage: 'Usuario eliminado exitosamente',
    ...options
  });
};

export const useSendNotification = (options?: UseEdgeFunctionOptions) => {
  return useEdgeFunction('notification', 'sendNotification', {
    showSuccessToast: true,
    successMessage: 'Notificación enviada exitosamente',
    ...options
  });
};

export const useSendNotifications = (options?: UseEdgeFunctionOptions) => {
  return useEdgeFunction('notification', 'sendNotifications', {
    showSuccessToast: true,
    successMessage: 'Notificaciones enviadas',
    ...options
  });
};

export const useSendNotificationEmail = (options?: UseEdgeFunctionOptions) => {
  return useEdgeFunction('notification', 'sendNotificationEmail', {
    showSuccessToast: true,
    successMessage: 'Email enviado correctamente',
    ...options
  });
};

export const useSendCourseReminder = (options?: UseEdgeFunctionOptions) => {
  return useEdgeFunction('notification', 'sendCourseReminder', {
    showSuccessToast: true,
    successMessage: 'Recordatorio enviado',
    ...options
  });
};

export const useSendCourseReminders = (options?: UseEdgeFunctionOptions) => {
  return useEdgeFunction('notification', 'sendCourseReminders', {
    showSuccessToast: true,
    successMessage: 'Recordatorios procesados',
    ...options
  });
};

export const useCourseAnalytics = (options?: UseEdgeFunctionOptions) => {
  return useEdgeFunction('dashboard', 'courseAnalytics', {
    showSuccessToast: false,
    showErrorToast: true,
    ...options
  });
};

export const useGenerateCertificate = (options?: UseEdgeFunctionOptions) => {
  return useEdgeFunction('certificate', 'generateCertificate', {
    showSuccessToast: true,
    successMessage: 'Certificado generado exitosamente',
    ...options
  });
};

export const useUploadFile = (options?: UseEdgeFunctionOptions) => {
  return useEdgeFunction('file', 'uploadFile', {
    showSuccessToast: true,
    successMessage: 'Archivo subido exitosamente',
    ...options
  });
};

export const useDeleteFile = (options?: UseEdgeFunctionOptions) => {
  return useEdgeFunction('file', 'deleteFile', {
    showSuccessToast: true,
    successMessage: 'Archivo eliminado exitosamente',
    ...options
  });
};
