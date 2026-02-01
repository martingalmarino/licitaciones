# COFARSUR Tender Radar - Backend

Backend API para el radar de licitaciones públicas de salud en Argentina.

## Requisitos

- Python 3.11 o superior
- pip

## Instalación

1. Crear un entorno virtual:

```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

2. Instalar dependencias:

```bash
pip install -r requirements.txt
```

## Ejecución

### Servidor de desarrollo

```bash
uvicorn app.main:app --reload
```

El servidor estará disponible en `http://localhost:8000`

### Documentación de la API

Una vez que el servidor esté corriendo, puedes acceder a:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Refrescar datos

Para cargar datos iniciales desde las fuentes configuradas:

### Opción 1: Endpoint HTTP

```bash
curl -X POST http://localhost:8000/admin/refresh
```

### Opción 2: Script Python

```bash
python -m app.refresh
```

## Estructura del Proyecto

```
backend/
├── app/
│   ├── main.py              # Aplicación FastAPI principal
│   ├── db.py                # Configuración de base de datos
│   ├── models.py            # Modelos SQLAlchemy
│   ├── schemas.py           # Esquemas Pydantic
│   ├── crud.py              # Operaciones CRUD
│   ├── scoring.py           # Lógica de scoring
│   ├── adapters/            # Adaptadores de fuentes
│   │   ├── base.py
│   │   ├── mock.py
│   │   └── comprar_stub.py
│   ├── services/            # Servicios
│   │   ├── refresh.py
│   │   └── folder_creator.py
│   ├── routers/             # Routers de la API
│   │   ├── tenders.py
│   │   └── admin.py
│   └── utils/               # Utilidades
│       ├── text.py
│       └── logging.py
├── data/                    # Datos estáticos
│   ├── mock_tenders.json
│   ├── catalog_keywords.json
│   └── accounts.json
└── tests/                   # Tests
    ├── test_scoring.py
    ├── test_upsert.py
    └── test_mock_adapter.py
```

## Variables de Entorno

Crea un archivo `.env` en el directorio `backend/` con:

```
DATABASE_URL=sqlite:///./tender_radar.db
```

## Tests

Ejecutar tests:

```bash
pytest
```

Ejecutar tests con cobertura:

```bash
pytest --cov=app
```

## Base de Datos

La base de datos SQLite se crea automáticamente al iniciar la aplicación. Se encuentra en `tender_radar.db` en el directorio raíz del backend.

Para reiniciar la base de datos, simplemente elimina el archivo `tender_radar.db` y reinicia la aplicación.
