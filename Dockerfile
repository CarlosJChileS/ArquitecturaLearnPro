FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV VITE_SUPABASE_URL=https://xfuhbjqqlgfxxkjvezhy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmdWhianFxbGdmeHhranZlemh5Iiwicm9zZSI6ImFub24iLCJpYXQiOjE3NTMwOTQ2MzgsImV4cCI6MjA2ODY3MDYzOH0.EFZFZyDF7eR1rkXCgZq-Q-B96I_H9XP1ulQsyzAyVOI
ENV VITE_APP_URL=https://arquitecturalearnpro-132316147989.europe-west1.run.app

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
