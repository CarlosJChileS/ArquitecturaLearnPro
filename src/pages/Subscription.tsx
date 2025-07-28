import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PricingPlans from "@/components/PricingPlans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, Users, Award, Clock, CheckCircle2, Star, 
  Play, Download, Trophy, Target, Zap, Shield 
} from "lucide-react";

const benefits = [
  {
    icon: BookOpen,
    title: "Acceso Completo",
    description: "Todos los cursos disponibles sin restricciones"
  },
  {
    icon: Clock,
    title: "Aprendizaje a tu Ritmo",
    description: "Estudia cuando quieras, donde quieras"
  },
  {
    icon: Award,
    title: "Certificados Verificados",
    description: "Obtén certificaciones reconocidas por la industria"
  },
  {
    icon: Users,
    title: "Comunidad Exclusiva",
    description: "Conecta con otros estudiantes y expertos"
  },
  {
    icon: Download,
    title: "Contenido Offline",
    description: "Descarga lecciones para ver sin conexión"
  },
  {
    icon: Zap,
    title: "Actualizaciones Constantes",
    description: "Nuevo contenido agregado mensualmente"
  }
];

const stats = [
  { number: "50+", label: "Cursos Premium" },
  { number: "500+", label: "Horas de Contenido" },
  { number: "10,000+", label: "Estudiantes Activos" },
  { number: "4.8/5", label: "Calificación Promedio" }
];

const featuredCourses = [
  {
    id: 1,
    title: "JavaScript Moderno: ES6+",
    instructor: "María González",
    duration: "12h",
    students: 2840,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=225&fit=crop"
  },
  {
    id: 2,
    title: "React Avanzado",
    instructor: "Carlos Rodríguez", 
    duration: "15h",
    students: 1920,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=225&fit=crop"
  },
  {
    id: 3,
    title: "Python para Data Science",
    instructor: "Luis Hernández",
    duration: "18h",
    students: 3200,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop"
  }
];

const Subscription = () => {
  const [hoveredBenefit, setHoveredBenefit] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20">
                🚀 Planes de Suscripción Premium
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
                Acelera tu Carrera Profesional
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Accede a todo nuestro catálogo de cursos premium, herramientas avanzadas y una comunidad de profesionales con un solo plan.
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                {stats.map((stat, index) => (
                  <div 
                    key={index}
                    className="text-center p-4 rounded-lg bg-background/60 backdrop-blur-sm border border-border/50 hover:bg-background/80 transition-all duration-300"
                  >
                    <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-foreground">
                ¿Por qué elegir nuestra suscripción?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Obtén acceso completo a una plataforma diseñada para el éxito profesional
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card 
                  key={index}
                  className={`group hover:shadow-glow transition-all duration-300 cursor-pointer ${
                    hoveredBenefit === index ? 'scale-105' : ''
                  }`}
                  onMouseEnter={() => setHoveredBenefit(index)}
                  onMouseLeave={() => setHoveredBenefit(null)}
                >
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <benefit.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {benefit.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      {benefit.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Courses Preview */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-foreground">
                Cursos Destacados Incluidos
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Una muestra de los cursos premium a los que tendrás acceso completo
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {featuredCourses.map((course) => (
                <Card key={course.id} className="group hover:shadow-glow transition-all duration-300">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-green-600 text-white">
                        ✅ Incluido
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="sm" className="bg-white/20 backdrop-blur-sm text-white border-white hover:bg-white hover:text-primary">
                        <Play className="h-4 w-4 mr-2" />
                        Vista previa
                      </Button>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription>
                      por {course.instructor}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{course.students.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{course.rating}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Y muchos más cursos disponibles en tu suscripción
              </p>
              <Link to="/courses">
                <Button variant="outline" size="lg">
                  Ver Todos los Cursos
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-foreground">
                Elige tu Plan de Suscripción
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Planes flexibles diseñados para diferentes necesidades y presupuestos
              </p>
            </div>
            
            <PricingPlans />
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold">Garantía de 30 días</h3>
                <p className="text-muted-foreground">
                  Reembolso completo si no estás satisfecho
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Trophy className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold">Certificaciones Oficiales</h3>
                <p className="text-muted-foreground">
                  Reconocidas por empresas líderes del sector
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold">Soporte 24/7</h3>
                <p className="text-muted-foreground">
                  Asistencia personalizada cuando la necesites
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Subscription;