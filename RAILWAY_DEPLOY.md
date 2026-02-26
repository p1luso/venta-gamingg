# Guía de Despliegue en Railway (Backend)

Para alojar tu API en Railway **no es estrictamente necesario crear un Dockerfile**, porque Railway detectará automáticamente tu código Node.js (NestJS) e intentará compilarlo. Sin embargo, al tener un **Monorepo** (una carpeta `apps` con múltiples proyectos), necesitamos configurar Railway con cuidado. O, si preferimos 100% de consistencia, un Dockerfile.

La forma más sencilla y recomendada ("Click & Deploy") es conectar directamente tu repositorio de GitHub a Railway. Sigue estos pasos:

## 1. Crear el Proyecto y la Base de Datos
1. Entra a [Railway.app](https://railway.app/) y crea un **New Project**.
2. Selecciona **Provision PostgreSQL**.
3. Railway creará una base de datos Postgres y te dará variables como `DATABASE_URL`.
   *(Nota: Tu `docker-compose.yml` local era solo para pruebas. En Railway usarás la URL que te da el entorno de producción de ellos)*.

## 2. Conectar el Repositorio (Backend)
1. Dentro del mismo proyecto en Railway, vuelve a darle **New -> GitHub Repo**.
2. Selecciona tu repositorio `venta-gamingg`.
3. Inmediatamente haz clic en tu nuevo servicio en el panel y ve a la pestaña **Settings**.

## 3. Configurar el Monorepo para la API
Como tu proyecto tiene frontend y backend, dile a Railway dónde está la API:

1. Ve a **Settings -> General -> Root Directory**.
2. Escribe `/apps/api` (esto le dice a Railway que compile solo esa subcarpeta).
3. En **Watch Paths**, escribe `/apps/api/**` para que solo se despliegue de nuevo cuando modifiques el backend, ignorando los cambios en Vercel (`apps/web`).
4. Ve a la sección **Build** -> **Builder**. Si usa Nixpacks (por defecto), déjalo. En **Install Command**, especifica `npm install`. En **Build Command**, especifica `npm run build`.

## 4. Configurar las Variables de Entorno (.env)
1. Ve a la pestaña **Variables** del servicio de la API.
2. Haz clic en **Raw Editor** e ingresa todas las variables que configuramos en `.env.example`:

```env
FRONTEND_URL=https://<tu-url-de-vercel>.vercel.app
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://<tu-url-de-railway>.up.railway.app/api/v1/auth/google/callback
STRIPE_SECRET_KEY=...
ENCRYPTION_KEY=...
# No hace falta agregar DATABASE_URL si haces click en "Reference Variable" apuntando a la base de datos de Postgres que creaste en el paso 1.
```

*(Recuerda obtener también la URL pública de la API en la sección **Networking -> Generate Domain** para poder ponerla en el `NEXT_PUBLIC_API_URL` de Vercel y armar tu URL del callback de Google)*.

## 5. ¡Aplica los cambios y Despliega!
Con la ruta base en `/apps/api` y las variables seteadas, Railway instalará y armará el contenedor Nixpack en la nube. 

---

### ¿Fallas por el Lockfile en el Monorepo? Alternativa: Dockerfile
Si por alguna razón la instalación en `/apps/api` falla en Railway porque necesita las dependencias globales del monorepo (`package.json` raíz), la solución definitiva es colocar un `Dockerfile` en la carpeta `apps/api/`. Si prefieres este método para asegurar 0% de fallas en los builds de dependencias compartidas, confírmalo y te creo el `Dockerfile` optimizado al instante.
