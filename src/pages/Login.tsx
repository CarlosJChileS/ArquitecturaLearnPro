import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GraduationCap, Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const navigate = useNavigate();
  const location = useLocation();
  
  // Manejo robusto del contexto
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('Error accessing AuthContext:', error);
    // Fallback: redirigir a home y recargar
    window.location.href = '/';
    return <div>Cargando...</div>;
  }
  
  const { signIn, user, loading, profile } = authContext;

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (user && profile && !loading) {
      const destination = profile.role === 'admin' ? '/admin/dashboard' : from;
      navigate(destination, { replace: true });
    }
  }, [user, profile, loading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError(error.message);
      }
      // La redirección se maneja en el useEffect cuando se actualiza el profile
    } catch (err) {
      setError("Error al iniciar sesión. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header Section */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="p-4 bg-gradient-primary rounded-2xl shadow-xl">
                  <GraduationCap className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <div className="p-1 bg-yellow-400 rounded-full">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gradient-primary mb-2">
              LearnPro
            </h1>
            <p className="text-xl text-muted-foreground">
              Accede a tu cuenta de aprendizaje
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Continúa tu viaje de aprendizaje profesional
            </p>
          </div>

          {/* Login Card */}
          <Card className="border-border/50 shadow-2xl bg-white/80 backdrop-blur-md animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl text-center font-bold">¡Bienvenido de vuelta!</CardTitle>
              <CardDescription className="text-center text-base">
                Ingresa tus credenciales para acceder a tu cuenta
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="animate-fade-in-up">
                    <AlertDescription className="font-medium">{error}</AlertDescription>
                  </Alert>
                )}
                
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                    Email
                  </Label>
                  <div className="relative">
                    <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                      isFocused.email ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      <Mail className="h-5 w-5" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setIsFocused({ ...isFocused, email: true })}
                      onBlur={() => setIsFocused({ ...isFocused, email: false })}
                      required
                      className={`pl-10 h-12 border-2 transition-all duration-200 ${
                        isFocused.email 
                          ? 'border-primary/50 shadow-lg shadow-primary/10' 
                          : 'border-border hover:border-primary/30'
                      }`}
                    />
                  </div>
                </div>
                
                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                      isFocused.password ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      <Lock className="h-5 w-5" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsFocused({ ...isFocused, password: true })}
                      onBlur={() => setIsFocused({ ...isFocused, password: false })}
                      required
                      className={`pl-10 pr-12 h-12 border-2 transition-all duration-200 ${
                        isFocused.password 
                          ? 'border-primary/50 shadow-lg shadow-primary/10' 
                          : 'border-border hover:border-primary/30'
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="flex items-center justify-end">
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-6 pt-6">
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-primary hover:opacity-90 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Iniciando sesión...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Iniciar Sesión</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>
                
                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">O</span>
                  </div>
                </div>
                
                {/* Register Link */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    ¿No tienes cuenta?{" "}
                    <Link 
                      to="/register" 
                      className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors"
                    >
                      Regístrate aquí
                    </Link>
                  </p>
                </div>
              </CardFooter>
            </form>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <p className="text-xs text-muted-foreground">
              Al continuar, aceptas nuestros{" "}
              <Link to="/terms" className="text-primary hover:underline">Términos de Servicio</Link>
              {" "}y{" "}
              <Link to="/privacy" className="text-primary hover:underline">Política de Privacidad</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;