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
  Send, CheckCircle2, Headphones, ArrowLeft, MessageSquare, Clock, Users, HelpCircle, BookOpen
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
  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    subject: false,
    message: false
  });

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
      <main>
        {/* Hero Section - Improved */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Navigation breadcrumb */}
              <div className="mb-8">
                <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors animate-fade-in-up">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al inicio
                </Link>
              </div>
              
              <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="inline-flex p-4 bg-gradient-primary rounded-2xl mb-6">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient-primary">
                  Contáctanos
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
                  ¿Tienes una pregunta específica? Nuestro equipo está listo para ayudarte de forma personalizada.
                </p>
                <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <Badge className="bg-green-500/10 text-green-600 border-green-200 px-4 py-2 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Respuesta en 24h
                  </Badge>
                  <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 px-4 py-2 text-sm font-medium">
                    <Headphones className="w-4 h-4 mr-2" />
                    Soporte dedicado
                  </Badge>
                  <Badge className="bg-purple-500/10 text-purple-600 border-purple-200 px-4 py-2 text-sm font-medium">
                    <Clock className="w-4 h-4 mr-2" />
                    Disponible 24/7
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Contact Form - Improved */}
                <Card className="border-border/50 shadow-xl bg-white/80 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                  <CardHeader className="pb-6">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                      <Send className="h-6 w-6 text-primary" />
                      Envíanos un mensaje
                    </CardTitle>
                    <CardDescription className="text-base">
                      Completa el formulario y te contactaremos lo antes posible
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Nombre</label>
                          <Input
                            name="name"
                            placeholder="Tu nombre completo"
                            value={formData.name}
                            onChange={handleChange}
                            onFocus={() => setIsFocused({ ...isFocused, name: true })}
                            onBlur={() => setIsFocused({ ...isFocused, name: false })}
                            className={`h-12 border-2 transition-all duration-200 ${
                              isFocused.name 
                                ? 'border-primary/50 shadow-lg shadow-primary/10' 
                                : 'border-border hover:border-primary/30'
                            }`}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Email</label>
                          <Input
                            name="email"
                            type="email"
                            placeholder="tu@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            onFocus={() => setIsFocused({ ...isFocused, email: true })}
                            onBlur={() => setIsFocused({ ...isFocused, email: false })}
                            className={`h-12 border-2 transition-all duration-200 ${
                              isFocused.email 
                                ? 'border-primary/50 shadow-lg shadow-primary/10' 
                                : 'border-border hover:border-primary/30'
                            }`}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Asunto</label>
                        <Input
                          name="subject"
                          placeholder="¿En qué podemos ayudarte?"
                          value={formData.subject}
                          onChange={handleChange}
                          onFocus={() => setIsFocused({ ...isFocused, subject: true })}
                          onBlur={() => setIsFocused({ ...isFocused, subject: false })}
                          className={`h-12 border-2 transition-all duration-200 ${
                            isFocused.subject 
                              ? 'border-primary/50 shadow-lg shadow-primary/10' 
                              : 'border-border hover:border-primary/30'
                          }`}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Mensaje</label>
                        <Textarea
                          name="message"
                          placeholder="Cuéntanos más detalles sobre tu consulta..."
                          value={formData.message}
                          onChange={handleChange}
                          onFocus={() => setIsFocused({ ...isFocused, message: true })}
                          onBlur={() => setIsFocused({ ...isFocused, message: false })}
                          className={`min-h-[120px] border-2 transition-all duration-200 resize-none ${
                            isFocused.message 
                              ? 'border-primary/50 shadow-lg shadow-primary/10' 
                              : 'border-border hover:border-primary/30'
                          }`}
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-gradient-primary hover:opacity-90 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Enviando mensaje...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Send className="h-4 w-4" />
                            <span>Enviar mensaje</span>
                          </div>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Contact Information - Improved */}
                <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                  <Card className="border-border/50 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        Información de contacto
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="flex items-start space-x-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                        <div className="p-3 bg-blue-500 rounded-full">
                          <Mail className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-1">Email</h3>
                          <p className="text-muted-foreground mb-1">contacto@learnpro.com</p>
                          <p className="text-muted-foreground">soporte@learnpro.com</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4 p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-100">
                        <div className="p-3 bg-green-500 rounded-full">
                          <Phone className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-1">Teléfono</h3>
                          <p className="text-muted-foreground mb-1">+34 900 123 456</p>
                          <p className="text-sm text-muted-foreground">Lun - Vie: 9:00 AM - 6:00 PM</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
                        <div className="p-3 bg-purple-500 rounded-full">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-1">Dirección</h3>
                          <p className="text-muted-foreground">
                            Manta, Ecuador
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* FAQ Quick Links - Improved */}
                  <Card className="border-border/50 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <MessageSquare className="h-6 w-6 text-primary" />
                        Recursos de Ayuda
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Link to="/faq">
                        <Button variant="outline" className="w-full justify-start h-12 text-base hover:bg-primary hover:text-white transition-all duration-300">
                          <HelpCircle className="h-4 w-4 mr-3" />
                          Ver Preguntas Frecuentes
                        </Button>
                      </Link>
                      <Button variant="outline" className="w-full justify-start h-12 text-base hover:bg-primary hover:text-white transition-all duration-300">
                        <BookOpen className="h-4 w-4 mr-3" />
                        Centro de Documentación
                      </Button>
                      <Button variant="outline" className="w-full justify-start h-12 text-base hover:bg-primary hover:text-white transition-all duration-300">
                        <Headphones className="h-4 w-4 mr-3" />
                        Chat en Vivo
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