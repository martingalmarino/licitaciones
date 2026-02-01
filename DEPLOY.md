# Guía de Deploy - COFARSUR Tender Radar

Instrucciones para desplegar el MVP en GitHub, Vercel (frontend) y Render (backend).

---

## 1. Subir a GitHub

```bash
cd "/Users/martingalmarino/Desktop/COFARSUR Tender Radar"

# Inicializar repositorio
git init

# Agregar archivos
git add .

# Primer commit
git commit -m "MVP: COFARSUR Tender Radar - Radar de Licitaciones"

# Agregar remote y subir
git branch -M main
git remote add origin https://github.com/martingalmarino/licitaciones.git
git push -u origin main
```

Si ya tienes el repo con contenido, puede que necesites `git pull origin main --allow-unrelated-histories` antes de push.

---

## 2. Deploy del Frontend en Vercel

1. Entra a [vercel.com](https://vercel.com) e inicia sesión con GitHub.

2. **New Project** → Importa `martingalmarino/licitaciones`.

3. Configuración del proyecto:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (importante)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Environment Variables** (Variables de Entorno):
   | Variable        | Valor                               |
   |----------------|--------------------------------------|
   | `VITE_API_URL` | `https://tu-api.onrender.com`        |

   Reemplaza `tu-api.onrender.com` por la URL del backend en Render (paso 3).

5. Click en **Deploy**.

La app quedará en `https://tu-proyecto.vercel.app`.

---

## 3. Deploy del Backend en Render

1. Entra a [render.com](https://render.com) e inicia sesión con GitHub.

2. **New** → **Web Service**.

3. Conecta el repo `martingalmarino/licitaciones`.

4. Configuración:
   - **Name**: `cofarsur-tender-api`
   - **Region**: Oregon (o la más cercana)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

5. **Environment Variables**:
   | Variable          | Valor  |
   |-------------------|--------|
   | `CORS_ALLOW_ALL`  | `1`    |
   | `PYTHON_VERSION`  | `3.11.0` |

6. **Create Web Service**.

7. Espera a que termine el deploy. Copia la URL (ej: `https://cofarsur-tender-api.onrender.com`).

8. Carga datos iniciales:
   ```bash
   curl -X POST https://cofarsur-tender-api.onrender.com/admin/refresh
   ```

9. Actualiza en Vercel la variable `VITE_API_URL` con esta URL del backend.

---

## 4. Alternativa: Blueprint en Render

Si tienes un plan que lo permita, puedes usar el Blueprint:

1. **New** → **Blueprint**.
2. Conecta el repo.
3. Render usará `backend/render.yaml` para crear el servicio.

---

## Resumen de URLs

| Componente | URL típica |
|------------|------------|
| Frontend (Vercel) | `https://licitaciones-xxx.vercel.app` |
| Backend (Render)  | `https://cofarsur-tender-api.onrender.com` |
| API Docs          | `https://cofarsur-tender-api.onrender.com/docs` |

---

## Notas

- **SQLite en Render**: El tier gratuito no tiene disco persistente; los datos se pierden al redeploy. Ejecuta `/admin/refresh` tras cada deploy para volver a cargar las licitaciones mock.

- **CORS**: Con `CORS_ALLOW_ALL=1` el backend acepta peticiones desde cualquier origen (útil para demos). En producción conviene restringir orígenes.

- **Cold start en Render**: El primer request tras un tiempo sin tráfico puede tardar 30–50 segundos.
