# Esquema de Base de Datos

## Tabla: `tenders`

Almacena todas las licitaciones recopiladas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | String (UUID) | ID único de la licitación |
| `source` | String | Fuente de datos (mock, comprar_gob_ar, etc.) |
| `external_id` | String | ID externo de la fuente original |
| `title` | String | Título de la licitación |
| `description` | Text | Descripción completa |
| `organization` | String | Organismo que publica la licitación |
| `province` | String | Provincia |
| `process_type` | String | Tipo de proceso (Licitación Pública, etc.) |
| `category` | String | Categoría (Medicamentos, Insumos, etc.) |
| `keywords` | Text (JSON) | Array de keywords extraídos |
| `publish_date` | Date | Fecha de publicación |
| `open_date` | Date | Fecha de apertura |
| `estimated_amount` | Float | Monto estimado |
| `url` | String | URL de la licitación original |
| `raw_payload` | Text (JSON) | Datos raw de la fuente |
| `status` | Enum | Estado: NEW, IN_REVIEW, DISCARDED, SUBMITTED, WON, LOST |
| `owner` | String | Responsable asignado |
| `notes` | Text | Notas internas |
| `score_total` | Integer | Puntaje total (0-90) |
| `score_breakdown` | Text (JSON) | Desglose detallado del puntaje |
| `priority` | Enum | Prioridad: HIGH, MEDIUM, LOW |
| `created_at` | DateTime | Fecha de creación |
| `updated_at` | DateTime | Fecha de última actualización |

**Índices:**
- `source`, `external_id` (composite, para upsert)
- `province`
- `open_date`
- `status`
- `priority`
- `score_total`

## Tabla: `source_runs`

Registra las ejecuciones de actualización de fuentes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | String (UUID) | ID único del run |
| `source` | String | Fuente ejecutada |
| `started_at` | DateTime | Inicio de la ejecución |
| `finished_at` | DateTime | Fin de la ejecución |
| `items_fetched` | Integer | Items obtenidos de la fuente |
| `items_inserted` | Integer | Items nuevos insertados |
| `items_updated` | Integer | Items existentes actualizados |
| `errors_count` | Integer | Cantidad de errores |
| `log_path` | String | Ruta al archivo de log (opcional) |

**Índices:**
- `source`
- `started_at`

## Relaciones

- No hay relaciones explícitas entre tablas (diseño desnormalizado para MVP)
- `tenders.source` referencia la fuente pero no es FK

## Consideraciones

- SQLite no soporta ENUMs nativamente, se usan strings con validación en la aplicación
- JSON se almacena como Text (SQLite no tiene tipo JSON nativo)
- UUIDs se almacenan como strings
