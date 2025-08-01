# Configuración de Webhooks para Academia Online
# Este archivo documenta todos los webhooks necesarios para el sistema

## Stripe Webhooks
# URL: https://tu-proyecto.supabase.co/functions/v1/webhook-stripe
# Eventos a configurar en Stripe Dashboard:

### Eventos de Suscripción
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- customer.subscription.trial_will_end

### Eventos de Pago
- invoice.payment_succeeded
- invoice.payment_failed
- payment_intent.succeeded
- payment_intent.payment_failed

### Eventos de Cliente
- customer.created
- customer.updated
- customer.deleted

### Eventos de Producto
- product.created
- product.updated
- price.created
- price.updated

## Configuración de Webhook en Stripe:
# 1. Ve a https://dashboard.stripe.com/webhooks
# 2. Haz clic en "Add endpoint"
# 3. URL del endpoint: https://tu-proyecto.supabase.co/functions/v1/webhook-stripe
# 4. Selecciona los eventos listados arriba
# 5. Copia el signing secret y agrégalo a las variables de entorno como STRIPE_WEBHOOK_SECRET

## PayPal Webhooks (si se implementa)
# URL: https://tu-proyecto.supabase.co/functions/v1/webhook-paypal
# Eventos recomendados:
- PAYMENT.CAPTURE.COMPLETED
- PAYMENT.CAPTURE.DENIED
- BILLING.SUBSCRIPTION.ACTIVATED
- BILLING.SUBSCRIPTION.CANCELLED
- BILLING.SUBSCRIPTION.SUSPENDED

## Resend Webhooks (para email tracking)
# URL: https://tu-proyecto.supabase.co/functions/v1/webhook-resend
# Eventos:
- email.sent
- email.delivered
- email.bounced
- email.complained

## Variables de Entorno Requeridas para Webhooks:
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_WEBHOOK_ID=...
RESEND_WEBHOOK_SECRET=...

## Configuración de Seguridad:
# Todos los webhooks deben verificar la firma para asegurar autenticidad
# Los endpoints están protegidos contra ataques de replay
# Se implementa logging completo para debugging

## Pruebas de Webhooks:
# Para pruebas locales, usar ngrok o similar:
# ngrok http 54321
# Luego usar la URL de ngrok en la configuración de webhooks

## Monitoreo:
# Los webhooks registran eventos en la tabla webhook_logs
# Se puede usar la función health-check para verificar el estado
# Métricas disponibles en el dashboard de administración
