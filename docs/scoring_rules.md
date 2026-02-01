# Reglas de Scoring

El sistema calcula un puntaje de 0 a 90 puntos para cada licitación, basado en 5 componentes.

## Componente A: Coincidencia de Catálogo (0-30 puntos)

Evalúa si la licitación menciona productos o categorías de interés.

### Keywords por Familia

Las keywords están organizadas en familias en `data/catalog_keywords.json`:
- `oncology`: oncológico, cáncer, quimioterapia, etc.
- `high_cost`: alto costo, medicamento de alto costo, etc.
- `hospital_supply`: insumos hospitalarios, material descartable, etc.
- `critical_meds`: medicamento crítico, uso compasivo, etc.
- `cold_chain`: cadena de frío, refrigeración, etc.
- `traceability`: trazabilidad, lote, serie, etc.
- `anmat`: anmat, registro nacional, etc.
- `import`: importación, importado, etc.
- `consolidated`: consolidada, multisede, etc.

### Puntaje

- 0 hits: 0 puntos
- 1-2 hits: 10 puntos
- 3-5 hits: 20 puntos
- >5 hits: 30 puntos

### Bonus

Si aparece "alto costo" o "uso compasivo": +5 puntos (máximo 30).

## Componente B: Complejidad Administrativa (0-20 puntos)

Evalúa requerimientos administrativos especiales que indican necesidad de expertise.

### Keywords

- Base: 5 puntos
- "importación": +5 puntos
- "trazabilidad": +5 puntos
- "cadena de frío": +5 puntos
- "multisede": +5 puntos
- "consolidada": +5 puntos
- "anmat": +5 puntos
- "lote": +2 puntos
- "serie": +2 puntos

**Máximo: 20 puntos**

## Componente C: Ventana de Tiempo (0-15 puntos)

Evalúa cuántos días faltan hasta la fecha de apertura.

### Puntaje

- ≥ 20 días: 15 puntos
- 10-19 días: 8 puntos
- 7-9 días: 4 puntos
- < 7 días: 0 puntos
- Sin fecha de apertura: 3 puntos

## Componente D: Tipo de Institución (0-15 puntos)

Evalúa el tipo de organismo que publica la licitación.

### Puntaje

- Contiene "Ministerio": 15 puntos
- Contiene "Hospital": 12 puntos
- Contiene "Municipalidad": 6 puntos
- Otro: 5 puntos

## Componente E: Relación (0-10 puntos)

Evalúa si el organismo es una cuenta conocida.

### Puntaje

- Organismo en lista como "habitual": 10 puntos
- Organismo en lista como "occasional": 5 puntos
- No está en lista: 0 puntos

La lista de cuentas está en `data/accounts.json`.

## Prioridad Final

Basada en el puntaje total:

- **HIGH** (Alta): ≥ 65 puntos
- **MEDIUM** (Media): 40-64 puntos
- **LOW** (Baja): < 40 puntos

## Ejemplo de Cálculo

**Licitación:**
- Título: "Medicamentos Oncológicos de Alto Costo con Trazabilidad"
- Organismo: "Hospital Rawson"
- Fecha apertura: 25 días desde hoy
- Keywords: oncológico, alto costo, trazabilidad

**Cálculo:**
- Catalog match: 3 hits (oncológico, alto costo) = 20 + bonus 5 = 25 (capped at 30) = **30**
- Complejidad: base 5 + trazabilidad 5 = **10**
- Tiempo: 25 días = **15**
- Institución: Hospital = **12**
- Relación: Hospital Rawson (habitual) = **10**

**Total: 30 + 10 + 15 + 12 + 10 = 77 puntos → HIGH**
