import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

const ContactFAQ = () => {
  const faqData = [
    {
      question: "¿Cómo puedo cambiar mi plan de suscripción?",
      answer: "Puedes cambiar tu plan en cualquier momento desde tu perfil. Ve a Configuración > Suscripción y selecciona el nuevo plan. Los cambios se aplicarán inmediatamente y ajustaremos la facturación proporcionalmente."
    },
    {
      question: "¿Puedo obtener un reembolso si cancelo mi suscripción?",
      answer: "Ofrecemos reembolsos completos dentro de los primeros 30 días de tu suscripción. Después de este período, puedes cancelar en cualquier momento y mantendrás acceso hasta el final de tu período de facturación actual."
    },
    {
      question: "¿Los cursos tienen fechas límite?",
      answer: "No, todos nuestros cursos son a tu propio ritmo. Una vez que tengas acceso a un curso, puedes completarlo cuando gustes. Tu progreso se guarda automáticamente."
    },
    {
      question: "¿Ofrecen certificados de finalización?",
      answer: "Sí, al completar un curso recibirás un certificado digital verificable que puedes compartir en LinkedIn y otras plataformas profesionales."
    },
    {
      question: "¿Puedo acceder a los cursos desde dispositivos móviles?",
      answer: "Absolutamente. LearnPro está optimizado para todos los dispositivos. Puedes continuar tu aprendizaje desde tu teléfono, tablet o computadora sin problemas."
    },
    {
      question: "¿Hay descuentos para estudiantes o equipos?",
      answer: "Sí, ofrecemos descuentos especiales para estudiantes con credenciales válidas y precios preferenciales para equipos de 5 o más personas. Contáctanos para más información."
    },
    {
      question: "¿Con qué frecuencia agregan nuevos cursos?",
      answer: "Agregamos nuevos cursos mensualmente. Los suscriptores reciben acceso inmediato a todo el contenido nuevo sin costo adicional."
    },
    {
      question: "¿Qué pasa si tengo problemas técnicos durante un curso?",
      answer: "Nuestro equipo de soporte técnico está disponible 24/7. Puedes contactarnos a través del chat en vivo o enviarnos un email a tech@learnpro.com para asistencia inmediata."
    }
  ];

  return (
    <section className="py-16 px-4 bg-gradient-learning">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Preguntas frecuentes
          </h2>
          <p className="text-muted-foreground text-lg">
            Encuentra respuestas rápidas a las consultas más comunes
          </p>
        </div>

        <Card className="shadow-card bg-gradient-card border-0">
          <CardHeader>
            <CardTitle className="text-primary">¿Tienes alguna duda?</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqData.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                  <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary transition-colors duration-200">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">
            ¿No encontraste lo que buscabas?
          </p>
          <p className="text-sm text-muted-foreground">
            Envíanos tu pregunta usando el formulario de contacto y te responderemos pronto.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ContactFAQ;