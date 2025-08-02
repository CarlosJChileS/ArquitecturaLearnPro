import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFooterData } from "@/hooks/useFooterData";

const Footer = () => {
  const { links, contacts, socials, settings, loading, error } = useFooterData();

  // Loading state
  if (loading) {
    return (
      <footer className="bg-muted/30 border-t border-border py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </footer>
    );
  }

  // Error state
  if (error) {
    return (
      <footer className="bg-muted/30 border-t border-border py-16">
        <div className="container mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p>Error cargando el footer: {error}</p>
          </div>
        </div>
      </footer>
    );
  }

  // Get links by category
  const quickLinks = links.filter(link => link.category === 'quick_links');
  const categoryLinks = links.filter(link => link.category === 'categories');
  const legalLinks = links.filter(link => link.category === 'legal');

  // Get contacts by type
  const emailContact = contacts.find(contact => contact.type === 'email');
  const phoneContact = contacts.find(contact => contact.type === 'phone');
  const addressContact = contacts.find(contact => contact.type === 'address');

  // Get social media platforms
  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return <Facebook className="h-5 w-5" />;
      case 'twitter': return <Twitter className="h-5 w-5" />;
      case 'instagram': return <Instagram className="h-5 w-5" />;
      case 'linkedin': return <Linkedin className="h-5 w-5" />;
      default: return <Facebook className="h-5 w-5" />;
    }
  };

  const companyName = settings?.company_name || 'LearnPro';
  const companyDescription = settings?.company_description || 'La plataforma líder en educación online que transforma carreras profesionales a través del aprendizaje especializado.';
  const copyrightText = settings?.copyright_text || '© 2024 LearnPro. Todos los derechos reservados.';
  const newsletterTitle = settings?.newsletter_title || 'Mantente Actualizado';
  const newsletterDescription = settings?.newsletter_description || 'Recibe las últimas novedades sobre cursos y ofertas especiales';

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
              <span className="text-2xl font-bold text-gradient">{companyName}</span>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {companyDescription}
            </p>
            <div className="flex space-x-4">
              {socials.map((social) => (
                <Button 
                  key={social.id} 
                  variant="outline" 
                  size="sm" 
                  className="hover-scale"
                  asChild
                >
                  <a href={social.url} target="_blank" rel="noopener noreferrer">
                    {getSocialIcon(social.platform)}
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Enlaces Rápidos</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <a href={link.url} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Categorías</h3>
            <ul className="space-y-3">
              {categoryLinks.map((link) => (
                <li key={link.id}>
                  <a href={link.url} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Contacto</h3>
            <div className="space-y-4">
              {emailContact && (
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-foreground">{emailContact.value}</p>
                    <p className="text-muted-foreground text-sm">{emailContact.description}</p>
                  </div>
                </div>
              )}
              {phoneContact && (
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-foreground">{phoneContact.value}</p>
                    <p className="text-muted-foreground text-sm">{phoneContact.description}</p>
                  </div>
                </div>
              )}
              {addressContact && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-foreground">{addressContact.value}</p>
                    <p className="text-muted-foreground text-sm">{addressContact.description}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-border pt-8 mb-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="font-semibold text-lg mb-4">{newsletterTitle}</h3>
            <p className="text-muted-foreground mb-6">
              {newsletterDescription}
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
              {copyrightText}
            </div>
            <div className="flex space-x-6 text-sm">
              {legalLinks.map((link) => (
                <a 
                  key={link.id} 
                  href={link.url} 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;