import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Clock, MapPin, Phone } from "lucide-react";

const ContactInfo = () => {
  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      description: "Soporte general",
      contact: "soporte@learnpro.com",
      note: "Respuesta en 24 horas"
    },
    {
      icon: Mail,
      title: "Email técnico",
      description: "Problemas técnicos",
      contact: "tech@learnpro.com",
      note: "Respuesta prioritaria"
    },
    {
      icon: Phone,
      title: "Teléfono",
      description: "Soporte telefónico",
      contact: "+1 (555) 123-4567",
      note: "Lun-Vie 9AM-6PM"
    },
    {
      icon: MapPin,
      title: "Oficina",
      description: "Visitas programadas",
      contact: "123 Education St, Learning City",
      note: "Con cita previa"
    }
  ];

  const scheduleInfo = [
    { day: "Lunes - Viernes", hours: "9:00 AM - 6:00 PM" },
    { day: "Sábado", hours: "10:00 AM - 2:00 PM" },
    { day: "Domingo", hours: "Cerrado" }
  ];

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Información de contacto
          </h2>
          <p className="text-muted-foreground text-lg">
            Múltiples formas de comunicarte con nosotros
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactMethods.map((method, index) => (
            <Card key={index} className="shadow-card hover:shadow-soft transition-all duration-300 bg-gradient-card border-0 group">
              <CardHeader className="text-center pb-3">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit group-hover:bg-primary/20 transition-colors duration-300">
                  <method.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{method.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{method.description}</p>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="font-medium text-foreground mb-2">{method.contact}</p>
                <p className="text-xs text-muted-foreground">{method.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="shadow-card bg-gradient-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Clock className="h-5 w-5" />
                Horarios de atención
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scheduleInfo.map((schedule, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-border/50 last:border-b-0">
                    <span className="font-medium text-foreground">{schedule.day}</span>
                    <span className="text-muted-foreground">{schedule.hours}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card border-0">
            <CardHeader>
              <CardTitle className="text-primary">Respuesta garantizada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-foreground">Consultas urgentes</p>
                    <p className="text-sm text-muted-foreground">Respuesta en 2-4 horas</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-foreground">Consultas generales</p>
                    <p className="text-sm text-muted-foreground">Respuesta en 24 horas</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-foreground">Sugerencias</p>
                    <p className="text-sm text-muted-foreground">Respuesta en 48-72 horas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactInfo;