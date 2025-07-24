# -------- Build React front-end ---------
FROM node:20-slim AS frontend
WORKDIR /app/frontend
COPY api-gateway/public/package*.json ./
RUN npm ci
COPY api-gateway/public ./
RUN npm run build

# -------- Build backend and assemble app ---------
FROM node:20-slim AS backend
ARG ENV_FILE=.env.example
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY core ./core
COPY modules ./modules
COPY api-gateway ./api-gateway
COPY shared ./shared
COPY database ./database

# Copy default environment or provided file
COPY .env .env

# Include built frontend assets
COPY --from=frontend /app/frontend/dist ./api-gateway/public/dist

# -------- Production image ---------
FROM node:20-slim
WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY --from=backend /app .

EXPOSE 8080
CMD ["npm", "start"]
