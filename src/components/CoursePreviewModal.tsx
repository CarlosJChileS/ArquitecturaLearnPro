import { useState } from "react";
import { X, Play, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface CoursePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: number;
    title: string;
    instructor: string;
    description: string;
    image: string;
    duration: string;
    students: number;
    rating: number;
    level: string;
    category: string;
  };
}

const CoursePreviewModal = ({ isOpen, onClose, course }: CoursePreviewModalProps) => {
  const [currentVideo, setCurrentVideo] = useState(0);
  const { toast } = useToast();

  const previewLessons = [
    { 
      id: 1, 
      title: "Introducción al Curso", 
      duration: "3:45", 
      free: true,
      description: "Conoce lo que aprenderás y cómo está estructurado el curso."
    },
    { 
      id: 2, 
      title: "Configuración del Entorno", 
      duration: "8:20", 
      free: true,
      description: "Instala las herramientas necesarias para seguir el curso."
    },
    { 
      id: 3, 
      title: "Primeros Pasos", 
      duration: "12:15", 
      free: false,
      description: "Comenzamos con los conceptos fundamentales."
    },
    { 
      id: 4, 
      title: "Ejercicio Práctico", 
      duration: "15:30", 
      free: false,
      description: "Aplica lo aprendido en un proyecto real."
    }
  ];

  const handleEnroll = () => {
    toast({
      title: "¡Genial! 🎉",
      description: "Serás redirigido a los planes de suscripción para acceder a este curso."
    });
    onClose();
    // Aquí iría la redirección a suscripciones
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold">{course.title}</h2>
            <p className="text-muted-foreground">Vista previa del curso</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 h-[calc(90vh-100px)]">
          {/* Video Player */}
          <div className="lg:col-span-2 bg-black relative">
            <div className="aspect-video bg-black flex items-center justify-center">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Button size="lg" className="bg-white/20 border-white/50 text-white hover:bg-white/30">
                  <Play className="h-8 w-8" />
                </Button>
              </div>
            </div>
            
            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              <div className="text-white space-y-2">
                <h3 className="font-medium">{previewLessons[currentVideo].title}</h3>
                <p className="text-sm text-white/80">{previewLessons[currentVideo].description}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <span>{previewLessons[currentVideo].duration}</span>
                  <span>•</span>
                  <span>{previewLessons[currentVideo].free ? "Vista previa gratuita" : "Requiere suscripción"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="border-l border-border bg-muted/20 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Course Info */}
              <div>
                <h3 className="font-semibold mb-3">Información del curso</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Instructor:</span>
                    <span>{course.instructor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duración:</span>
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estudiantes:</span>
                    <span>{course.students.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nivel:</span>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Categoría:</span>
                    <Badge variant="secondary">{course.category}</Badge>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div>
                <h3 className="font-semibold mb-3">Tu progreso</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Lecciones completadas</span>
                    <span>0/24</span>
                  </div>
                  <Progress value={0} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Suscríbete para comenzar tu aprendizaje
                  </p>
                </div>
              </div>

              {/* Lesson List */}
              <div>
                <h3 className="font-semibold mb-3">Contenido del curso</h3>
                <div className="space-y-2">
                  {previewLessons.map((lesson, index) => (
                    <Card 
                      key={lesson.id}
                      className={`cursor-pointer transition-colors ${
                        currentVideo === index ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setCurrentVideo(index)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {lesson.free ? (
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <Play className="h-4 w-4 text-green-600" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{lesson.title}</p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span>{lesson.duration}</span>
                              {lesson.free && (
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  Gratis
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg text-center">
                    <Lock className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      +20 lecciones adicionales
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Disponibles con suscripción
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-3">
                <Button onClick={handleEnroll} className="w-full bg-gradient-primary">
                  Acceder a Todo el Curso
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Incluido en todos los planes de suscripción
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePreviewModal;