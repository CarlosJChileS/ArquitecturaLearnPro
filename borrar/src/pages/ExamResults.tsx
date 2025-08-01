import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Award, CheckCircle2, XCircle, Download, Share2, RotateCcw } from 'lucide-react';

interface ExamAttempt {
  id: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  completed_at: string;
  time_taken_minutes: number;
  attempt_number: number;
}

interface Certificate {
  id: string;
  certificate_number: string;
  issued_at: string;
}

const ExamResults = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (attemptId && user) {
      loadResults();
    }
  }, [attemptId, user]);

  const loadResults = async () => {
    try {
      // Mock results data - this would connect to real database
      const mockAttempt = {
        id: attemptId || '',
        score: 8,
        max_score: 10,
        percentage: 80,
        passed: true,
        completed_at: new Date().toISOString(),
        time_taken_minutes: 45,
        attempt_number: 1
      };

      setAttempt(mockAttempt);

      // If passed, mock certificate
      if (mockAttempt.passed) {
        const mockCertificate = {
          id: 'cert-123',
          certificate_number: 'CERT-JS-2024-001',
          issued_at: new Date().toISOString()
        };
        
        setCertificate(mockCertificate);
      }
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = () => {
    // This would integrate with a certificate generation service
    console.log('Download certificate:', certificate?.certificate_number);
  };

  const shareCertificate = () => {
    if (certificate) {
      const url = `${window.location.origin}/certificate/${certificate.certificate_number}`;
      navigator.clipboard.writeText(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Resultados no encontrados</h1>
          <p className="text-muted-foreground mb-4">No se pudieron cargar los resultados del examen</p>
          <Button onClick={() => navigate('/dashboard')}>Ir al Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            attempt.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {attempt.passed ? (
              <CheckCircle2 className="h-8 w-8" />
            ) : (
              <XCircle className="h-8 w-8" />
            )}
          </div>
          
          <h1 className="text-3xl font-bold mb-2">
            {attempt.passed ? '¡Felicidades!' : 'Examen Completado'}
          </h1>
          
          <p className="text-muted-foreground text-lg">
            {attempt.passed 
              ? 'Has aprobado el examen exitosamente' 
              : 'No has alcanzado la puntuación mínima'
            }
          </p>
        </div>

        {/* Results Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resultados del Examen</span>
              <Badge variant={attempt.passed ? "default" : "destructive"}>
                {attempt.passed ? 'Aprobado' : 'No Aprobado'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Intento #{attempt.attempt_number} • Completado el {new Date(attempt.completed_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Puntuación obtenida</span>
                <span className="font-medium">{attempt.score}/{attempt.max_score} puntos</span>
              </div>
              <Progress value={attempt.percentage} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{attempt.percentage.toFixed(1)}%</span>
                <span>Mínimo para aprobar: 70%</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{attempt.percentage.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Porcentaje Final</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{attempt.score}</div>
                <div className="text-sm text-muted-foreground">Respuestas Correctas</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{attempt.time_taken_minutes || 0}min</div>
                <div className="text-sm text-muted-foreground">Tiempo Utilizado</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certificate Section */}
        {attempt.passed && certificate && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-500" />
                Certificado de Finalización
              </CardTitle>
              <CardDescription>
                Tu certificado está listo para descargar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg border-2 border-dashed border-primary/20">
                <div className="text-center space-y-4">
                  <div className="text-4xl">🏆</div>
                  <div>
                    <h3 className="font-semibold text-lg">Certificado #{certificate.certificate_number}</h3>
                    <p className="text-muted-foreground">
                      Emitido el {new Date(certificate.issued_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button onClick={downloadCertificate} className="flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar Certificado
                    </Button>
                    <Button variant="outline" onClick={shareCertificate} className="flex items-center">
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartir
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/dashboard">Ir al Dashboard</Link>
          </Button>
          
          {!attempt.passed && (
            <Button variant="outline" className="flex items-center">
              <RotateCcw className="h-4 w-4 mr-2" />
              Intentar de Nuevo
            </Button>
          )}
          
          <Button variant="outline" asChild>
            <Link to="/courses">Ver Más Cursos</Link>
          </Button>
        </div>

        {/* Next Steps */}
        {attempt.passed && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Próximos Pasos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Comparte tu logro</h4>
                  <p className="text-sm text-muted-foreground">
                    Comparte tu certificado en LinkedIn y redes sociales
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Continúa aprendiendo</h4>
                  <p className="text-sm text-muted-foreground">
                    Explora cursos avanzados relacionados con este tema
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ExamResults;