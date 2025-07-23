import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getCategories } from "../api";

const Footer = () => {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data.map((c: any) => c.name)))
      .catch((err) => console.error(err));
  }, []);

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">LearnPro</span>
            </div>
            <p className="text-background/80 mb-6 leading-relaxed">
              La plataforma líder en educación online que transforma carreras profesionales a través del aprendizaje especializado.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-background hover:bg-background/10">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-background hover:bg-background/10">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-background hover:bg-background/10">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-background hover:bg-background/10">
                <Linkedin className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Enlaces Rápidos</h3>
            <ul className="space-y-3">
              <li>
                <a href="#cursos" className="text-background/80 hover:text-background transition-colors">
                  Catálogo de Cursos
                </a>
              </li>
              <li>
                <a href="#planes" className="text-background/80 hover:text-background transition-colors">
                  Planes y Precios
                </a>
              </li>
              <li>
                <a href="#nosotros" className="text-background/80 hover:text-background transition-colors">
                  Sobre Nosotros
                </a>
              </li>
              <li>
                <a href="#instructores" className="text-background/80 hover:text-background transition-colors">
                  Instructores
                </a>
              </li>
              <li>
                <a href="#blog" className="text-background/80 hover:text-background transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Categorías</h3>
            <ul className="space-y-3">
              {categories.map((name) => (
                <li key={name}>
                  <a href="#" className="text-background/80 hover:text-background transition-colors">
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Contacto</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-background/60 mt-1" />
                <div>
                  <p className="text-background/80">soporte@learnpro.es</p>
                  <p className="text-background/60 text-sm">Soporte general</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-background/60 mt-1" />
                <div>
                  <p className="text-background/80">+34 900 123 456</p>
                  <p className="text-background/60 text-sm">Lun-Vie 9:00-18:00</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-background/60 mt-1" />
                <div>
                  <p className="text-background/80">Madrid, España</p>
                  <p className="text-background/60 text-sm">Oficina principal</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-background/20 pt-8 mb-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="font-semibold text-lg mb-4">Mantente Actualizado</h3>
            <p className="text-background/80 mb-6">
              Recibe las últimas novedades sobre cursos y ofertas especiales
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Tu email"
                className="flex-1 px-4 py-2 rounded-lg bg-background/10 border border-background/20 text-background placeholder:text-background/60 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button className="bg-primary hover:bg-primary/90">
                Suscribirse
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-background/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-background/60 text-sm">
              © 2024 LearnPro. Todos los derechos reservados.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-background/60 hover:text-background transition-colors">
                Términos de Servicio
              </a>
              <a href="#" className="text-background/60 hover:text-background transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="text-background/60 hover:text-background transition-colors">
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