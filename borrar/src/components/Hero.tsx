import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, ArrowRight, Users, BookOpen, Award, Star, CheckCircle2, Zap, Globe, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative py-16 md:py-24 bg-white overflow-hidden">
      {/* Background decorations - Udemy style */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-white"></div>
      <div className="absolute top-10 right-20 w-32 h-32 bg-purple-100 rounded-full opacity-30"></div>
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-blue-100 rounded-full opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Más de 50,000 estudiantes
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                <Star className="w-3 h-3 mr-1 fill-current" />
                4.8/5 estrellas
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
              Aprende habilidades <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                demandadas por la industria
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              Accede a más de 1,000 cursos actualizados con una sola suscripción. Aprende a tu ritmo, 
              obtén certificaciones reconocidas y acelera tu carrera profesional.
            </p>

            {/* Value props */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700">Todos los cursos incluidos</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-700">Contenido actualizado mensualmente</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-gray-700">Certificados verificados</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                  <Globe className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-gray-700">Acceso de por vida</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link to="/subscription">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg font-semibold group">
                  Comenzar Suscripción
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/courses">
                <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-lg font-semibold">
                  <Play className="mr-2 h-5 w-5" />
                  Explorar Cursos
                </Button>
              </Link>
            </div>
            
            {/* Social proof stats */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">50K+</div>
                <div className="text-sm text-gray-500">Estudiantes Activos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">1000+</div>
                <div className="text-sm text-gray-500">Cursos Disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">98%</div>
                <div className="text-sm text-gray-500">Satisfacción</div>
              </div>
            </div>
          </div>
          
          {/* Hero image - Udemy style mockup */}
          <div className="animate-slide-up delay-300">
            <div className="relative">
              {/* Course preview card */}
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=300&fit=crop" 
                    alt="Course preview"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Play className="w-6 h-6 text-gray-800 ml-1" />
                    </div>
                  </div>
                  <Badge className="absolute top-4 left-4 bg-green-600">
                    ✅ Incluido en suscripción
                  </Badge>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">JavaScript Moderno: ES6+</h3>
                      <p className="text-sm text-gray-500">por María González</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>12 horas</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>2,840 estudiantes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>4.8</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Progreso del curso</span>
                      <span className="text-sm text-purple-600 font-semibold">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full w-3/4"></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">8 de 12 módulos completados</p>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-orange-100 rounded-full p-3 shadow-lg">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-green-100 rounded-full p-3 shadow-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;