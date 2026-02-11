# Sesión 01: Inicialización del Proyecto y Cimientos del Backend

**Fecha:** 10 de Febrero de 2026
**Objetivo:** Establecer la arquitectura base de Venta Gaming (Fase 1).

## Resumen del Progreso

Hemos configurado exitosamente el monorepo y los cimientos sólidos del Backend (NestJS) siguiendo prácticas de ingeniería de nivel Senior ("Zero-Trust").

### 1. Estructura del Proyecto (Monorepo)
- **/apps/web**: Frontend inicializado con Next.js 14/15 (App Router).
- **/apps/api**: Backend inicializado con NestJS (Modular).

### 2. Base de Datos & ORM
- **Prisma ORM**: Configurado en `apps/api/prisma`.
- **Schema (`schema.prisma`)**:
  - Modelos definidos: `User`, `Order`.
  - Enums para estados: `PaymentStatus`, `TransferStatus`.
  - Relaciones establecidas.

### 3. Ingeniería & Seguridad (Backend)
Hemos implementado reglas estrictas en el API Gateway (`apps/api`):

- **Zero-Trust Validation (`main.ts`)**:
  - `ValidationPipe` configurado globalmente.
  - `whitelist: true` & `forbidNonWhitelisted: true`: Rechaza cualquier dato no definido en los DTOs.
  - `transform: true`: Conversión automática de tipos.
  - `Global Prefix`: `/api/v1`.

- **Manejo de Errores (`HttpExceptionFilter`)**:
  - Filtro global para estandarizar todas las respuestas de error en formato JSON.
  - Logs estructurados de errores.

- **Seguridad de Datos (`EncryptionService`)**:
  - Implementación de **AES-256-CBC** nativa con Node.js `crypto`.
  - Validación estricta al inicio: El servidor falla (Internal Server Error) si `ENCRYPTION_KEY` no tiene exactamente 32 bytes.

### 4. Módulos Implementados (Skeleton)
- **AppModule**: Orquestador principal con Configuración Global.
- **PrismaModule**: Módulo global para la conexión a DB.
- **OrdersModule**:
  - `CreateOrderDto`: Validación de `coin_amount` y `user_email`.
  - `OrdersService`: Logger implementado.
- **TransferModule**: Estructura base lista.

## Próximos Pasos (Para retomar en Notebook)

1.  **Configurar Git Remoto**:
    - Asegurate de tener acceso al repo: `https://github.com/p1luso/venta-gamingg.git`.
    - Ejecutar `git push -u origin main` para subir estos cambios.

2.  **Desarrollo de APIs**:
    - Implementar lógica real de `OrdersService` (Guardar en DB).
    - Conectar con Stripe (PaymentModule).
    - Implementar `TransferService` con integración a Fut Transfer API.

3.  **Frontend**:
    - Conectar Next.js con el API Backend.

## Comandos para iniciar
```bash
# Backend
cd apps/api
npm install
npx prisma generate
npm run start:dev

# Frontend
cd apps/web
npm run dev
```
