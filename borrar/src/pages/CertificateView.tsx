import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Award, Download, Share2, CheckCircle, Calendar, User } from 'lucide-react';

interface Certificate {
  id: string;
  certificate_number: string;
  issued_at: string;
  score: number;
  user_id: string;
  course_id: string;
  profiles: {
    full_name: string;
  };
  courses: {
    title: string;
    instructor_id: string;
  };
}

const CertificateView = () => {
  const { certificateNumber } = useParams();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (certificateNumber) {
      loadCertificate();
    }
  }, [certificateNumber]);

  const loadCertificate = async () => {
    try {
      // Mock certificate data - this would connect to real database
      const mockCertificate = {
        id: 'cert-123',
        certificate_number: certificateNumber || '',
        issued_at: new Date().toISOString(),
        score: 85,
        user_id: 'user-123',
        course_id: 'course-123',
        profiles: {
          full_name: 'Juan Pérez'
        },
        courses: {
          title: 'JavaScript Moderno: ES6+',
          instructor_id: 'instructor-123'
        }
      };

      setCertificate(mockCertificate);
    } catch (error) {
      console.error('Error loading certificate:', error);
      setError('Error al cargar el certificado');
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = () => {
    window.print();
  };

  const shareCertificate = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando certificado...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Certificado no encontrado</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header Controls */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <div>
            <h1 className="text-2xl font-bold">Certificado de Finalización</h1>
            <p className="text-muted-foreground">#{certificate.certificate_number}</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={shareCertificate}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
            <Button onClick={downloadCertificate}>
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
          </div>
        </div>

        {/* Certificate */}
        <Card className="max-w-4xl mx-auto bg-gradient-to-br from-background to-muted/30 border-2">
          <CardContent className="p-12">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
                <Award className="h-12 w-12 text-primary" />
              </div>
              
              <h1 className="text-4xl font-bold text-primary mb-2">
                Certificado de Finalización
              </h1>
              
              <p className="text-muted-foreground text-lg">
                Este certificado verifica la finalización exitosa del curso
              </p>
            </div>

            {/* Main Content */}
            <div className="text-center space-y-8">
              <div>
                <p className="text-lg text-muted-foreground mb-2">Se otorga a</p>
                <h2 className="text-3xl font-bold text-foreground">
                  {certificate.profiles?.full_name || 'Estudiante'}
                </h2>
              </div>

              <div>
                <p className="text-lg text-muted-foreground mb-2">Por completar exitosamente</p>
                <h3 className="text-2xl font-semibold text-primary">
                  {certificate.courses?.title}
                </h3>
              </div>

              {/* Score Badge */}
              <div className="flex justify-center">
                <Badge variant="outline" className="text-lg px-6 py-2">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  Puntuación: {certificate.score}%
                </Badge>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-border">
              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    Emitido el {new Date(certificate.issued_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Certificado #{certificate.certificate_number}
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <div className="inline-block">
                  <div className="text-lg font-semibold border-t-2 border-primary pt-2">
                    Academia Digital
                  </div>
                  <p className="text-sm text-muted-foreground">Plataforma de Educación en Línea</p>
                </div>
              </div>
            </div>

            {/* Verification Info */}
            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                <span>
                  Este certificado puede ser verificado en línea usando el código: {certificate.certificate_number}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="max-w-2xl mx-auto mt-8 print:hidden">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Sobre este certificado</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-3 text-primary" />
                  <span>Estudiante verificado a través de autenticación segura</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-3 text-primary" />
                  <span>Curso completado con evaluación aprobatoria</span>
                </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-3 text-primary" />
                  <span>Certificado emitido automáticamente tras la aprobación</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CertificateView;