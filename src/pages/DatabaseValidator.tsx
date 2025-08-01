import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Database, RefreshCw, Trash2, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import databaseUtils from '@/lib/database-utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface DatabaseStatus {
  aligned: boolean;
  issues: string[];
  loading: boolean;
  lastCheck: Date | null;
}

const DatabaseValidator: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [dbStatus, setDbStatus] = useState<DatabaseStatus>({
    aligned: false,
    issues: [],
    loading: false,
    lastCheck: null
  });
  const [operations, setOperations] = useState({
    verifying: false,
    creatingTest: false,
    cleaningTest: false
  });

  // Verificar si el usuario es admin
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      checkDatabaseStructure();
    }
  }, [isAdmin]);

  const checkDatabaseStructure = async () => {
    if (!isAdmin) return;

    setDbStatus(prev => ({ ...prev, loading: true }));
    setOperations(prev => ({ ...prev, verifying: true }));

    try {
      const result = await databaseUtils.verifyDatabaseStructure();
      setDbStatus({
        aligned: result.aligned,
        issues: result.issues,
        loading: false,
        lastCheck: new Date()
      });

      if (result.aligned) {
        toast({
          title: "✅ Base de datos alineada",
          description: "La estructura de la base de datos está correctamente alineada con el frontend",
        });
      } else {
        toast({
          title: "⚠️ Problemas encontrados",
          description: `Se encontraron ${result.issues.length} problema(s) en la estructura`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error verificando base de datos",
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: "destructive"
      });
    } finally {
      setOperations(prev => ({ ...prev, verifying: false }));
    }
  };

  const createTestData = async () => {
    setOperations(prev => ({ ...prev, creatingTest: true }));

    try {
      const result = await databaseUtils.createTestData();
      
      if (result.success) {
        toast({
          title: "✅ Datos de prueba creados",
          description: result.message,
        });
        // Re-verificar después de crear datos
        setTimeout(checkDatabaseStructure, 1000);
      } else {
        toast({
          title: "❌ Error creando datos de prueba",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error inesperado",
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: "destructive"
      });
    } finally {
      setOperations(prev => ({ ...prev, creatingTest: false }));
    }
  };

  const cleanTestData = async () => {
    setOperations(prev => ({ ...prev, cleaningTest: true }));

    try {
      const result = await databaseUtils.cleanTestData();
      
      if (result.success) {
        toast({
          title: "🧹 Datos de prueba eliminados",
          description: result.message,
        });
      } else {
        toast({
          title: "❌ Error eliminando datos de prueba",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error inesperado",
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: "destructive"
      });
    } finally {
      setOperations(prev => ({ ...prev, cleaningTest: false }));
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Solo los administradores pueden acceder a esta herramienta de validación de base de datos.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Validador de Base de Datos</h1>
        <p className="text-muted-foreground">
          Herramienta para verificar y corregir la alineación entre la base de datos y el frontend
        </p>
      </div>

      {/* Estado de la Base de Datos */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Estado de la Base de Datos
            {dbStatus.aligned ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Alineada
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Problemas
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {dbStatus.lastCheck 
              ? `Última verificación: ${dbStatus.lastCheck.toLocaleString()}`
              : 'No se ha verificado aún'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-4">
            <Button 
              onClick={checkDatabaseStructure}
              disabled={operations.verifying}
              variant="outline"
            >
              {operations.verifying ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Verificar Estructura
            </Button>
          </div>

          {/* Problemas encontrados */}
          {dbStatus.issues.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-destructive mb-2">
                Problemas encontrados ({dbStatus.issues.length}):
              </h4>
              {dbStatus.issues.map((issue, index) => (
                <Alert key={index} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{issue}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Estado OK */}
          {dbStatus.aligned && dbStatus.issues.length === 0 && dbStatus.lastCheck && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ✅ La estructura de la base de datos está correctamente alineada con el frontend.
                Todas las foreign keys y tablas están configuradas según la especificación.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Herramientas de Prueba */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Herramientas de Prueba
          </CardTitle>
          <CardDescription>
            Crear y limpiar datos de prueba para verificar el correcto funcionamiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={createTestData}
              disabled={operations.creatingTest}
              variant="default"
            >
              {operations.creatingTest ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4 mr-2" />
              )}
              Crear Datos de Prueba
            </Button>

            <Button 
              onClick={cleanTestData}
              disabled={operations.cleaningTest}
              variant="outline"
            >
              {operations.cleaningTest ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Limpiar Datos de Prueba
            </Button>
          </div>

          <Separator className="my-4" />

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Para aplicar las correcciones de base de datos, ejecuta el archivo 
              <code className="mx-1 px-2 py-1 bg-muted rounded">fix-database-alignment.sql</code> 
              en el SQL Editor de Supabase. Este archivo se ha generado en la raíz del proyecto.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Estructura Esperada */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Estructura de Foreign Keys Esperada</CardTitle>
          <CardDescription>
            Esta es la estructura que debe tener la base de datos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
            <div>
              <h4 className="font-semibold mb-2">course_enrollments</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>→ course_id → courses(id)</li>
                <li>→ user_id → profiles(user_id)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">lesson_progress</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>→ course_id → courses(id)</li>
                <li>→ lesson_id → lessons(id)</li>  
                <li>→ user_id → profiles(user_id)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">courses</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>→ category_id → categories(id)</li>
                <li>→ instructor_id → profiles(user_id)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">lessons</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>→ course_id → courses(id)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseValidator;
