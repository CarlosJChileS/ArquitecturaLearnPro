# 3. Arquitectura modular en Node.js

Fecha: 2024-06-23

## Estado
Aceptado

## Contexto

El backend debia soportar varias areas funcionales (autenticacion, cursos, pagos, notificaciones) y ser facil de extender con nuevas funcionalidades.

## Decisión

Se estructuró el proyecto en modulos independientes dentro de la carpeta `modules`. Cada modulo expone un router Express que es montado por el `api-gateway`. Las reglas de negocio comunes se ubican en `core` y los recursos compartidos en `shared`.

## Consecuencias

La modularidad permite incorporar nuevas caracteristicas sin afectar al resto del sistema. Sin embargo, al aumentar el numero de modulos se debe prestar atencion a las dependencias entre ellos y mantener una documentacion clara.
