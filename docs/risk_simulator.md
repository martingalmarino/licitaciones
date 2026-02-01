# Simulador de Riesgo

Evaluación de riesgo operativo y administrativo para procesos de compra sanitaria.

## Flujo de usuario

1. **Landing** (`/risk-simulator`): Descripción y botón "Iniciar evaluación"
2. **Wizard** (`/risk-simulator/wizard`): 3 pasos con formularios
3. **Resultado** (`/risk-simulator/result/:id`): Puntaje, módulos, top 3 riesgos, checklist
4. **Historial** (`/risk-simulator/history`): Listado de evaluaciones anteriores

## Módulos de scoring

| Módulo | Máx | Factores |
|--------|-----|----------|
| Plazos | 20 | Días hasta apertura |
| Logística | 25 | Cadena de frío, multisede, cobertura geográfica |
| Regulatorio | 20 | Categoría, trazabilidad/ANMAT |
| Administrativo | 20 | Documentación, garantías, penalidades |
| Financiero | 15 | Monto, plazos de pago |

**Ajuste por relación**: ±5 según historial con la institución.

## Checklist dinámico

Se generan ítems según las respuestas:

- **General**: Siempre (fechas, responsables, carpeta, alcance)
- **Documentación**: Si documentación Media o Alta
- **Garantías**: Si hay garantías
- **Cadena de frío**: Si cold_chain = Sí
- **ANMAT/Trazabilidad**: Si traceability_anmat = Sí
- **Multisede**: Si multisite = Sí
- **Finanzas**: Si payment_terms = 90+ días
- **Plazos**: Si days_to_open_range = <7

## API

Ver `README.md` sección Simulador de Riesgo.

## Tests

```bash
cd backend
pytest tests/test_risk_scoring.py -v
```
