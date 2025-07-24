# 2. Uso de Supabase como backend

Fecha: 2024-06-23

## Estado
Aceptado

## Contexto

Se necesitaba una base de datos y un sistema de autenticacion sencillos para validar la plataforma. La idea era contar con un backend gestionado que evitara montar infraestructura compleja.

## Decisión

Se eligio Supabase por ofrecer PostgreSQL gestionado, API REST y autenticacion integrada. Ademas permite desplegar funciones Edge que complementan la logica del API.

## Consecuencias

El codigo utiliza la libreria oficial de Supabase para interactuar con la base de datos y la autenticacion. Cuando no se configura un `SUPABASE_URL` se recurre a implementaciones en memoria para facilitar el desarrollo local.
