import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient">LearnPro</span>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              La plataforma líder en educación online que transforma carreras profesionales a través del aprendizaje especializado.
            </p>
            <div className="flex space-x-4">
              <Button variant="outline" size="sm" className="hover-scale">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="sm" className="hover-scale">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="sm" className="hover-scale">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="sm" className="hover-scale">
                <Linkedin className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Enlaces Rápidos</h3>
            <ul className="space-y-3">
               <li>
                <a href="/courses" className="text-muted-foreground hover:text-foreground transition-colors">
                  Catálogo de Cursos
                </a>
              </li>
              <li>
                <a href="/subscription" className="text-muted-foreground hover:text-foreground transition-colors">
                  Planes y Precios
                </a>
              </li>
              <li>
                <a href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  Sobre Nosotros
                </a>
              </li>
              <li>
                <a href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contacto
                </a>
              </li>
              <li>
                <a href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  Preguntas Frecuentes
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Categorías</h3>
            <ul className="space-y-3">
              <li>
                <a href="/courses?category=Programación" className="text-muted-foreground hover:text-foreground transition-colors">
                  Desarrollo Web
                </a>
              </li>
              <li>
                <a href="/courses?category=Data Science" className="text-muted-foreground hover:text-foreground transition-colors">
                  Data Science
                </a>
              </li>
              <li>
                <a href="/courses?category=Diseño" className="text-muted-foreground hover:text-foreground transition-colors">
                  Diseño UX/UI
                </a>
              </li>
              <li>
                <a href="/courses?category=IA/ML" className="text-muted-foreground hover:text-foreground transition-colors">
                  Machine Learning
                </a>
              </li>
              <li>
                <a href="/courses?category=DevOps" className="text-muted-foreground hover:text-foreground transition-colors">
                  DevOps
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Contacto</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-foreground">soporte@learnpro.com</p>
                  <p className="text-muted-foreground text-sm">Soporte general</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-foreground">+1 (555) 123-4567</p>
                  <p className="text-muted-foreground text-sm">Lun-Vie 9:00-18:00 EST</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-foreground">San Francisco, CA</p>
                  <p className="text-muted-foreground text-sm">Oficina principal</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-border pt-8 mb-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="font-semibold text-lg mb-4">Mantente Actualizado</h3>
            <p className="text-muted-foreground mb-6">
              Recibe las últimas novedades sobre cursos y ofertas especiales
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Tu email"
                className="flex-1 px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button className="bg-primary hover:bg-primary/90">
                Suscribirse
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-muted-foreground text-sm">
              © 2024 LearnPro. Todos los derechos reservados.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Términos de Servicio
              </a>
              <a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Política de Privacidad
              </a>
              <a href="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;