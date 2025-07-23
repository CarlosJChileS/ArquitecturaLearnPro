import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import {
  Clock, Users, Star, ChevronLeft, Play, FileText, Award,
  BookOpen, Target, CheckCircle2, Lock, ChevronRight, Menu,
  ThumbsUp, MessageCircle, Share2, Download, MoreVertical,
  Bookmark
} from "lucide-react";

const courseData = {
  1: {
    id: 1,
    title: "JavaScript Moderno: ES6+",
    description: "Aprende las características más recientes de JavaScript incluyendo ES6, ES7 y más allá. Domina las nuevas sintaxis, funcionalidades y mejores prácticas del desarrollo moderno con JavaScript.",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=600&fit=crop",
    instructor: {
      name: "María González",
      bio: "Desarrolladora Senior con 8 años de experiencia en JavaScript y tecnologías web modernas.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    duration: "12 horas",
    students: 2840,
    rating: 4.8,
    level: "Intermedio",
    category: "Programación",
    price: "Incluido en suscripción",
    objectives: [
      "Dominar las características de ES6+ incluyendo arrow functions, destructuring y template literals",
      "Implementar async/await y promises para programación asíncrona",
      "Utilizar módulos ES6 para organizar código eficientemente",
      "Aplicar nuevas estructuras de datos como Map, Set y WeakMap",
      "Crear aplicaciones modernas siguiendo las mejores prácticas"
    ],
    modules: [
      {
        id: 1,
        title: "Introducción a ES6+",
        duration: "2h 30m",
        lessons: [
          { id: 1, title: "¿Qué es ES6?", duration: "15m", completed: true },
          { id: 2, title: "Configuración del entorno", duration: "20m", completed: true },
          { id: 3, title: "Let, const vs var", duration: "25m", completed: true },
          { id: 4, title: "Arrow Functions", duration: "30m", completed: false },
          { id: 5, title: "Template Literals", duration: "20m", completed: false }
        ]
      },
      {
        id: 2,
        title: "Destructuring y Spread",
        duration: "2h 15m",
        lessons: [
          { id: 6, title: "Destructuring de Arrays", duration: "30m", completed: false },
          { id: 7, title: "Destructuring de Objetos", duration: "35m", completed: false },
          { id: 8, title: "Spread Operator", duration: "25m", completed: false },
          { id: 9, title: "Rest Parameters", duration: "25m", completed: false },
          { id: 10, title: "Ejercicios Prácticos", duration: "20m", completed: false }
        ]
      },
      {
        id: 3,
        title: "Programación Asíncrona",
        duration: "3h 45m",
        lessons: [
          { id: 11, title: "Callbacks y sus problemas", duration: "30m", completed: false },
          { id: 12, title: "Promises", duration: "45m", completed: false },
          { id: 13, title: "Async/Await", duration: "40m", completed: false },
          { id: 14, title: "Manejo de errores", duration: "35m", completed: false },
          { id: 15, title: "Fetch API", duration: "35m", completed: false },
          { id: 16, title: "Proyecto: API Weather App", duration: "1h", completed: false }
        ]
      }
    ],
    requirements: [
      "Conocimientos básicos de JavaScript",
      "Familiaridad con HTML y CSS",
      "Editor de código (recomendado VS Code)",
      "Node.js instalado (versión 14 o superior)"
    ]
  }
  // Aquí se agregarían más cursos
};

const CourseDetail = () => {
  const { id } = useParams();
  const [currentLesson, setCurrentLesson] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const course = courseData[Number(id) as keyof typeof courseData];

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Curso no encontrado</h1>
          <p className="text-muted-foreground mb-8">El curso que buscas no existe o ha sido movido.</p>
          <Link to="/courses">
            <Button>Volver a Cursos</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
  const completedLessons = course.modules.reduce(
    (acc, module) => acc + module.lessons.filter(lesson => lesson.completed).length, 
    0
  );
  const progressPercentage = (completedLessons / totalLessons) * 100;

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se enviaría el comentario
    console.log("Comentario enviado:", { comment, rating });
    setComment("");
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center space-x-4">
          <Link to="/courses" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver a cursos
          </Link>
          <div className="w-px h-6 bg-border"></div>
          <h1 className="text-lg font-semibold text-foreground">{course.title}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Bookmark className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Sidebar */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <div className="h-full border-r border-border">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold">Contenido del curso</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>{completedLessons}/{totalLessons} lecciones</span>
                    <span>•</span>
                    <span>{course.duration}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              </div>
              
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="p-4 space-y-4">
                  {course.modules.map((module) => (
                    <div key={module.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm">{module.title}</h3>
                        <span className="text-xs text-muted-foreground">{module.duration}</span>
                      </div>
                      <div className="space-y-1">
                        {module.lessons.map((lesson, index) => (
                          <div
                            key={lesson.id}
                            className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-colors ${
                              currentLesson === lesson.id - 1 
                                ? 'bg-primary/10 text-primary' 
                                : 'hover:bg-muted/50'
                            }`}
                            onClick={() => setCurrentLesson(lesson.id - 1)}
                          >
                            {lesson.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : currentLesson === lesson.id - 1 ? (
                              <Play className="h-4 w-4 text-primary flex-shrink-0" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">{lesson.title}</p>
                              <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Main Video and Content Area */}
          <ResizablePanel defaultSize={75}>
            <div className="h-full flex flex-col">
              {/* Video Player */}
              <div className="relative bg-black">
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
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center space-x-4">
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Me gusta
                      </Button>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Velocidad: 1x</span>
                      <span className="text-sm">HD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Below Video */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                  {/* Lesson Title and Info */}
                  <div>
                    <h1 className="text-2xl font-bold mb-2">
                      {course.modules[0]?.lessons[currentLesson]?.title || "Introducción al curso"}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Módulo 1</span>
                      <span>•</span>
                      <span>Lección {currentLesson + 1}</span>
                      <span>•</span>
                      <span>{course.modules[0]?.lessons[currentLesson]?.duration || "15 min"}</span>
                    </div>
                  </div>

                  {/* Lesson Description */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Descripción de la lección</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        En esta lección aprenderemos los conceptos fundamentales de JavaScript moderno. 
                        Exploraremos las nuevas características introducidas en ES6+ y cómo aplicarlas 
                        en proyectos reales. Al final de esta lección serás capaz de utilizar las 
                        funcionalidades más importantes del JavaScript moderno.
                      </p>
                      
                      <div className="mt-4 space-y-2">
                        <h4 className="font-medium">Lo que aprenderás:</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          <li>Sintaxis de arrow functions</li>
                          <li>Destructuring de objetos y arrays</li>
                          <li>Template literals</li>
                          <li>Let y const vs var</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Comments and Rating Form */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Comentarios y Calificación
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitComment} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="rating">Califica esta lección</Label>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Button
                                key={star}
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="p-1"
                                onClick={() => setRating(star)}
                              >
                                <Star 
                                  className={`h-5 w-5 ${
                                    star <= rating 
                                      ? 'fill-yellow-400 text-yellow-400' 
                                      : 'text-muted-foreground'
                                  }`} 
                                />
                              </Button>
                            ))}
                            <span className="ml-2 text-sm text-muted-foreground">
                              {rating}/5 estrellas
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="comment">Tu comentario</Label>
                          <Textarea
                            id="comment"
                            placeholder="Comparte tu experiencia con esta lección..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="min-h-[100px]"
                          />
                        </div>
                        
                        <Button type="submit" className="w-full">
                          Enviar comentario
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <Button variant="outline" disabled={currentLesson === 0}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Lección anterior
                    </Button>
                    <Button 
                      onClick={() => setCurrentLesson(Math.min(currentLesson + 1, totalLessons - 1))}
                      disabled={currentLesson === totalLessons - 1}
                    >
                      Siguiente lección
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default CourseDetail;
