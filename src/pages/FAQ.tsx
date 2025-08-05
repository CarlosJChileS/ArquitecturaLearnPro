import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";
import {
  Search, HelpCircle, BookOpen, CreditCard,
  Shield, Award, MessageCircle, CheckCircle2, Sparkles, ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";

const faqCategories = [
  {
    id: "subscription",
    name: "Suscripción",
    icon: CreditCard,
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
    bgColor: "bg-blue-500"
  },
  {
    id: "courses",
    name: "Cursos",
    icon: BookOpen,
    color: "bg-green-500/10 text-green-600 border-green-200",
    bgColor: "bg-green-500"
  },
  {
    id: "certificates",
    name: "Certificados",
    icon: Award,
    color: "bg-purple-500/10 text-purple-600 border-purple-200",
    bgColor: "bg-purple-500"
  },
  {
    id: "technical",
    name: "Técnico",
    icon: Shield,
    color: "bg-orange-500/10 text-orange-600 border-orange-200",
    bgColor: "bg-orange-500"
  }
];

const faqs = [
  {
    category: "subscription",
    question: "¿Cómo funciona la suscripción?",
    answer: "Con una sola suscripción mensual o anual tienes acceso completo a más de 1,000 cursos actualizados. No hay compras individuales ni restricciones de contenido. Puedes cancelar en cualquier momento sin penalizaciones."
  },
  {
    category: "subscription",
    question: "¿Puedo cancelar en cualquier momento?",
    answer: "Sí, absolutamente. Puedes cancelar tu suscripción en cualquier momento desde tu perfil. Seguirás teniendo acceso hasta el final del período de facturación actual."
  },
  {
    category: "subscription",
    question: "¿Ofrecen reembolsos?",
    answer: "Ofrecemos una garantía de reembolso completo de 30 días para nuevos suscriptores. Si no estás satisfecho, contacta a nuestro equipo de soporte."
  },
  {
    category: "subscription",
    question: "¿Hay descuentos para estudiantes o empresas?",
    answer: "Sí, ofrecemos descuentos especiales para estudiantes universitarios (50% de descuento) y planes empresariales personalizados. Contacta nuestro equipo de ventas para más información."
  },
  {
    category: "courses",
    question: "¿Cuántos cursos están incluidos?",
    answer: "Actualmente tenemos más de 1,000 cursos en nuestra plataforma, cubriendo tecnología, diseño, negocios, marketing y más. Agregamos nuevos cursos cada mes."
  },
  {
    category: "courses",
    question: "¿Los cursos están en español?",
    answer: "Sí, todos nuestros cursos están disponibles en español con instructores nativos. También ofrecemos subtítulos en múltiples idiomas para mayor accesibilidad."
  },
  {
    category: "courses",
    question: "¿Puedo descargar los cursos para ver offline?",
    answer: "Sí, nuestra app móvil permite descargar lecciones para verlas sin conexión a internet. Esta función está disponible para todos los suscriptores."
  },
  {
    category: "courses",
    question: "¿Hay cursos para principiantes?",
    answer: "Definitivamente. Tenemos cursos para todos los niveles: principiante, intermedio y avanzado. Cada curso está claramente etiquetado con su nivel de dificultad."
  },
  {
    category: "certificates",
    question: "¿Los certificados están reconocidos oficialmente?",
    answer: "Nuestros certificados están reconocidos por empresas líderes del sector y instituciones educativas. Están verificados blockchain y pueden ser validados por empleadores."
  },
  {
    category: "certificates",
    question: "¿Cómo obtengo un certificado?",
    answer: "Para obtener un certificado, debes completar al menos el 80% del curso y aprobar la evaluación final. El certificado se genera automáticamente y está disponible para descarga."
  },
  {
    category: "certificates",
    question: "¿Puedo compartir mis certificados en LinkedIn?",
    answer: "Sí, todos nuestros certificados incluyen un enlace directo para compartir en LinkedIn y otras redes profesionales. También puedes descargarlos en PDF."
  },
  {
    category: "technical",
    question: "¿Qué dispositivos son compatibles?",
    answer: "Nuestra plataforma funciona en ordenadores (Windows, Mac, Linux), tablets y smartphones (iOS y Android). También tenemos apps nativas para móviles."
  },
  {
    category: "technical",
    question: "¿Necesito software especial?",
    answer: "No, solo necesitas un navegador web moderno. Para cursos específicos de programación o diseño, proporcionamos instrucciones detalladas sobre herramientas recomendadas."
  },
  {
    category: "technical",
    question: "¿Qué velocidad de internet necesito?",
    answer: "Recomendamos al menos 5 Mbps para streaming en HD. Los videos se adaptan automáticamente a tu velocidad de conexión para una experiencia óptima."
  },
  {
    category: "technical",
    question: "¿Hay soporte técnico disponible?",
    answer: "Sí, nuestro equipo de soporte técnico está disponible 24/7 via chat en vivo, email y teléfono. Tiempo de respuesta promedio: menos de 2 horas."
  }
];

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
                  <HelpCircle className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient-primary">
                  Preguntas Frecuentes
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
                  Encuentra respuestas rápidas a las preguntas más comunes sobre nuestra plataforma
                </p>
                
                {/* Search - Improved */}
                <div className="max-w-md mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <div className="relative">
                    <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${
                      isSearchFocused ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <Input
                      placeholder="Buscar en preguntas frecuentes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      className={`pl-12 h-12 border-2 transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                        isSearchFocused 
                          ? 'border-primary/50 shadow-lg shadow-primary/10' 
                          : 'border-border/50 hover:border-primary/30'
                      }`}
                    />
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                  <Badge className="bg-green-500/10 text-green-600 border-green-200 px-4 py-2 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Respuestas instantáneas
                  </Badge>
                  <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 px-4 py-2 text-sm font-medium">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Soporte 24/7
                  </Badge>
                  <Badge className="bg-purple-500/10 text-purple-600 border-purple-200 px-4 py-2 text-sm font-medium">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Base de conocimiento
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filters - Improved */}
        <section className="py-12 bg-gradient-to-b from-gray-50/50 to-background">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
                className={`flex items-center space-x-2 h-12 px-6 font-medium transition-all duration-300 ${
                  selectedCategory === "all" 
                    ? 'bg-gradient-primary text-white shadow-lg' 
                    : 'hover:bg-primary/10 hover:border-primary/50'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Todas las categorías</span>
              </Button>
              {faqCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 h-12 px-6 font-medium transition-all duration-300 ${
                    selectedCategory === category.id 
                      ? 'bg-gradient-primary text-white shadow-lg' 
                      : 'hover:bg-primary/10 hover:border-primary/50'
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Content - Improved */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {filteredFaqs.length > 0 ? (
                <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '1s' }}>
                  {filteredFaqs.map((faq, index) => {
                    const category = faqCategories.find(cat => cat.id === faq.category);
                    return (
                      <Card 
                        key={`faq-${faq.question.slice(0, 20)}-${index}`}
                        className="border-border/50 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                        style={{ animationDelay: `${1.2 + index * 0.1}s` }}
                      >
                        <Accordion type="single" collapsible>
                          <AccordionItem value={`item-${index}`} className="border-none">
                            <AccordionTrigger className="px-6 py-4 text-left hover:no-underline group">
                              <div className="flex items-start space-x-4 w-full">
                                <div className={`p-2 rounded-full ${category?.bgColor} text-white flex-shrink-0 mt-1`}>
                                  {category?.icon && <category.icon className="h-4 w-4" />}
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors duration-200">
                                    {faq.question}
                                  </h3>
                                  <div className="mt-2">
                                    <Badge className={`${category?.color} text-xs font-medium`}>
                                      {category?.name}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6">
                              <div className="pl-12">
                                <p className="text-gray-600 leading-relaxed text-base">
                                  {faq.answer}
                                </p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 animate-fade-in-up">
                  <div className="inline-flex p-6 bg-gray-100 rounded-full mb-6">
                    <HelpCircle className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    No se encontraron resultados
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Intenta con otros términos de búsqueda o contacta a nuestro equipo de soporte para obtener ayuda personalizada
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => setSearchTerm("")} 
                      variant="outline"
                      className="h-12 px-8"
                    >
                      Limpiar búsqueda
                    </Button>
                    <Link to="/contact">
                      <Button className="h-12 px-8 bg-gradient-primary hover:opacity-90">
                        Contactar soporte
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
};

export default FAQ;