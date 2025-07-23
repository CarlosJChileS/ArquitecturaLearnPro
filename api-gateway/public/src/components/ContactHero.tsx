import { Mail, HelpCircle } from "lucide-react";

const ContactHero = () => {
  return (
    <section className="bg-gradient-primary text-white py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
          ¿Necesitas ayuda?
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8 animate-slide-up">
          Estamos aquí para apoyarte en tu journey de aprendizaje
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 mt-12 max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300 animate-scale-in">
            <Mail className="h-8 w-8 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Email</h3>
            <p className="text-sm text-white/80">24-48 horas</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <HelpCircle className="h-8 w-8 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Centro de ayuda</h3>
            <p className="text-sm text-white/80">Respuestas instantáneas</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactHero;