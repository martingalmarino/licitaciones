# Arquitectura del Sistema

## Visión General

El COFARSUR Tender Radar es una aplicación full-stack que sigue una arquitectura de tres capas:

1. **Capa de Datos**: SQLite con SQLAlchemy ORM
2. **Capa de Aplicación**: FastAPI (backend) + React (frontend)
3. **Capa de Presentación**: React Components

## Componentes Principales

### Backend

#### Modelos de Datos (`app/models.py`)
- `Tender`: Modelo principal para licitaciones
- `SourceRun`: Registro de ejecuciones de fuentes

#### Adaptadores de Fuentes (`app/adapters/`)
- `SourceAdapter`: Interfaz base para adaptadores
- `MockSourceAdapter`: Carga datos mock desde JSON
- `ComprarGobArAdapter`: Stub para comprar.gob.ar (pendiente implementación)

#### Sistema de Scoring (`app/scoring.py`)
- Función `score_tender()`: Calcula puntaje total y prioridad
- Componentes de scoring:
  - Catalog match
  - Administrative complexity
  - Time window
  - Institution type
  - Relationship

#### Servicios (`app/services/`)
- `refresh.py`: Orquesta la actualización de datos desde todas las fuentes
- `folder_creator.py`: Crea estructura de carpetas para procesos

#### API Routes (`app/routers/`)
- `tenders.py`: Endpoints para gestión de licitaciones
- `admin.py`: Endpoints administrativos (refresh, runs, folder creation)

### Frontend

#### Estructura de Componentes
- `App.tsx`: Componente raíz con routing básico
- `Dashboard.tsx`: Página principal con tabla y filtros
- `TenderDetail.tsx`: Vista detallada de una licitación
- `TenderTable.tsx`: Tabla de licitaciones
- `Filters.tsx`: Componente de filtros
- `ScoreBreakdown.tsx`: Visualización del desglose de puntaje

#### Cliente API (`src/api/client.ts`)
- Funciones para interactuar con el backend
- Tipos TypeScript para todas las entidades

## Flujo de Datos

### Actualización de Datos

1. Usuario o sistema llama a `POST /admin/refresh`
2. `refresh_all()` itera sobre todos los adapters
3. Cada adapter:
   - `fetch()` obtiene datos raw
   - `normalize()` convierte a `TenderCreate`
   - `upsert_tender()` guarda/actualiza en DB
   - `score_tender()` calcula puntaje
4. Se registra un `SourceRun` con estadísticas

### Visualización

1. Frontend llama a `GET /tenders` con filtros
2. Backend consulta DB con filtros aplicados
3. Retorna lista paginada de tenders
4. Frontend renderiza tabla

### Detalle de Licitación

1. Usuario hace click en una fila
2. Frontend llama a `GET /tenders/{id}`
3. Backend retorna tender completo con breakdown
4. Frontend muestra vista detallada

## Base de Datos

### Esquema

**tenders**
- Campos de identificación: id, source, external_id
- Campos de contenido: title, description, organization, etc.
- Campos operacionales: status, owner, notes
- Campos de scoring: score_total, score_breakdown, priority

**source_runs**
- Registro de ejecuciones de fuentes
- Estadísticas: items_fetched, items_inserted, items_updated, errors_count

### Upsert Logic

Las licitaciones se identifican únicamente por `(source, external_id)`. Si existe, se actualiza; si no, se crea.

## Seguridad

- CORS configurado para desarrollo local
- Validación de datos con Pydantic
- Sanitización de inputs

## Escalabilidad

### Limitaciones Actuales (MVP)
- SQLite (no concurrente para escrituras)
- Sin caché
- Sin cola de trabajos

### Mejoras Futuras
- Migrar a PostgreSQL
- Implementar Redis para caché
- Usar Celery para tareas asíncronas
- CDN para assets estáticos
