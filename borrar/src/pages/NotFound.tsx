import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Home, Search, ArrowLeft, BookOpen } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-gradient-primary rounded-2xl">
            <GraduationCap className="h-12 w-12 text-white" />
          </div>
        </div>

        {/* 404 Display */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            404
          </h1>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Página no encontrada
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        {/* Suggestions Card */}
        <Card className="mb-8 text-left">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              ¿Qué estabas buscando?
            </CardTitle>
            <CardDescription>
              Aquí hay algunas sugerencias para encontrar lo que necesitas:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Link to="/" className="group">
                <div className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <Home className="h-6 w-6 text-primary mb-2" />
                  <h3 className="font-semibold group-hover:text-primary">Página Principal</h3>
                  <p className="text-sm text-muted-foreground">Volver al inicio de LearnPro</p>
                </div>
              </Link>
              
              <Link to="/courses" className="group">
                <div className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <BookOpen className="h-6 w-6 text-primary mb-2" />
                  <h3 className="font-semibold group-hover:text-primary">Cursos</h3>
                  <p className="text-sm text-muted-foreground">Explora nuestro catálogo completo</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button size="lg" className="bg-gradient-primary w-full sm:w-auto">
              <Home className="h-4 w-4 mr-2" />
              Ir al Inicio
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver Atrás
          </Button>
        </div>

        {/* Additional Help */}
        <div className="mt-8 text-sm text-muted-foreground">
          <p>
            Si crees que esto es un error, por favor{" "}
            <Link to="/contact" className="text-primary hover:underline">
              contáctanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
