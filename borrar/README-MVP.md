# 🎓 LearnPro MVP - Plataforma Universitaria

Una plataforma de aprendizaje en línea simplificada, diseñada específicamente como MVP para proyectos universitarios.

## 🚀 Inicio Rápido

### Prerequisitos
- Node.js 18+
- Cuenta en Supabase (ya configurada)

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/CarlosJChileS/codex-ayudame.git
cd codex-ayudame/ArquitecturaLearnPro

# Instalar dependencias
npm install

# Copia el archivo de ejemplo de variables de entorno y agrega tus claves de Supabase
cp .env.example .env
# Edita `.env` y reemplaza `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
# con los valores de tu proyecto en Supabase

# Iniciar aplicación
npm run dev
```

## 🔑 Credenciales de Prueba

```
📧 Email: admin@test.com
🔑 Password: admin123
👤 Role: Administrador
```

## 🌐 URLs

- **Aplicación**: http://localhost:8081/
- **Supabase Dashboard**: [Ver Base de Datos](https://supabase.com/dashboard/project/xfuhbjqqlgfxxkjvezhy)
- **Functions**: [Ver Edge Functions](https://supabase.com/dashboard/project/xfuhbjqqlgfxxkjvezhy/functions)

## ✨ Características MVP

### ✅ Funcionalidades Implementadas
- 🔐 **Autenticación simplificada**
- 📚 **Gestión de cursos**
- 🎯 **Sistema de lecciones**
- 👥 **Administración de usuarios**
- 💳 **Integración de pagos (PayPal/Stripe)**
- 📊 **Dashboard de analytics**
- 📧 **Sistema de notificaciones**
- 🏆 **Certificados de finalización**

### 🛠️ Tecnologías Utilizadas
- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + Shadcn/ui
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Pagos**: Stripe + PayPal
- **Email**: Resend

## 📱 Estructura del Proyecto

```
ArquitecturaLearnPro/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── pages/         # Páginas de la aplicación
│   ├── hooks/         # Hooks personalizados
│   ├── lib/           # Utilidades y configuración
│   └── contexts/      # Contextos de React
├── supabase/
│   ├── functions/     # Edge Functions
│   └── migrations/    # Migraciones de BD
└── public/           # Archivos estáticos
```

## 🗃️ Base de Datos

### Tablas Principales
- `profiles` - Perfiles de usuario
- `courses` - Cursos disponibles
- `lessons` - Lecciones de cursos
- `enrollments` - Inscripciones
- `categories` - Categorías
- `subscription_plans` - Planes de suscripción

## 🔧 Configuración MVP

### Simplificaciones para Universidad:
- ✅ **RLS Deshabilitado** (acceso completo)
- ✅ **JWT Verification Off** (desarrollo fácil)
- ✅ **Políticas Permisivas** (sin restricciones)
- ✅ **Auto-creación de perfiles** (registro automático)

## 🧪 Testing

### Datos de Prueba Incluidos:
- ✅ Usuario administrador
- ✅ Categorías básicas
- ✅ Planes de suscripción
- ✅ Funciones desplegadas

## 📚 Uso del Cliente Supabase

```typescript
import { mvpHelpers } from '@/lib/supabase-mvp';

// Insertar datos
await mvpHelpers.insertData('courses', {
  title: 'Mi Curso',
  description: 'Descripción'
});

// Obtener datos
const { data } = await mvpHelpers.getData('courses');

// Actualizar
await mvpHelpers.updateData('courses', id, { title: 'Nuevo' });
```

## 🚨 Consideraciones de Producción

**⚠️ IMPORTANTE**: Este MVP está configurado para desarrollo/universidad:

### Antes de Producción:
- [ ] Implementar políticas RLS apropiadas
- [ ] Añadir validaciones robustas
- [ ] Configurar autenticación segura
- [ ] Implementar logs de auditoría
- [ ] Configurar variables de entorno seguras

## 📞 Soporte

Para soporte universitario:
- 📧 Crear issue en GitHub
- 📝 Revisar documentación en `/docs`
- 🔧 Verificar logs en Supabase Dashboard

## 📄 Licencia

MIT License - Perfecto para proyectos universitarios

---

**🎯 MVP optimizado para aprendizaje y desarrollo universitario!**
