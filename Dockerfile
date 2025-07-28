# Multi-stage build para optimizar el tamaño final
FROM node:18-alpine as builder

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para el build)
RUN npm ci && npm cache clean --force

# Copiar el código fuente (excluyendo archivos innecesarios via .dockerignore)
COPY . .

# Construir la aplicación para producción
# Las variables de entorno se inyectarán en tiempo de ejecución via Cloud Run
RUN npm run build

# Etapa de producción con nginx optimizado
FROM nginx:alpine

# Instalar curl para health checks
RUN apk add --no-cache curl

# Copiar archivos construidos desde la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer el puerto 8080 (requerido por Cloud Run)
EXPOSE 8080

# Health check para Cloud Run
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
