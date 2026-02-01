# COFARSUR Tender Radar - Frontend

Frontend React + TypeScript para el radar de licitaciones.

## Requisitos

- Node.js 18 o superior
- npm o yarn

## Instalación

```bash
npm install
```

## Ejecución

### Modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Build de producción

```bash
npm run build
```

Los archivos compilados estarán en `dist/`

### Preview de producción

```bash
npm run preview
```

## Variables de Entorno

Crea un archivo `.env` en el directorio `frontend/` con:

```
VITE_API_URL=http://localhost:8000
```

Si no se especifica, se usa `http://localhost:8000` por defecto.

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── api/
│   │   └── client.ts        # Cliente API
│   ├── pages/
│   │   ├── Dashboard.tsx    # Página principal
│   │   └── TenderDetail.tsx # Detalle de licitación
│   ├── components/
│   │   ├── Filters.tsx      # Filtros
│   │   ├── TenderTable.tsx  # Tabla de licitaciones
│   │   └── ScoreBreakdown.tsx # Desglose de puntaje
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Punto de entrada
│   └── styles.css           # Estilos globales
├── index.html
└── package.json
```

## Características

- Dashboard con tabla de licitaciones
- Filtros por provincia, prioridad, estado, búsqueda
- Vista detallada de cada licitación
- Desglose de puntaje
- Gestión de estado, responsable y notas
- Creación de carpetas de proceso
