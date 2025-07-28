# Imagen de Node.js
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código
COPY . .

# Construir proyecto
RUN npm run build

# Usar nginx para servir archivos
FROM nginx:alpine

# Copiar archivos construidos
COPY --from=0 /app/dist /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar script de entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080

# Usar entrypoint para configurar variables en tiempo de ejecución
ENTRYPOINT ["/entrypoint.sh"]
