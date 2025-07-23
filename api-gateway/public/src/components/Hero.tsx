import { Button } from "@/components/ui/button";
import { Play, ArrowRight, Users, BookOpen, Award } from "lucide-react";
import { useEffect, useState } from "react";

const Hero = () => {
  interface UserInfo {
    name: string;
    email?: string;
  }

  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);
  return (
    <section className="relative py-20 md:py-32 bg-gradient-hero overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <div className="flex items-center space-x-2 mb-6">
              <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                🎯 Plataforma #1 en España
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
              Transforma tu
              <span className="block bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Carrera Profesional
              </span>
            </h1>
            
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Accede a más de 1,000 cursos especializados y aprende de expertos de la industria. 
              Desarrolla las habilidades que las empresas buscan hoy.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              {user ? (
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100 transition-colors group">
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Continuar con el curso
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <>
                  <Button size="lg" className="bg-white text-primary hover:bg-gray-100 transition-colors group">
                    <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Comenzar Gratis
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-6 text-white">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-8 w-8 text-blue-200" />
                </div>
                <div className="text-2xl font-bold">50K+</div>
                <div className="text-sm text-blue-200">Estudiantes Activos</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="h-8 w-8 text-blue-200" />
                </div>
                <div className="text-2xl font-bold">1000+</div>
                <div className="text-sm text-blue-200">Cursos Disponibles</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="h-8 w-8 text-blue-200" />
                </div>
                <div className="text-2xl font-bold">98%</div>
                <div className="text-sm text-blue-200">Tasa de Satisfacción</div>
              </div>
            </div>
          </div>
          
          <div className="animate-slide-up delay-300">
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-glow">
                <div className="bg-white rounded-xl p-6 mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Desarrollo Web Full Stack</h3>
                      <p className="text-sm text-muted-foreground">React, Node.js, MongoDB</p>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mb-3">
                    <div className="bg-gradient-primary h-2 rounded-full w-3/4"></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progreso: 75%</span>
                    <span className="text-primary font-medium">8 de 12 módulos</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-primary">24h</div>
                    <div className="text-sm text-foreground">Tiempo total</div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-accent">89%</div>
                    <div className="text-sm text-foreground">Completado</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;