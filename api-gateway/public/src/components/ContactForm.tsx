import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "¡Mensaje enviado!",
      description: "Te responderemos pronto. Revisa tu email.",
      duration: 5000,
    });
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      category: "",
      message: ""
    });
    
    setIsSubmitting(false);
  };

  const isFormValid = formData.name && formData.email && formData.subject && formData.category && formData.message;

  return (
    <section className="py-16 px-4 bg-gradient-learning">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Envíanos un mensaje
          </h2>
          <p className="text-muted-foreground text-lg">
            Completa el formulario y nos pondremos en contacto contigo
          </p>
        </div>

        <Card className="shadow-form bg-gradient-card border-0">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Formulario de contacto</CardTitle>
            <CardDescription>
              Todos los campos son obligatorios. Te responderemos en un máximo de 24 horas.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    className="transition-all duration-300 focus:shadow-soft"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="transition-all duration-300 focus:shadow-soft"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría de consulta</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger className="transition-all duration-300 focus:shadow-soft">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soporte-tecnico">Soporte técnico</SelectItem>
                    <SelectItem value="cursos">Consultas sobre cursos</SelectItem>
                    <SelectItem value="suscripcion">Problemas de suscripción</SelectItem>
                    <SelectItem value="facturacion">Facturación y pagos</SelectItem>
                    <SelectItem value="general">Consulta general</SelectItem>
                    <SelectItem value="sugerencias">Sugerencias y feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Asunto</Label>
                <Input
                  id="subject"
                  placeholder="Resumen breve de tu consulta"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  required
                  className="transition-all duration-300 focus:shadow-soft"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea
                  id="message"
                  placeholder="Describe tu consulta en detalle..."
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  required
                  rows={5}
                  className="transition-all duration-300 focus:shadow-soft resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full bg-gradient-primary hover:shadow-soft transition-all duration-300 text-lg py-6"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Enviar mensaje
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ContactForm;