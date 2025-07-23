import { AdminLayout } from "@/components/admin/AdminLayout";
import useAdminAuth from "@/hooks/use-admin-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Save, 
  Mail, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  CreditCard,
  Database,
  Key
} from "lucide-react";

export default function AdminSettings() {
  useAdminAuth();
  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona las configuraciones generales de la plataforma
            </p>
          </div>
          <Button className="gap-2 bg-gradient-primary hover:opacity-90">
            <Save className="h-4 w-4" />
            Guardar Cambios
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Settings */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Configuración General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform-name">Nombre de la Plataforma</Label>
                    <Input id="platform-name" defaultValue="LearnPro" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="platform-url">URL de la Plataforma</Label>
                    <Input id="platform-url" defaultValue="https://learnpro.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform-description">Descripción</Label>
                  <Input 
                    id="platform-description" 
                    defaultValue="Plataforma de cursos online con suscripciones" 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo de Mantenimiento</Label>
                    <p className="text-sm text-muted-foreground">
                      Activar para realizar mantenimiento en la plataforma
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* Email Settings */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Configuración de Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-server">Servidor SMTP</Label>
                    <Input id="smtp-server" placeholder="smtp.gmail.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">Puerto</Label>
                    <Input id="smtp-port" placeholder="587" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-user">Usuario SMTP</Label>
                    <Input id="smtp-user" placeholder="admin@learnpro.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-password">Contraseña</Label>
                    <Input id="smtp-password" type="password" placeholder="••••••••" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Emails de Bienvenida</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar emails automáticos a nuevos usuarios
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones de Nuevos Usuarios</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificación cuando se registre un nuevo usuario
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones de Pagos</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificación cuando se procese un pago
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Reportes Semanales</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir reporte semanal de actividad
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* Payment Settings */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Configuración de Pagos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stripe-key">Clave Pública de Stripe</Label>
                    <Input id="stripe-key" placeholder="pk_test_..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripe-secret">Clave Secreta de Stripe</Label>
                    <Input id="stripe-secret" type="password" placeholder="sk_test_..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input id="webhook-url" placeholder="https://learnpro.com/webhook/stripe" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo de Prueba</Label>
                    <p className="text-sm text-muted-foreground">
                      Usar claves de prueba de Stripe
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Database className="h-4 w-4" />
                  Backup Database
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Shield className="h-4 w-4" />
                  Logs de Seguridad
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Key className="h-4 w-4" />
                  Generar API Key
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Palette className="h-4 w-4" />
                  Personalizar Tema
                </Button>
              </CardContent>
            </Card>

            {/* System Info */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Información del Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Versión:</span>
                  <span className="text-sm font-medium">v2.1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Última actualización:</span>
                  <span className="text-sm font-medium">15/01/2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Estado del servidor:</span>
                  <span className="text-sm font-medium text-success">Online</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Uso de almacenamiento:</span>
                  <span className="text-sm font-medium">2.3GB / 10GB</span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Almacenamiento</span>
                    <span>23%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "23%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Soporte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  ¿Necesitas ayuda? Contacta a nuestro equipo de soporte.
                </p>
                <Button variant="outline" className="w-full">
                  Contactar Soporte
                </Button>
                <Button variant="outline" className="w-full">
                  Ver Documentación
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}