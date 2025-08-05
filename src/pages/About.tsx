import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Target, Users, Award, BookOpen, Globe, Heart, 
  Star, TrendingUp, CheckCircle2, Zap, Shield, Rocket
} from "lucide-react";
import { Link } from "react-router-dom";

const team = [
  {
    name: "Luis Figueroa",
    role: "CEO",
    bio: "Apasionado por llevar la educación a todos.",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
    linkedin: "#",
  },
  {
    name: "Carlos Chile",
    role: "CTO",
    bio: "Enfocado en crear soluciones escalables.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    linkedin: "#",
  },
  {
    name: "Ginger Perez",
    role: "Head of Education",
    bio: "Experta en estrategias educativas digitales.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
    linkedin: "#",
  },
  {
    name: "Anthony Mejia",
    role: "Head of Growth",
    bio: "Especialista en marketing digital y growth hacking.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    linkedin: "#",
  },
  {
    name: "Rossana Ochoa",
    role: "Marketing",
    bio: "Comprometida con impulsar la comunidad de LearnPro.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    linkedin: "#",
  },
];

const stats = [
  { number: "2019", label: "Año de fundación" },
  { number: "50K+", label: "Estudiantes activos" },
  { number: "1000+", label: "Cursos disponibles" },
  { number: "95%", label: "Tasa de satisfacción" },
  { number: "200+", label: "Instructores expertos" },
  { number: "50+", label: "Países representados" }
];

const values = [
  {
    icon: Target,
    title: "Misión clara",
    description: "Democratizar el acceso a educación de calidad mundial para todos."
  },
  {
    icon: Heart,
    title: "Pasión por enseñar",
    description: "Creemos que el conocimiento transforma vidas y sociedades."
  },
  {
    icon: Shield,
    title: "Calidad garantizada",
    description: "Cada curso pasa por un riguroso proceso de calidad antes de publicarse."
  },
  {
    icon: Rocket,
    title: "Innovación constante",
    description: "Utilizamos la última tecnología para crear experiencias de aprendizaje únicas."
  }
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-50 via-blue-50 to-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="outline" className="mb-6 bg-purple-100 text-purple-700 border-purple-200">
                🚀 Transformando la educación desde 2019
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
                Nuestra misión es
                <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  democratizar la educación
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Creemos que todos merecen acceso a educación de calidad mundial. 
                Por eso hemos construido una plataforma que conecta a los mejores expertos 
                con estudiantes de todo el mundo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/subscription">
                  <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8">
                    Únete a nosotros
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button variant="outline" size="lg" className="border-gray-300 px-8">
                    Explorar cursos
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                  Nuestra historia
                </h2>
                <div className="space-y-6 text-gray-600 leading-relaxed">
                  <p>
                    LearnPro nació en 2019 cuando Ana García, ex-directora de tecnología en Google España, 
                    se dio cuenta de que el acceso a educación de calidad seguía siendo un privilegio 
                    de pocos, no un derecho de todos.
                  </p>
                  <p>
                    Junto con un equipo de visionarios de empresas como Facebook, Microsoft y Spotify, 
                    decidimos crear algo diferente: una plataforma que no solo ofreciera cursos, 
                    sino que transformara la manera en que las personas aprenden y crecen profesionalmente.
                  </p>
                  <p>
                    Hoy, más de 50,000 estudiantes de 50 países confían en nosotros para acelerar 
                    sus carreras y alcanzar sus objetivos profesionales.
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">Fundada por ex-ejecutivos de Big Tech</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">Respaldada por inversores internacionales</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">Reconocida por la UE como EdTech líder</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop" 
                  alt="Equipo trabajando"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">300%</div>
                      <div className="text-sm text-gray-600">Crecimiento anual</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Nuestros valores
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Los principios que guían cada decisión que tomamos
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow border-0 bg-gray-50">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <value.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-lg">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Conoce al equipo
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Profesionales apasionados trabajando para transformar la educación
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-purple-600 font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {member.bio}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Listo para acelerar tu carrera?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Únete a miles de profesionales que ya están transformando sus carreras con LearnPro
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/subscription">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 font-semibold">
                  Comenzar ahora
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 font-semibold transition-all duration-300">
                  Contáctanos
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;