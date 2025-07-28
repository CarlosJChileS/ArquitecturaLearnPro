import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";
import { 
  Search, HelpCircle, BookOpen, CreditCard, Users, 
  Shield, Clock, Award, MessageCircle, CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";

const faqCategories = [
  {
    id: "subscription",
    name: "Suscripción",
    icon: CreditCard,
    color: "bg-blue-100 text-blue-600"
  },
  {
    id: "courses",
    name: "Cursos",
    icon: BookOpen,
    color: "bg-green-100 text-green-600"
  },
  {
    id: "certificates",
    name: "Certificados",
    icon: Award,
    color: "bg-purple-100 text-purple-600"
  },
  {
    id: "technical",
    name: "Técnico",
    icon: Shield,
    color: "bg-orange-100 text-orange-600"
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
        {/* Hero Section */}
        <section className="bg-gray-900 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Centro de Ayuda
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Encuentra respuestas a las preguntas más frecuentes sobre nuestra plataforma
              </p>
              
              {/* Search */}
              <div className="max-w-md mx-auto mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Buscar en preguntas frecuentes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3">
                <Badge className="bg-green-600 text-white px-4 py-2">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Respuestas instantáneas
                </Badge>
                <Badge className="bg-blue-600 text-white px-4 py-2">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Soporte 24/7
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filters */}
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
                className="flex items-center space-x-2"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Todas</span>
              </Button>
              {faqCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center space-x-2"
                >
                  <category.icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {filteredFaqs.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-4">
                  {filteredFaqs.map((faq, index) => (
                    <AccordionItem 
                      key={`faq-${faq.question.slice(0, 20)}-${index}`} 
                      value={`item-${index}`}
                      className="bg-white border border-gray-200 rounded-lg px-6"
                    >
                      <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-blue-600">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-16">
                  <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    No se encontraron resultados
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Intenta con otros términos de búsqueda o contacta a nuestro equipo de soporte
                  </p>
                  <Button onClick={() => setSearchTerm("")} variant="outline">
                    Limpiar búsqueda
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Quick Help Cards */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              ¿Necesitas más ayuda?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle>Chat en vivo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Habla directamente con nuestro equipo de soporte
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Iniciar chat
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle>Comunidad</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Únete a nuestra comunidad de estudiantes
                  </p>
                  <Button variant="outline" className="w-full">
                    Ir al foro
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle>Soporte email</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Envíanos un email y te responderemos en 24h
                  </p>
                  <Link to="/contact">
                    <Button variant="outline" className="w-full">
                      Contactar
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default FAQ;