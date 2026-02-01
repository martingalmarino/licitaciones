/**
 * Ítems de la Biblioteca: checklists y pliegos inteligentes.
 * Datos demo offline para COFARSUR Tender Radar.
 */

export type LibraryItemType = 'CHECKLIST' | 'PLIEGO'

export interface LibraryItem {
  id: string
  type: LibraryItemType
  title: string
  description: string
  category: string
  tags: string[]
  audience: 'INTERNO' | 'CLIENTE' | 'AMBOS'
  sections: Array<{ heading: string; body: string }>
  steps: Array<{ id: string; label: string; group: string }>
  usageNotes?: string[]
}

export const LIBRARY_ITEMS: LibraryItem[] = [
  {
    id: 'checklist-base',
    type: 'CHECKLIST',
    title: 'Checklist base – Licitación pública estándar',
    description: 'Pasos mínimos para cualquier licitación pública en salud. Validación de plazos, documentación y criterios de adjudicación.',
    category: 'Procesos',
    tags: ['documentacion'],
    audience: 'INTERNO',
    sections: [
      { heading: 'Alcance', body: 'Aplica a licitaciones públicas nacionales o provinciales de medicamentos e insumos. No reemplaza checklists específicos (cadena de frío, ANMAT, etc.).' },
      { heading: 'Uso', body: 'Completar en paralelo al análisis del pliego. Marcar ítems a medida que se validan.' },
    ],
    steps: [
      { id: 'cb1', label: 'Verificar fechas de publicación, consultas y apertura', group: 'General' },
      { id: 'cb2', label: 'Identificar tipo de procedimiento y criterios de adjudicación', group: 'General' },
      { id: 'cb3', label: 'Revisar requisitos de habilitación (ANMAT, proveedor, etc.)', group: 'Documentación' },
      { id: 'cb4', label: 'Confirmar documentación exigida (certificados, garantías)', group: 'Documentación' },
      { id: 'cb5', label: 'Validar plazos de entrega y condiciones de pago', group: 'Operación' },
    ],
    usageNotes: ['Usar como base en toda licitación pública.', 'Combinar con checklist específico según categoría del producto.'],
  },
  {
    id: 'checklist-compra-centralizada',
    type: 'CHECKLIST',
    title: 'Checklist – Compra centralizada / Ministerio',
    description: 'Requisitos y pasos para procesos de compra centralizada o coordinada por ministerios de salud.',
    category: 'Procesos',
    tags: ['ministerio', 'compra_centralizada', 'documentacion'],
    audience: 'INTERNO',
    sections: [
      { heading: 'Contexto', body: 'Las compras centralizadas suelen tener plazos más largos, múltiples efectores y criterios de distribución. Validar alcance geográfico y responsabilidad de logística.' },
    ],
    steps: [
      { id: 'cc1', label: 'Identificar organismo coordinador y efectores incluidos', group: 'General' },
      { id: 'cc2', label: 'Revisar criterios de distribución y puntos de entrega', group: 'Logística' },
      { id: 'cc3', label: 'Verificar requisitos de facturación (centralizada vs por efector)', group: 'Documentación' },
      { id: 'cc4', label: 'Validar garantías y penalidades a nivel contrato marco', group: 'Finanzas' },
    ],
    usageNotes: ['Frecuente en vacunas y medicamentos de alto impacto epidemiológico.'],
  },
  {
    id: 'checklist-contratacion-directa',
    type: 'CHECKLIST',
    title: 'Checklist – Contratación directa / Emergencia',
    description: 'Control de procesos de contratación directa o por emergencia sanitaria. Plazos cortos y documentación simplificada.',
    category: 'Procesos',
    tags: ['contratacion_directa', 'plazo_corto'],
    audience: 'INTERNO',
    sections: [
      { heading: 'Alcance', body: 'Aplica cuando el organismo invoca excepción por urgencia o falta de oferentes. Verificar que la justificación esté documentada.' },
    ],
    steps: [
      { id: 'cd1', label: 'Confirmar fundamento legal de la contratación directa', group: 'General' },
      { id: 'cd2', label: 'Verificar plazos de presentación de oferta y vigencia', group: 'General' },
      { id: 'cd3', label: 'Revisar requisitos mínimos de documentación', group: 'Documentación' },
      { id: 'cd4', label: 'Validar condiciones de entrega y pago (urgencia)', group: 'Operación' },
    ],
    usageNotes: ['Plazos muy ajustados: priorizar ítems críticos.'],
  },
  {
    id: 'checklist-convenio-marco',
    type: 'CHECKLIST',
    title: 'Checklist – Convenio marco / Renovación',
    description: 'Pasos para adherencia o renovación bajo convenio marco existente.',
    category: 'Procesos',
    tags: ['convenio_marco', 'documentacion'],
    audience: 'AMBOS',
    sections: [
      { heading: 'Uso', body: 'Cuando la licitación es una adhesión a convenio marco o prórroga. Validar vigencia del marco y condiciones que se mantienen.' },
    ],
    steps: [
      { id: 'cm1', label: 'Verificar vigencia del convenio marco y pliego original', group: 'General' },
      { id: 'cm2', label: 'Revisar si hay modificaciones en precios o condiciones', group: 'Documentación' },
      { id: 'cm3', label: 'Confirmar requisitos de adhesión (documentación, plazos)', group: 'Documentación' },
    ],
  },
  {
    id: 'checklist-alto-costo',
    type: 'CHECKLIST',
    title: 'Checklist – Alto costo / Onco / biológicos',
    description: 'Control específico para medicamentos de alto costo, oncológicos y biológicos. ANMAT, trazabilidad y criterios clínicos.',
    category: 'Regulatorio',
    tags: ['alto_costo', 'anmat', 'uso_compasivo'],
    audience: 'INTERNO',
    sections: [
      { heading: 'Requisitos habituales', body: 'Estos pliegos suelen exigir certificación ANMAT, trazabilidad lote/serie, y a veces criterios de uso compasivo o protocolos clínicos.' },
    ],
    steps: [
      { id: 'ac1', label: 'Verificar certificación ANMAT vigente por producto', group: 'Regulatorio' },
      { id: 'ac2', label: 'Revisar requisitos de trazabilidad lote-serie', group: 'Regulatorio' },
      { id: 'ac3', label: 'Validar criterios de adjudicación (clínicos, económicos)', group: 'Documentación' },
      { id: 'ac4', label: 'Confirmar condiciones de conservación y cadena de frío si aplica', group: 'Logística' },
    ],
    usageNotes: ['Combinar con checklist ANMAT cuando se exija trazabilidad explícita.'],
  },
  {
    id: 'checklist-uso-compasivo',
    type: 'CHECKLIST',
    title: 'Checklist – Uso compasivo / especiales',
    description: 'Validación para medicamentos de uso compasivo o tratamientos especiales. Autorizaciones y documentación específica.',
    category: 'Regulatorio',
    tags: ['uso_compasivo', 'alto_costo', 'anmat'],
    audience: 'INTERNO',
    sections: [
      { heading: 'Contexto', body: 'Uso compasivo y tratamientos especiales requieren autorización ANMAT y a veces informes clínicos. Validar plazos de vigencia de autorizaciones.' },
    ],
    steps: [
      { id: 'uc1', label: 'Verificar autorización de uso compasivo o especial vigente', group: 'Regulatorio' },
      { id: 'uc2', label: 'Revisar documentación clínica exigida', group: 'Documentación' },
      { id: 'uc3', label: 'Confirmar trazabilidad y condiciones de almacenamiento', group: 'Regulatorio' },
    ],
  },
  {
    id: 'checklist-vacunas',
    type: 'CHECKLIST',
    title: 'Checklist – Vacunas / inmunizaciones',
    description: 'Pasos para licitaciones de vacunas e inmunizaciones. Cadena de frío, calendario y cobertura.',
    category: 'Logística',
    tags: ['vacunas', 'cadena_frio', 'ministerio'],
    audience: 'INTERNO',
    sections: [
      { heading: 'Enfoque', body: 'Vacunas del calendario nacional o campañas suelen incluir cadena de frío estricta, distribución multisede y plazos alineados con campañas.' },
    ],
    steps: [
      { id: 'v1', label: 'Validar requisitos de cadena de frío (temperatura, monitoreo)', group: 'Logística' },
      { id: 'v2', label: 'Revisar puntos de entrega y ventanas horarias', group: 'Logística' },
      { id: 'v3', label: 'Verificar documentación de inmunización y trazabilidad', group: 'Documentación' },
    ],
  },
  {
    id: 'checklist-insumos-criticos',
    type: 'CHECKLIST',
    title: 'Checklist – Insumos críticos hospitalarios',
    description: 'Control para insumos críticos: descartables, soluciones, material de sutura. Continuidad de stock y multisede.',
    category: 'Operación',
    tags: ['insumos_criticos', 'multisede', 'logistica'],
    audience: 'INTERNO',
    sections: [
      { heading: 'Riesgos frecuentes', body: 'Ruptura de stock y plazos de entrega parcial. Validar penalidades por incumplimiento y planes de contingencia.' },
    ],
    steps: [
      { id: 'ic1', label: 'Revisar requisitos de stock de seguridad y reposición', group: 'Operación' },
      { id: 'ic2', label: 'Validar distribución multisede si aplica', group: 'Logística' },
      { id: 'ic3', label: 'Verificar garantías y SLA de entrega', group: 'Finanzas' },
    ],
  },
  {
    id: 'checklist-cadena-frio',
    type: 'CHECKLIST',
    title: 'Checklist – Cadena de frío (end-to-end)',
    description: 'Validación de cadena de frío de punta a punta: embalaje, transporte, recepción y registro.',
    category: 'Logística',
    tags: ['cadena_frio', 'vacunas', 'logistica'],
    audience: 'INTERNO',
    sections: [
      { heading: 'Qué validar', body: 'Temperaturas exigidas (2–8 °C o -20 °C), tipo de embalaje, registros de temperatura, condiciones de recepción en el efector y procedimiento ante desvíos.' },
    ],
    steps: [
      { id: 'cf1', label: 'Confirmar rango de temperatura exigido por producto', group: 'General' },
      { id: 'cf2', label: 'Revisar especificaciones de embalaje y dispositivos de monitoreo', group: 'Logística' },
      { id: 'cf3', label: 'Validar registro de temperatura y conservación de evidencias', group: 'Documentación' },
      { id: 'cf4', label: 'Verificar procedimiento ante desvío o rotura de cadena', group: 'Operación' },
    ],
    usageNotes: ['Obligatorio para vacunas y biológicos que lo requieran.'],
  },
  {
    id: 'checklist-multisede',
    type: 'CHECKLIST',
    title: 'Checklist – Distribución multisede / efectores',
    description: 'Control para entregas en múltiples sedes o efectores. Ruteo, ventanas y responsables.',
    category: 'Logística',
    tags: ['multisede', 'logistica', 'ministerio'],
    audience: 'INTERNO',
    sections: [
      { heading: 'Enfoque', body: 'Identificar lista de efectores, direcciones, ventanas de recepción y responsables. Validar costos de distribución y penalidades por no entrega en alguna sede.' },
    ],
    steps: [
      { id: 'ms1', label: 'Listar efectores y direcciones de entrega', group: 'Logística' },
      { id: 'ms2', label: 'Confirmar ventanas horarias y responsables de recepción', group: 'Logística' },
      { id: 'ms3', label: 'Revisar criterios de ruteo y consolidación', group: 'Operación' },
    ],
  },
  {
    id: 'checklist-anmat',
    type: 'CHECKLIST',
    title: 'Checklist – ANMAT / trazabilidad lote-serie',
    description: 'Requisitos ANMAT y trazabilidad por lote y serie. Documentación de origen y habilitaciones.',
    category: 'Regulatorio',
    tags: ['anmat', 'alto_costo', 'documentacion'],
    audience: 'INTERNO',
    sections: [
      { heading: 'Qué validar', body: 'Certificación de producto vigente, documentación de lote/serie en facturación y entrega, y procedimientos de recall si se exigen.' },
    ],
    steps: [
      { id: 'an1', label: 'Verificar certificación ANMAT vigente por producto', group: 'Regulatorio' },
      { id: 'an2', label: 'Revisar exigencia de lote/serie en factura y remito', group: 'Documentación' },
      { id: 'an3', label: 'Confirmar procedimiento de recall o trazabilidad inversa', group: 'Operación' },
    ],
    usageNotes: ['Común en medicamentos de alto costo y vacunas.'],
  },
  {
    id: 'checklist-garantias',
    type: 'CHECKLIST',
    title: 'Checklist – Garantías + penalidades + SLA',
    description: 'Control de garantías, penalidades por incumplimiento y niveles de servicio (SLA).',
    category: 'Finanzas',
    tags: ['garantias', 'documentacion'],
    audience: 'INTERNO',
    sections: [
      { heading: 'Enfoque', body: 'Validar tipo y monto de garantía, plazos de entrega con penalidades, y SLA (por ejemplo disponibilidad, plazos de reposición).' },
    ],
    steps: [
      { id: 'g1', label: 'Identificar tipo de garantía (fiel cumplimiento, anticipo, etc.) y monto', group: 'Finanzas' },
      { id: 'g2', label: 'Revisar penalidades por demora o incumplimiento', group: 'Finanzas' },
      { id: 'g3', label: 'Validar SLA (plazos de entrega, stock, respuesta a reclamos)', group: 'Operación' },
    ],
  },
  // --- PLIEGOS INTELIGENTES (6) ---
  {
    id: 'pliego-alto-costo',
    type: 'PLIEGO',
    title: 'Pliego inteligente – Medicación alto costo',
    description: 'Plantilla de pliego para medicamentos de alto costo con cláusulas de ANMAT, trazabilidad y criterios de evaluación.',
    category: 'Regulatorio',
    tags: ['alto_costo', 'anmat', 'uso_compasivo'],
    audience: 'CLIENTE',
    sections: [
      { heading: 'Qué validar sí o sí', body: 'Certificación ANMAT vigente, trazabilidad lote-serie, criterios de adjudicación (económicos y/o clínicos) y condiciones de conservación.' },
      { heading: 'Fechas críticas', body: 'Vigencia de certificados, plazo de presentación de ofertas, fecha de apertura y plazo de vigencia del contrato.' },
      { heading: 'Documentación típica', body: 'Certificado ANMAT, autorización de uso compasivo si aplica, informes de estabilidad, y documentación de trazabilidad.' },
      { heading: 'Riesgos frecuentes', body: 'Desactualización de certificados, plazos cortos para documentación clínica, y criterios de evaluación poco claros.' },
      { heading: 'Mitigación recomendada', body: 'Incluir en el pliego checklist de documentación y criterios de desempate explícitos. Definir procedimiento ante vencimiento de certificados.' },
    ],
    steps: [
      { id: 'pa1', label: 'Verificar vigencia de certificación ANMAT', group: 'Regulatorio' },
      { id: 'pa2', label: 'Validar requisitos de trazabilidad en facturación', group: 'Documentación' },
      { id: 'pa3', label: 'Revisar criterios de adjudicación y desempate', group: 'General' },
    ],
    usageNotes: ['Adaptar según si es licitación abierta o contratación directa.'],
  },
  {
    id: 'pliego-vacunas-cadena-frio',
    type: 'PLIEGO',
    title: 'Pliego inteligente – Vacunas con cadena de frío',
    description: 'Plantilla para licitaciones de vacunas con requisitos estrictos de cadena de frío y distribución.',
    category: 'Logística',
    tags: ['vacunas', 'cadena_frio', 'ministerio', 'multisede'],
    audience: 'CLIENTE',
    sections: [
      { heading: 'Qué validar sí o sí', body: 'Rango de temperatura (2–8 °C o según producto), embalaje con monitoreo, registro de temperatura y condiciones de recepción en cada efector.' },
      { heading: 'Fechas críticas', body: 'Plazos de entrega por campaña, ventanas de recepción por sede y vigencia del contrato.' },
      { heading: 'Documentación típica', body: 'Protocolo de cadena de frío, certificados de calibración de equipos, registros de temperatura y evidencia de cumplimiento en cada entrega.' },
      { heading: 'Riesgos frecuentes', body: 'Ruptura de cadena por demoras o mal embalaje; rechazo en recepción por temperatura fuera de rango.' },
      { heading: 'Mitigación recomendada', body: 'Incluir cláusula de rechazo y procedimiento de reemplazo. Exigir embalaje con indicadores de temperatura.' },
    ],
    steps: [
      { id: 'pv1', label: 'Validar especificación de temperatura y embalaje', group: 'Logística' },
      { id: 'pv2', label: 'Revisar lista de efectores y ventanas de entrega', group: 'Logística' },
      { id: 'pv3', label: 'Confirmar procedimiento ante desvío de temperatura', group: 'Operación' },
    ],
  },
  {
    id: 'pliego-insumos-criticos',
    type: 'PLIEGO',
    title: 'Pliego inteligente – Insumos hospitalarios críticos',
    description: 'Plantilla para insumos críticos: descartables, soluciones, material de sutura. Stock y SLA.',
    category: 'Operación',
    tags: ['insumos_criticos', 'multisede', 'garantias'],
    audience: 'AMBOS',
    sections: [
      { heading: 'Qué validar sí o sí', body: 'Niveles de stock exigidos, plazos de entrega parcial y total, y penalidades por ruptura de stock.' },
      { heading: 'Fechas críticas', body: 'Plazo de vigencia, fechas de entrega parcial si las hay, y plazos de pago.' },
      { heading: 'Documentación típica', body: 'Certificados de calidad, fichas técnicas y documentación de trazabilidad si se exige.' },
      { heading: 'Riesgos frecuentes', body: 'Demoras en entregas que afectan stock del efector; criterios de adjudicación poco claros.' },
      { heading: 'Mitigación recomendada', body: 'Definir SLA claros y penalidades. Incluir cláusula de stock de seguridad si aplica.' },
    ],
    steps: [
      { id: 'pi1', label: 'Revisar requisitos de stock y plazos de entrega', group: 'Operación' },
      { id: 'pi2', label: 'Validar garantías y penalidades', group: 'Finanzas' },
    ],
  },
  {
    id: 'pliego-compra-centralizada',
    type: 'PLIEGO',
    title: 'Pliego inteligente – Compra centralizada (ministerio)',
    description: 'Plantilla para procesos de compra centralizada coordinados por ministerios. Distribución y facturación.',
    category: 'Procesos',
    tags: ['ministerio', 'compra_centralizada', 'multisede', 'documentacion'],
    audience: 'CLIENTE',
    sections: [
      { heading: 'Qué validar sí o sí', body: 'Organismo coordinador, lista de efectores, criterios de distribución, y si la facturación es centralizada o por efector.' },
      { heading: 'Fechas críticas', body: 'Vigencia del marco, plazos de adhesión y fechas de entrega por lote o por efector.' },
      { heading: 'Documentación típica', body: 'Pliego marco, anexos por producto o grupo, y formatos de orden de compra o adhesión.' },
      { heading: 'Riesgos frecuentes', body: 'Cambios de efectores durante la vigencia; plazos de pago largos por centralización.' },
      { heading: 'Mitigación recomendada', body: 'Incluir cláusula de modificación de efectores y plazos de pago explícitos.' },
    ],
    steps: [
      { id: 'pc1', label: 'Identificar coordinador y efectores', group: 'General' },
      { id: 'pc2', label: 'Validar criterios de distribución y facturación', group: 'Documentación' },
    ],
  },
  {
    id: 'pliego-multisede',
    type: 'PLIEGO',
    title: 'Pliego inteligente – Multisede (logística compleja)',
    description: 'Plantilla para licitaciones con distribución a múltiples sedes. Ruteo, ventanas y responsables.',
    category: 'Logística',
    tags: ['multisede', 'logistica', 'garantias'],
    audience: 'AMBOS',
    sections: [
      { heading: 'Qué validar sí o sí', body: 'Lista de sedes, direcciones, ventanas de recepción y responsables. Penalidades por no entrega en alguna sede.' },
      { heading: 'Fechas críticas', body: 'Fechas de entrega por sede o por lote; vigencia del contrato.' },
      { heading: 'Documentación típica', body: 'Plan de distribución, conformidad de recepción por sede y registros de entrega.' },
      { heading: 'Riesgos frecuentes', body: 'Rechazo por horario o responsable ausente; costos de distribución no contemplados.' },
      { heading: 'Mitigación recomendada', body: 'Definir ventanas claras y contacto por sede. Incluir cláusula de reprogramación con aviso.' },
    ],
    steps: [
      { id: 'pm1', label: 'Listar sedes y ventanas de entrega', group: 'Logística' },
      { id: 'pm2', label: 'Revisar penalidades y SLA por sede', group: 'Operación' },
    ],
  },
  {
    id: 'pliego-contratacion-directa',
    type: 'PLIEGO',
    title: 'Pliego inteligente – Contratación directa (urgencia)',
    description: 'Plantilla para contratación directa por urgencia. Plazos cortos y documentación simplificada.',
    category: 'Procesos',
    tags: ['contratacion_directa', 'plazo_corto'],
    audience: 'CLIENTE',
    sections: [
      { heading: 'Qué validar sí o sí', body: 'Fundamento de la excepción (urgencia, falta de oferentes), plazos de oferta y vigencia.' },
      { heading: 'Fechas críticas', body: 'Fecha límite de presentación de oferta y de entrega.' },
      { heading: 'Documentación típica', body: 'Resolución que autoriza la contratación directa, pliego simplificado y documentación básica del proveedor.' },
      { heading: 'Riesgos frecuentes', body: 'Plazos muy cortos; requisitos poco claros que retrasan la oferta.' },
      { heading: 'Mitigación recomendada', body: 'Redactar pliego corto con ítems esenciales. Incluir checklist de documentación mínima.' },
    ],
    steps: [
      { id: 'pd1', label: 'Verificar fundamento legal y plazos', group: 'General' },
      { id: 'pd2', label: 'Validar documentación mínima exigida', group: 'Documentación' },
    ],
  },
]
