# Guía de Despliegue en Vercel

Para solucionar los errores de despliegue actuales ("Cannot find module lightningcss..."), sigue estos pasos EXACTOS:

## 1. Eliminar Lockfiles (Ya realizado localmente)
He eliminado los archivos `package-lock.json` de tu proyecto para forzar a Vercel a regenerarlos en Linux.

## 2. Subir Cambios a GitHub
Debes hacer commit y push de estos cambios para que Vercel los detecte. Ejecuta en tu terminal:

```bash
git add .
git commit -m "fix: remove package-lock.json to fix linux builds"
git push
```

## 3. Configuración en Vercel (Importante)
Para asegurar que Vercel construya el proyecto correcto:

1. Ve a tu proyecto en Vercel -> **Settings** -> **General**.
2. Busca la sección **Root Directory**.
3. Haz clic en **Edit** y selecciona la carpeta `apps/web`.
4. Guarda los cambios.

## 4. Redesplegar
Una vez hecho el push y configurado el directorio raíz, Vercel debería iniciar un nuevo despliegue automáticamente. Si no, ve a **Deployments** y dale a "Redeploy" en el último commit.

---

### ¿Por qué fallaba?
El proyecto usa Tailwind CSS v4, que depende de una herramienta llamada `lightningcss`. Esta herramienta necesita un archivo binario específico para cada sistema operativo (Windows vs Linux). Como instalaste las dependencias en Windows, el archivo de bloqueo (`package-lock.json`) solo incluía la versión de Windows. Al borrarlo, Vercel descargará la versión correcta de Linux automáticamente.
