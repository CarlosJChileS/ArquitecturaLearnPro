# Documentacion general de LearnPro

LearnPro es una plataforma de aprendizaje por suscripcion construida con Node.js y React. Utiliza Supabase como base de datos y autentificacion y admite pagos mediante Stripe y PayPal. El proyecto esta organizado siguiendo una arquitectura modular que separa los dominios principales en modulos independientes.

## Caracteristicas principales

- Autentificacion de usuarios y gestion de roles.
- Catalogo de cursos clasificados por categorias.
- Progreso de cursos por usuario y notificaciones por correo.
- Planes de suscripcion con pagos gestionados por Stripe y PayPal.
- API REST central que sirve a la interfaz React.

## Estructura

```
api-gateway/        # servidor Express y frontend React
core/               # modelos de dominio y servicios de aplicacion
modules/            # modulos de caracteristicas (auth, products, payments, ...)
shared/             # middleware y utilidades comunes
database/           # scripts SQL y datos de ejemplo
```

Para detalles de ejecucion consulta el README principal. En esta carpeta se incluyen ademas el [modelo C4](c4-model.md) y las [ADR](adr) que recogen las decisiones de arquitectura.

La especificación de la API en formato OpenAPI se encuentra en [swagger.yaml](swagger.yaml) y puede visualizarse ejecutando el servidor y visitando `/api-docs`.
