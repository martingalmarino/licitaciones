# Agregar una Nueva Fuente de Datos

Para agregar una nueva fuente de datos, sigue estos pasos:

## 1. Crear el Adapter

Crea un nuevo archivo en `backend/app/adapters/` que implemente `SourceAdapter`:

```python
from app.adapters.base import SourceAdapter
from app.schemas import TenderCreate
from typing import List, Dict, Any

class MiNuevaFuenteAdapter(SourceAdapter):
    @property
    def name(self) -> str:
        return "mi_nueva_fuente"
    
    async def fetch(self) -> List[Dict[str, Any]]:
        """
        Obtiene los datos raw de la fuente.
        Puede ser:
        - HTTP request
        - Scraping HTML
        - Lectura de archivo
        - etc.
        """
        # Tu lógica aquí
        return []
    
    def normalize(self, raw_item: Dict[str, Any]) -> TenderCreate:
        """
        Convierte un item raw al esquema TenderCreate.
        """
        return TenderCreate(
            source=self.name,
            external_id=raw_item.get("id"),
            title=raw_item.get("title"),
            description=raw_item.get("description"),
            organization=raw_item.get("organization"),
            province=raw_item.get("province"),
            # ... otros campos
        )
```

## 2. Registrar el Adapter

Agrega el adapter a la lista en `backend/app/services/refresh.py`:

```python
from app.adapters.mi_nueva_fuente import MiNuevaFuenteAdapter

ADAPTERS: List[SourceAdapter] = [
    MockSourceAdapter(),
    ComprarGobArAdapter(),
    MiNuevaFuenteAdapter(),  # Agregar aquí
]
```

## 3. Implementar la Lógica de Fetch

### Opción A: API HTTP

```python
import httpx

async def fetch(self) -> List[Dict[str, Any]]:
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.ejemplo.com/tenders")
        return response.json()
```

### Opción B: Scraping HTML

```python
from bs4 import BeautifulSoup
import httpx

async def fetch(self) -> List[Dict[str, Any]]:
    async with httpx.AsyncClient() as client:
        response = await client.get("https://ejemplo.com/tenders")
        soup = BeautifulSoup(response.text, 'html.parser')
        # Parsear HTML y extraer datos
        items = []
        for element in soup.find_all('div', class_='tender'):
            items.append({
                'title': element.find('h2').text,
                # ... más campos
            })
        return items
```

### Opción C: Archivo Local

```python
import json
from pathlib import Path

async def fetch(self) -> List[Dict[str, Any]]:
    data_path = Path(__file__).parent.parent.parent / "data" / "mi_fuente.json"
    with open(data_path, 'r', encoding='utf-8') as f:
        return json.load(f)
```

## 4. Normalizar los Datos

Asegúrate de mapear todos los campos posibles al esquema `TenderCreate`:

```python
def normalize(self, raw_item: Dict[str, Any]) -> TenderCreate:
    # Parsear fechas si vienen como string
    open_date = None
    if raw_item.get("open_date"):
        from datetime import datetime
        open_date = datetime.fromisoformat(raw_item["open_date"]).date()
    
    # Generar external_id si no existe
    external_id = raw_item.get("id") or generate_external_id(
        raw_item.get("title", ""),
        raw_item.get("organization", ""),
        raw_item.get("open_date", "")
    )
    
    return TenderCreate(
        source=self.name,
        external_id=external_id,
        title=raw_item.get("title", ""),
        description=raw_item.get("description"),
        organization=raw_item.get("organization", ""),
        province=raw_item.get("province"),
        process_type=raw_item.get("process_type"),
        category=raw_item.get("category"),
        keywords=raw_item.get("keywords", []),
        publish_date=publish_date,
        open_date=open_date,
        estimated_amount=raw_item.get("estimated_amount"),
        url=raw_item.get("url"),
        raw_payload=raw_item
    )
```

## 5. Manejar Errores

Incluye manejo de errores robusto:

```python
async def fetch(self) -> List[Dict[str, Any]]:
    try:
        # Tu lógica aquí
        return items
    except Exception as e:
        logger.error(f"Error fetching from {self.name}: {e}")
        return []  # Retornar lista vacía en caso de error
```

## 6. Testing

Crea tests para tu adapter en `backend/tests/test_mi_nueva_fuente.py`:

```python
import pytest
from app.adapters.mi_nueva_fuente import MiNuevaFuenteAdapter

@pytest.mark.asyncio
async def test_mi_nueva_fuente_fetch():
    adapter = MiNuevaFuenteAdapter()
    items = await adapter.fetch()
    assert len(items) > 0

@pytest.mark.asyncio
async def test_mi_nueva_fuente_normalize():
    adapter = MiNuevaFuenteAdapter()
    items = await adapter.fetch()
    if items:
        normalized = adapter.normalize(items[0])
        assert normalized.source == "mi_nueva_fuente"
```

## 7. Documentación

Actualiza la documentación con:
- Descripción de la fuente
- Frecuencia de actualización recomendada
- Campos disponibles
- Limitaciones conocidas

## Ejemplo Completo

Ver `backend/app/adapters/mock.py` para un ejemplo completo de implementación.
