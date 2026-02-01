# COFARSUR Tender Radar

Sistema MVP para el monitoreo y análisis de licitaciones públicas de salud en Argentina.

## Descripción

El Radar de Licitaciones COFARSUR es una herramienta que:
- Recopila automáticamente licitaciones de múltiples fuentes
- Normaliza y almacena la información en una base de datos
- Calcula un puntaje de prioridad (0-90) basado en múltiples factores
- Proporciona un dashboard operacional para gestionar las licitaciones

## Arquitectura

El proyecto está dividido en dos componentes principales:

### Backend (FastAPI)
- API REST para gestionar licitaciones
- Sistema de scoring automatizado
- Adaptadores para múltiples fuentes de datos
- Base de datos SQLite

### Frontend (React + TypeScript)
- Dashboard interactivo
- Tabla de licitaciones con filtros
- Vista detallada con desglose de puntaje
- Gestión de estado y acciones

## Instalación Rápida

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Cargar Datos Iniciales

Una vez que el backend esté corriendo, ejecuta:

```bash
curl -X POST http://localhost:8000/admin/refresh
```

O desde Python:

```bash
cd backend
python -c "from app.services.refresh import refresh_all; from app.db import SessionLocal; import asyncio; asyncio.run(refresh_all(SessionLocal()))"
```

## Uso

1. **Iniciar backend**: `cd backend && uvicorn app.main:app --reload`
2. **Iniciar frontend**: `cd frontend && npm run dev`
3. **Abrir navegador**: `http://localhost:5173`
4. **Cargar datos**: Click en "Actualizar Datos" en el dashboard

## Sistema de Scoring

El sistema calcula un puntaje de 0 a 90 puntos basado en:

1. **Coincidencia de Catálogo** (0-30): Keywords relacionados con productos de interés
2. **Complejidad Administrativa** (0-20): Requerimientos especiales (importación, trazabilidad, etc.)
3. **Ventana de Tiempo** (0-15): Días hasta la fecha de apertura
4. **Tipo de Institución** (0-15): Ministerio, Hospital, Municipalidad, etc.
5. **Relación** (0-10): Cuentas habituales vs ocasionales

**Prioridades:**
- **ALTA**: ≥ 65 puntos
- **MEDIA**: 40-64 puntos
- **BAJA**: < 40 puntos

## Estructura del Proyecto

```
cofarsur-tender-radar/
├── backend/
│   ├── app/                 # Código de la aplicación
│   ├── data/                # Datos estáticos (mock, keywords, accounts)
│   ├── tests/               # Tests unitarios
│   └── requirements.txt
├── frontend/
│   ├── src/                 # Código fuente React
│   └── package.json
└── README.md
```

## Documentación Adicional

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [Arquitectura](docs/architecture.md)
- [Esquema de Base de Datos](docs/database_schema.md)
- [Reglas de Scoring](docs/scoring_rules.md)
- [Agregar Nueva Fuente](docs/adding_source.md)

## Variables de Entorno

### Backend
- `DATABASE_URL`: URL de la base de datos (default: `sqlite:///./tender_radar.db`)

### Frontend
- `VITE_API_URL`: URL del backend API (default: `http://localhost:8000`)

## Tests

```bash
# Backend
cd backend
pytest

# Con cobertura
pytest --cov=app
```

## Características Principales

- ✅ Recopilación automática de licitaciones
- ✅ Normalización de datos
- ✅ Sistema de scoring inteligente
- ✅ Dashboard operacional
- ✅ Filtros y búsqueda avanzada
- ✅ Gestión de estado y responsables
- ✅ Creación automática de carpetas de proceso
- ✅ API REST completa
- ✅ Tests unitarios

## Próximos Pasos

- [ ] Implementar adaptador completo para comprar.gob.ar
- [ ] Agregar más fuentes de datos
- [ ] Mejorar el modelo de scoring con ML
- [ ] Notificaciones automáticas
- [ ] Exportación de reportes
- [ ] Dashboard de analytics

## Licencia

Este es un proyecto MVP interno.
