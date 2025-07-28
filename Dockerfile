# Usar una imagen de Node.js oficial como base
FROM node:18-alpine as builder

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para el build)
RUN npm ci && npm cache clean --force

# Copiar el código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Etapa de producción con nginx
FROM nginx:alpine

# Copiar archivos construidos desde la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar script de entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Exponer el puerto 8080 (requerido por Cloud Run)
EXPOSE 8080

# Comando para iniciar con el script de entrypoint
CMD ["/entrypoint.sh"]
