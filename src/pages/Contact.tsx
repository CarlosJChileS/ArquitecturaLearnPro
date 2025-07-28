import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, Phone, MapPin, 
  Send, CheckCircle2, Headphones, ArrowLeft
} from "lucide-react";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Mensaje enviado",
      description: "Gracias por contactarnos. Te responderemos pronto."
    });
    
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Navigation breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
        </div>
        
        {/* Hero Section - Udemy style */}
        <section className="bg-gray-900 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                ¿Necesitas ayuda?
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Nuestro equipo de soporte está aquí para ayudarte. Contáctanos y te responderemos lo antes posible.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge className="bg-green-600 text-white px-4 py-2">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Respuesta en 24h
                </Badge>
                <Badge className="bg-blue-600 text-white px-4 py-2">
                  <Headphones className="w-4 h-4 mr-2" />
                  Soporte dedicado
                </Badge>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12">
                {/* Contact Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Envíanos un mensaje</CardTitle>
                    <CardDescription>
                      Completa el formulario y te contactaremos lo antes posible
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Input
                            name="name"
                            placeholder="Tu nombre"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div>
                          <Input
                            name="email"
                            type="email"
                            placeholder="Tu email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <Input
                        name="subject"
                        placeholder="Asunto"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                      <Textarea
                        name="message"
                        placeholder="Tu mensaje"
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        required
                      />
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        <Send className="mr-2 h-4 w-4" />
                        {isSubmitting ? "Enviando..." : "Enviar mensaje"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <div className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Información de contacto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-start space-x-3">
                        <Mail className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <h3 className="font-medium">Email</h3>
                          <p className="text-muted-foreground">contacto@learnpro.com</p>
                          <p className="text-muted-foreground">soporte@learnpro.com</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <Phone className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <h3 className="font-medium">Teléfono</h3>
                          <p className="text-muted-foreground">+34 900 123 456</p>
                          <p className="text-sm text-muted-foreground">Lun - Vie: 9:00 AM - 6:00 PM</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <h3 className="font-medium">Dirección</h3>
                          <p className="text-muted-foreground">
                            Calle Gran Vía, 123<br />
                            28013 Madrid, España
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* FAQ Quick Links */}
                  <Card>
                    <CardHeader>
                      <CardTitle>¿Necesitas ayuda rápida?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        Preguntas frecuentes
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Centro de ayuda
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Soporte técnico
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;