# Modelo C4 de LearnPro

A continuacion se presenta una vision simplificada del sistema siguiendo la metodologia C4 mediante diagramas Mermaid.

## Diagrama de contexto

```mermaid
graph TD
    usuario[Usuario]
    subgraph LearnPro
        web[Frontend React]
        api[API Express]
    end
    supabase[Supabase / Postgres]
    stripe[Stripe]
    paypal[PayPal]

    usuario --> web
    web --> api
    api --> supabase
    api --> stripe
    api --> paypal
```

## Diagrama de contenedores

```mermaid
graph TD
    subgraph "Aplicacion Node"
        api["API Gateway\nExpress"]
        modulos["Modulos de caracteristicas"]
        shared["Componentes compartidos"]
    end
    frontend["Cliente React"]
    db[("Base de datos Supabase")]
    servicios[("Servicios externos: Stripe/PayPal")] 

    frontend --> api
    api --> modulos
    api --> shared
    api --> db
    api --> servicios
```

Los modulos incluyen autenticacion, cursos, pagos y notificaciones. Cada modulo expone rutas REST que son montadas por el API gateway.

Para mas detalle de componentes internos se recomienda revisar el codigo fuente de cada modulo.
