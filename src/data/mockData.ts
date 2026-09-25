import { FormatDefinition, ErpSampleRecord, InspectionRecord } from '../types';

export const INITIAL_FORMATS: FormatDefinition[] = [
  {
    id: 'for-com-01',
    code: 'FOR-COM-01',
    title: 'Orden y Requisición de Compra de Materiales',
    area: 'Logística',
    description: 'Paso 1 del Flujo Secuencial: Generación formal de orden de compra (PO) para suministro de materias primas o insumos, especificaciones técnicas, fecha pactada y proveedor homologado.',
    iconName: 'shopping-cart',
    erpConnected: true,
    estimatedMinutes: 2.5,
    tags: ['Secuencia: Paso 1', 'Compra', 'Proveedores', 'Requisición'],
    workflowPhase: 'compra',
    sequenceStepNumber: 1,
    nextFormatId: 'for-cal-04',
    erpPrefilledFields: [
      'Catálogo de Proveedores Homologados',
      'Código de Material SAP / Número de Parte',
      'Centro de Costos y Planta Destino',
      'Presupuesto Autorizado'
    ],
    fieldsToComplete: [
      'N° Orden de Compra (PO)',
      'Proveedor y Razón Social',
      'Cantidad Solicitada y Unidad',
      'Especificación Técnica Requerida',
      'Fecha Programada de Entrega',
      'Firma del Responsable de Compras'
    ]
  },
  {
    id: 'for-cal-04',
    code: 'FOR-CAL-04',
    title: 'Inspección Física al Recibir Producto',
    area: 'Calidad',
    description: 'Paso 2 del Flujo Secuencial: Verificación física y dimensional en andén al recibir el producto de la compra (FOR-COM-01). Valida cantidades recibidas vs compradas, estado del embalaje y metrología.',
    iconName: 'microscope',
    erpConnected: true,
    estimatedMinutes: 2,
    tags: ['Secuencia: Paso 2', 'Recepción', 'Inspección Física', 'Metrología'],
    workflowPhase: 'inspeccion',
    sequenceStepNumber: 2,
    previousFormatId: 'for-com-01',
    nextFormatId: 'for-dev-01',
    erpPrefilledFields: [
      'Orden de Compra Previa (FOR-COM-01 / SAP)',
      'Código y Razón Social Proveedor',
      'Número de Parte SAP',
      'Lote del Fabricante / Colada',
      'Cantidad Esperada Teórica Comprada',
      'Especificación Técnica y Tolerancia'
    ],
    fieldsToComplete: [
      'Cantidad Real Recibida en Báscula/Conteo',
      'Estado General del Embalaje',
      'Checklist Rápido Técnico (Espesor, Certificado, Superficie)',
      'Medición Vernier / Calibrador',
      'Evidencias Fotográficas',
      'Firma Digital de Supervisor'
    ]
  },
  {
    id: 'for-dev-01',
    code: 'FOR-DEV-01',
    title: 'Acta de Devolución y Rechazo a Proveedor',
    area: 'Calidad',
    description: 'Paso 3 del Flujo Secuencial: Emisión oficial de devolución de material cuando la inspección física (FOR-CAL-04) detecta daño de embalaje, desviación de medidas o no conformidad.',
    iconName: 'undo-2',
    erpConnected: true,
    estimatedMinutes: 2,
    tags: ['Secuencia: Paso 3', 'Devolución', 'Rechazo', 'Cuarentena', 'Garantía'],
    workflowPhase: 'devolucion',
    sequenceStepNumber: 3,
    previousFormatId: 'for-cal-04',
    erpPrefilledFields: [
      'Folio de Inspección Física Previa Rechazada',
      'N° Orden de Compra Original (PO)',
      'Proveedor Responsable',
      'Lote / Colada No Conforme',
      'Cantidad Total Recibida Afectada'
    ],
    fieldsToComplete: [
      'Cantidad Total a Devolver',
      'Motivo Detallado de Devolución y Rechazo',
      'Acción Solicitada (Reposición Urgente / Nota de Crédito)',
      'Línea Transportista de Retorno y Guía',
      'Evidencias Fotográficas del Daño',
      'Firma de Aprobación de Salida'
    ]
  },
  {
    id: 'for-alm-01',
    code: 'FOR-ALM-01',
    title: 'Recepción de Almacén General',
    area: 'Almacén',
    description: 'Ingreso de insumos mediante orden de compra (PO), pesaje en rampa y asignación de bahía de descarga.',
    iconName: 'clipboard',
    erpConnected: true,
    estimatedMinutes: 2,
    tags: ['Ingreso', 'Báscula', 'Ubicación', 'Almacén Central'],
    erpPrefilledFields: [
      'N° de Orden de Compra',
      'Nombre de Proveedor',
      'Fecha Programada Entrega',
      'Línea de Artículos SAP',
      'Ubicación Sugerida de Bahía'
    ],
    fieldsToComplete: [
      'N° Factura / Remisión Física',
      'Pesaje Bruto de Báscula',
      'Precintos de Seguridad Verificados',
      'Ubicación de Rack Asignada',
      'Firma Almacenista'
    ]
  },
  {
    id: 'for-alm-08',
    code: 'FOR-ALM-08',
    title: 'Despacho a Planta',
    area: 'Producción',
    description: 'Suministro rápido de componentes a líneas de armado según orden de trabajo y kits de ensamble.',
    iconName: 'cog',
    erpConnected: true,
    estimatedMinutes: 1.5,
    tags: ['Producción', 'Línea de Ensamble', 'Kitting', 'Materiales'],
    erpPrefilledFields: [
      'Orden de Fabricación (OF)',
      'Línea de Producción Asignada',
      'Kit de Componentes SAP',
      'Cantidad Programada por Turno',
      'Supervisor Solicitante'
    ],
    fieldsToComplete: [
      'Hora de Entrega en Línea',
      'Cantidad de Bines Entregados',
      'Confirmación de Código de Lote',
      'Firma Líder de Línea'
    ]
  },
  {
    id: 'for-log-11',
    code: 'FOR-LOG-11',
    title: 'Registro de Ventas y Embarques',
    area: 'Ventas',
    description: 'Checklist final de embalaje, remisión y verificación de precintos vehiculares para entrega a clientes.',
    iconName: 'truck',
    erpConnected: true,
    estimatedMinutes: 3,
    tags: ['Logística', 'Embarques', 'Transporte', 'Cliente'],
    erpPrefilledFields: [
      'N° Pedido de Venta / NV',
      'Cliente Destinatario',
      'Línea Transportista Asignada',
      'Pallets Totales Programados',
      'Dirección de Entrega'
    ],
    fieldsToComplete: [
      'Placas de Tractor y Remolque',
      'Nombre del Conductor y Licencia',
      'N° de Precinto de Seguridad Metálico',
      'Firma de Salida'
    ]
  },
  {
    id: 'for-cal-09',
    code: 'FOR-CAL-09',
    title: 'Reporte de Incumplimiento y No Conformidad',
    area: 'Calidad',
    description: 'Apertura inmediata de desviación de calidad, cuarentena y contención de producto no conforme.',
    iconName: 'shield',
    erpConnected: true,
    estimatedMinutes: 3,
    tags: ['Calidad', 'Cuarentena', 'Rechazo', 'Auditoría'],
    erpPrefilledFields: [
      'Lote Afectado',
      'Referencia de Pieza',
      'Estación de Detección'
    ],
    fieldsToComplete: [
      'Piezas Rechazadas',
      'Tipo de Defecto Principal',
      'Disposición de Material',
      'Colocación de Etiqueta Roja Cuarentena'
    ]
  }
];

export const ERP_RECORDS: ErpSampleRecord[] = [
  {
    id: 'erp-98421',
    code: 'PO-98421-MX',
    type: 'PO',
    title: 'Barras de Acero Redondo Calibrado 12.7mm',
    supplierOrClient: 'Acero y Aleaciones Industriales S.A.',
    supplierCode: 'PRV-40892',
    materialCode: 'NP-STEEL-8840-HD',
    materialName: 'Barra acero aleado SAE 1045 decapado',
    expectedQuantity: 100,
    unit: 'piezas',
    specification: 'SAE 1045 / Tolerancia calibrador 12.7mm ±0.05',
    warehouseLocation: 'Planta Norte - Nave B - Bahía 4',
    orderDate: '2024-10-24',
    heatOrLot: 'LOT-2024-889',
    remissionGuide: 'GR-2024-912'
  },
  {
    id: 'erp-98310',
    code: 'PO-98310',
    type: 'PO',
    title: 'Válvulas de Mariposa 2" ANSI 150',
    supplierOrClient: 'Tubos y Válvulas del Norte S.A.',
    supplierCode: 'PRV-33104',
    materialCode: 'MAT-VAL-201',
    materialName: 'Válvula bridada acero inoxidable 316',
    expectedQuantity: 80,
    unit: 'piezas',
    specification: 'ASTM A351 CF8M / Presión máx 250 PSI',
    warehouseLocation: 'Almacén General - Rampa 1',
    orderDate: '2024-10-24',
    heatOrLot: 'LOTE-VAL-552',
    remissionGuide: 'GR-2024-884'
  },
  {
    id: 'erp-nv10492',
    code: 'NV-10492',
    type: 'EMBARQUE',
    title: 'Despacho de Módulos Electrónicos E-Series',
    supplierOrClient: 'Distribuidora Automotriz del Bajío',
    supplierCode: 'CLI-99014',
    materialCode: 'FIN-PWR-099',
    materialName: 'Módulo de potencia automotriz certificado',
    expectedQuantity: 320,
    unit: 'unidades',
    specification: 'ISO 9001 / Certificado de Calidad Adjunto',
    warehouseLocation: 'Ventas / Logística - Rampa 2',
    orderDate: '2024-10-23',
    heatOrLot: 'LOTE-MOD-2024-B',
    remissionGuide: 'REM-EXP-441'
  },
  {
    id: 'erp-97992',
    code: 'PO-97992',
    type: 'PO',
    title: 'Resina Polimérica Grado Inyección HD-400',
    supplierOrClient: 'Polímeros Industriales S.A.',
    supplierCode: 'PRV-21099',
    materialCode: 'RES-POL-400',
    materialName: 'Pellets polietileno virgen alta densidad',
    expectedQuantity: 5000,
    unit: 'kg',
    specification: 'Dureza requerida: 65 Shore D / Norma ASTM D2240',
    warehouseLocation: 'Calidad - Línea 3 (Silo Q-2)',
    orderDate: '2024-10-23',
    heatOrLot: 'LOT-POL-992',
    remissionGuide: 'GR-2024-740'
  }
];

export const INITIAL_INSPECTIONS: InspectionRecord[] = [
  {
    id: 'rec-com-0512',
    folio: 'REG-COM-2024-0512',
    formatId: 'for-com-01',
    formatTitle: 'Orden y Requisición de Compra de Materiales',
    formatCode: 'FOR-COM-01',
    workflowPhase: 'compra',
    sequenceStepNumber: 1,
    reference: 'PO-98421-MX',
    supplier: 'Acero y Aleaciones Industriales S.A.',
    area: 'Logística • Compras',
    timestamp: '08:30',
    date: '22 Oct 2024',
    status: 'Completado',
    operatorName: 'Lic. Mariana Valdez',
    operatorEmployeeId: 'EMP-29104',
    operatorRole: 'Coordinadora de Adquisiciones',
    revisionNumber: '0',
    project: 'TRABADORES DE SEGURIDAD PARA MANDOS',
    client: 'AK Drilling International S.A.',
    technicalSpecs: 'SAE 1045 / Calibrado 12.7mm ±0.05 con Certificado de Molino',
    purchaseDetails: {
      requestedDeliveryDate: '24 Oct 2024',
      costCenter: 'CC-NAVE-B-MANDOS',
      priority: 'Alta',
      buyerName: 'Lic. Mariana Valdez',
      totalAmountUsd: 14850
    },
    erpData: {
      supplierCode: 'PRV-40892',
      purchaseOrder: 'PO-98421-MX',
      partNumber: 'NP-STEEL-8840-HD',
      expectedQty: 100,
      unit: 'pzas',
      spec: 'SAE 1045 / Calibración 12.7mm ±0.05',
      location: 'Planta Norte - Nave B - Bahía 4'
    },
    capturedData: {
      actualQty: 100,
      packagingCondition: 'Excelente',
      visualInspectionPassed: true,
      dimensionCompliance: true,
      qualityCertAttached: true,
      technicalChecklist: {
        thicknessVerified: true,
        millCertVerified: true,
        visualInspectionFreeRust: true
      },
      observations: 'Orden de compra autorizada por dirección de planta. Proveedor se compromete a entrega con certificados de colada.'
    },
    discrepancy: {
      hasDiscrepancy: false,
      differenceQty: 0,
      percentageDiff: '0%',
      authorized: true
    },
    tableItems: [
      {
        item: 1,
        receiptDate: '22/10/2024',
        materialDescription: 'Barra acero aleado SAE 1045 Ø 12.7mm x 3m',
        qty: 100,
        supplier: 'Acero y Aleaciones Industriales S.A.',
        heatOrLot: 'PROG-OCT-2024',
        qualityCert: 'REQUERIDO',
        remissionGuide: 'PRE-OC-98421',
        purchaseOrder: 'PO-98421-MX',
        finalResult: 'APROBADO'
      }
    ],
    evidences: [
      {
        id: 'evi-com-1',
        title: 'Cotización técnica autorizada y orden de compra',
        timestamp: '22 Oct 2024 • 08:30',
        location: 'Oficinas Administrativas Compras',
        imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80',
        fileName: 'orden_compra_po98421.png',
        fileSize: '620 KB',
        fileType: 'image/png'
      }
    ],
    timeline: [
      {
        id: 't-com-1',
        title: 'Requisición de compra generada',
        description: 'Creada por Lic. Mariana Valdez para producción Nave B',
        timestamp: '2024-10-22 08:15:00',
        timeFormatted: '08:15',
        actor: 'Lic. Mariana Valdez',
        actorRole: 'Compradora Senior',
        type: 'create'
      },
      {
        id: 't-com-2',
        title: 'Orden de compra PO-98421-MX emitida',
        description: 'Enviada electrónicamente al proveedor Acero y Aleaciones Industriales',
        timestamp: '2024-10-22 08:30:00',
        timeFormatted: '08:30',
        actor: 'SAP MM Purchase Engine',
        actorRole: 'Servicio Central',
        type: 'erp_sync'
      }
    ],
    signatures: {
      inspector: {
        name: 'Lic. Mariana Valdez',
        role: 'Coordinadora de Adquisiciones',
        date: '22/10/2024',
        confirmed: true
      }
    }
  },
  {
    id: 'rec-1042',
    folio: 'REG-CAL-2024-1042',
    formatId: 'for-cal-04',
    formatTitle: 'Inspección Física al Recibir Producto',
    formatCode: 'FOR-CAL-04',
    workflowPhase: 'inspeccion',
    sequenceStepNumber: 2,
    linkedPurchaseOrder: 'PO-98421-MX',
    reference: 'PO-98421-MX',
    supplier: 'Acero y Aleaciones Industriales',
    area: 'Calidad • Nave B',
    timestamp: '10:45',
    date: '24 Oct 2024',
    status: 'Completado',
    operatorName: 'Ing. Carlos Mendoza',
    operatorEmployeeId: 'EMP-40921',
    operatorRole: 'Supervisor de Calidad - Planta Norte',
    revisionNumber: '0',
    project: 'TRABADORES DE SEGURIDAD PARA MANDOS',
    client: 'AK Drilling International S.A.',
    technicalSpecs: 'MAQUINA AK W02 / Tolerancia 12.7mm',
    erpData: {
      supplierCode: 'PRV-40892',
      purchaseOrder: 'PO-98421-MX',
      partNumber: 'NP-STEEL-8840-HD',
      expectedQty: 100,
      unit: 'pzas',
      spec: 'SAE 1045 / Calibración 12.7mm ±0.05',
      location: 'Planta Norte - Nave B - Bahía 4',
      heatOrLot: 'LOT-2024-889',
      remissionGuide: 'GR-2024-912'
    },
    capturedData: {
      actualQty: 150,
      packagingCondition: 'Excelente',
      thicknessMeasured: '12.7 mm',
      visualInspectionPassed: true,
      dimensionCompliance: true,
      qualityCertAttached: true,
      technicalChecklist: {
        thicknessVerified: true,
        millCertVerified: true,
        visualInspectionFreeRust: true
      },
      observations: 'Se reciben 50 piezas adicionales previamente autorizadas por jefatura de planta según requerimiento de ensamble Nave B.',
      discrepancyNote: 'Diferencia de volumen autorizada: Se ingresaron 150 piezas en planta con respaldo de la adenda de compras OC-128 sin afectación al flujo productivo.'
    },
    discrepancy: {
      hasDiscrepancy: true,
      differenceQty: 50,
      percentageDiff: '+50%',
      reason: 'Adenda de compras OC-128 aprobada para remanente de ensamblaje en Nave B.',
      authorized: true
    },
    tableItems: [
      {
        item: 1,
        receiptDate: '24/10/2024',
        materialDescription: 'Barra redonda acero SAE 1045 Ø 12.7mm x 3m',
        qty: 150,
        supplier: 'Acero y Aleaciones Industriales',
        heatOrLot: 'LOT-2024-889',
        qualityCert: 'CUMPLE',
        remissionGuide: 'GR-2024-912',
        purchaseOrder: 'PO-98421-MX',
        finalResult: 'APROBADO'
      },
      {
        item: 2,
        receiptDate: '24/10/2024',
        materialDescription: 'Bujes de sujeción para trabador W02',
        qty: 150,
        supplier: 'Acero y Aleaciones Industriales',
        heatOrLot: 'COL-772-B',
        qualityCert: 'CUMPLE',
        remissionGuide: 'GR-2024-912',
        purchaseOrder: 'PO-98421-MX',
        finalResult: 'APROBADO'
      }
    ],
    evidences: [
      {
        id: 'evi-1',
        title: 'Lote de barras de acero recibido',
        timestamp: '24 Oct 2024 • 10:41',
        location: 'Nave B • Bahía 4',
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80'
      },
      {
        id: 'evi-2',
        title: 'Calibración de espesor 12.7mm',
        timestamp: '24 Oct 2024 • 10:42',
        location: 'Laboratorio de Metrología',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'
      }
    ],
    timeline: [
      {
        id: 't-1',
        title: 'Registro iniciado en recepción',
        description: 'Creado por Diana Silva (Terminal T-04 Almacén)',
        timestamp: '2024-10-24 10:15:00',
        timeFormatted: '10:15',
        actor: 'Diana Silva',
        actorRole: 'Operador de Báscula',
        type: 'create'
      },
      {
        id: 't-2',
        title: 'Precarga automática desde ERP',
        description: 'Datos sincronizados con Orden de Compra PO-98421-MX',
        timestamp: '2024-10-24 10:16:12',
        timeFormatted: '10:16',
        actor: 'SAP S/4HANA Gateway',
        actorRole: 'Servicio Central',
        type: 'erp_sync'
      },
      {
        id: 't-3',
        title: 'Inspección física y metrología',
        description: 'Realizada por Ing. Carlos Mendoza - Espesor verificado 12.7mm',
        timestamp: '2024-10-24 10:32:45',
        timeFormatted: '10:32',
        actor: 'Ing. Carlos Mendoza',
        actorRole: 'Supervisor de Calidad',
        type: 'inspection'
      },
      {
        id: 't-4',
        title: 'Folio sellado y completado',
        description: 'Firma conforme del supervisor - Sincronización exitosa con servidor central',
        timestamp: '2024-10-24 10:45:00',
        timeFormatted: '10:45',
        actor: 'Ing. Carlos Mendoza',
        actorRole: 'Supervisor de Calidad',
        type: 'signature'
      }
    ],
    signatures: {
      inspector: {
        name: 'Ing. Carlos Mendoza',
        role: 'QA/QC - AK Drilling / Planta Norte',
        date: '24/10/2024',
        confirmed: true
      },
      plantManager: {
        name: 'Ing. Roberto Salgado',
        role: 'Jefe de Planta',
        date: '24/10/2024',
        confirmed: true
      },
      qaManager: {
        name: 'Ing. Javier Morales',
        role: 'Jefe de Fabricaciones',
        date: '24/10/2024',
        confirmed: true
      }
    }
  },
  {
    id: 'rec-0985',
    folio: 'REG-ALM-2024-0985',
    formatId: 'for-alm-01',
    formatTitle: 'Recepción de Almacén',
    formatCode: 'FOR-ALM-01',
    reference: 'PO-98310',
    supplier: 'Tubos y Válvulas del Norte S.A.',
    area: 'Almacén General',
    timestamp: '09:15',
    date: '24 Oct 2024',
    status: 'En Proceso',
    operatorName: 'Rodrigo Gómez',
    operatorEmployeeId: 'EMP-38820',
    operatorRole: 'Almacenista Turno Matutino',
    revisionNumber: '2',
    project: 'LÍNEA DE CONDENSADOS PLANTA SUR',
    client: 'Industrial Tubing Corp',
    technicalSpecs: 'ASTM A351 CF8M',
    erpData: {
      supplierCode: 'PRV-33104',
      purchaseOrder: 'PO-98310',
      partNumber: 'MAT-VAL-201',
      expectedQty: 80,
      unit: 'pzas',
      spec: 'Presión máx 250 PSI',
      location: 'Almacén General - Rampa 1',
      heatOrLot: 'LOTE-VAL-552',
      remissionGuide: 'GR-2024-884'
    },
    capturedData: {
      actualQty: 80,
      packagingCondition: 'Aceptable',
      visualInspectionPassed: true,
      dimensionCompliance: true,
      qualityCertAttached: true,
      technicalChecklist: {
        thicknessVerified: true,
        millCertVerified: true,
        visualInspectionFreeRust: true
      },
      observations: 'En pesaje de tarimas. Pendiente validación de empaque 4.'
    },
    discrepancy: {
      hasDiscrepancy: false,
      differenceQty: 0,
      percentageDiff: '0%',
      authorized: true
    },
    tableItems: [
      {
        item: 1,
        receiptDate: '24/10/2024',
        materialDescription: 'Válvula bridada acero inoxidable 316 2" ANSI 150',
        qty: 80,
        supplier: 'Tubos y Válvulas del Norte S.A.',
        heatOrLot: 'LOTE-VAL-552',
        qualityCert: 'CUMPLE',
        remissionGuide: 'GR-2024-884',
        purchaseOrder: 'PO-98310',
        finalResult: 'APROBADO'
      }
    ],
    evidences: [
      {
        id: 'evi-3',
        title: 'Tarimas descargadas en rampa 1',
        timestamp: '24 Oct 2024 • 09:10',
        location: 'Rampa de Descarga Almacén',
        imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80'
      }
    ],
    timeline: [
      {
        id: 't-21',
        title: 'Recepción iniciada en rampa',
        description: 'Descarga en rampa de acceso',
        timestamp: '2024-10-24 09:05:00',
        timeFormatted: '09:05',
        actor: 'Rodrigo Gómez',
        actorRole: 'Almacenista',
        type: 'create'
      },
      {
        id: 't-22',
        title: 'Precarga desde orden PO-98310',
        description: 'Sincronización con módulo SAP MM',
        timestamp: '2024-10-24 09:06:00',
        timeFormatted: '09:06',
        actor: 'SAP MM Gateway',
        actorRole: 'Servicio Central',
        type: 'erp_sync'
      }
    ],
    signatures: {
      inspector: {
        name: 'Rodrigo Gómez',
        role: 'Almacenista Turno A',
        date: '24/10/2024',
        confirmed: false
      }
    }
  },
  {
    id: 'rec-0412',
    folio: 'REG-VEN-2024-0412',
    formatId: 'for-log-11',
    formatTitle: 'Registro de Ventas',
    formatCode: 'FOR-LOG-11',
    reference: 'NV-10492',
    supplier: 'Distribuidora Automotriz del Bajío',
    area: 'Ventas / Logística',
    timestamp: '16:30',
    date: '23 Oct 2024',
    status: 'Completado',
    operatorName: 'Marcos Rentería',
    operatorEmployeeId: 'EMP-31002',
    operatorRole: 'Coordinador de Embarques',
    revisionNumber: '1',
    project: 'SUMINISTRO TRIMESTRAL DE ENSAMBLE',
    client: 'Distribuidora Automotriz del Bajío',
    technicalSpecs: 'ISO 9001 / Certificado de Calidad Adjunto',
    erpData: {
      supplierCode: 'CLI-99014',
      purchaseOrder: 'NV-10492',
      partNumber: 'FIN-PWR-099',
      expectedQty: 320,
      unit: 'pzas',
      spec: 'Módulo automotriz certificado',
      location: 'Rampa de Embarque 2',
      heatOrLot: 'LOTE-MOD-2024-B',
      remissionGuide: 'REM-EXP-441'
    },
    capturedData: {
      actualQty: 320,
      packagingCondition: 'Excelente',
      visualInspectionPassed: true,
      dimensionCompliance: true,
      qualityCertAttached: true,
      technicalChecklist: {
        thicknessVerified: true,
        millCertVerified: true,
        visualInspectionFreeRust: true
      },
      observations: 'Precinto vehicular de seguridad #MT-88912 colocado y sellado.'
    },
    discrepancy: {
      hasDiscrepancy: false,
      differenceQty: 0,
      percentageDiff: '0%',
      authorized: true
    },
    tableItems: [
      {
        item: 1,
        receiptDate: '23/10/2024',
        materialDescription: 'Módulo de control de potencia E-Series Gen 4',
        qty: 320,
        supplier: 'Distribuidora Automotriz del Bajío',
        heatOrLot: 'LOTE-MOD-2024-B',
        qualityCert: 'CUMPLE',
        remissionGuide: 'REM-EXP-441',
        purchaseOrder: 'NV-10492',
        finalResult: 'APROBADO'
      }
    ],
    evidences: [
      {
        id: 'evi-4',
        title: 'Precinto de seguridad en compuerta de camión',
        timestamp: '23 Oct 2024 • 16:20',
        location: 'Rampa de Embarques 2',
        imageUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&auto=format&fit=crop&q=80'
      }
    ],
    timeline: [
      {
        id: 't-31',
        title: 'Checklist de remisión generado',
        description: 'Generación de orden de despacho',
        timestamp: '2024-10-23 15:50:00',
        timeFormatted: '15:50',
        actor: 'Marcos Rentería',
        actorRole: 'Coordinador de Embarques',
        type: 'create'
      },
      {
        id: 't-32',
        title: 'Precinto verificado y firmado',
        description: 'Salida de transporte con precinto verificado',
        timestamp: '2024-10-23 16:30:00',
        timeFormatted: '16:30',
        actor: 'Marcos Rentería',
        actorRole: 'Coordinador de Embarques',
        type: 'signature'
      }
    ],
    signatures: {
      inspector: {
        name: 'Marcos Rentería',
        role: 'Coordinador de Tráfico y Embarques',
        date: '23/10/2024',
        confirmed: true
      }
    }
  },
  {
    id: 'rec-1038',
    folio: 'REG-CAL-2024-1038',
    formatId: 'for-cal-09',
    formatTitle: 'Reporte de Incumplimiento',
    formatCode: 'FOR-CAL-09',
    reference: 'PO-97992',
    supplier: 'Polímeros Industriales S.A.',
    area: 'Calidad • Línea 3',
    timestamp: '11:20',
    date: '23 Oct 2024',
    status: 'Rechazado',
    operatorName: 'Ana Lucía Torres',
    operatorEmployeeId: 'EMP-42109',
    operatorRole: 'Analista de Calidad de Polímeros',
    revisionNumber: '3',
    project: 'INYECCIÓN DE CARCASAS LÍNEA 3',
    client: 'Polímeros Industriales S.A.',
    technicalSpecs: 'Dureza mínima 65 Shore D',
    erpData: {
      supplierCode: 'PRV-21099',
      purchaseOrder: 'PO-97992',
      partNumber: 'RES-POL-400',
      expectedQty: 5000,
      unit: 'kg',
      spec: 'Dureza requerida: 65 Shore D',
      location: 'Silo Q-2 Cuarentena',
      heatOrLot: 'LOT-POL-992',
      remissionGuide: 'GR-2024-740'
    },
    capturedData: {
      actualQty: 5000,
      packagingCondition: 'Dañado',
      visualInspectionPassed: false,
      dimensionCompliance: false,
      qualityCertAttached: true,
      technicalChecklist: {
        thicknessVerified: false,
        millCertVerified: true,
        visualInspectionFreeRust: false
      },
      observations: 'Muestreo de 5 puntos arrojó dureza promedio de 56 Shore D, inferior al mínimo de 65 especificado en plano.',
      discrepancyNote: 'Rechazo total del lote por no conformidad crítica. Material bloqueado en Silo Q-2 con etiqueta roja de cuarentena.'
    },
    discrepancy: {
      hasDiscrepancy: true,
      differenceQty: 0,
      percentageDiff: '-14% dureza',
      reason: 'Dureza fuera de norma técnica. Requiere reemplazo por proveedor.',
      authorized: false
    },
    tableItems: [
      {
        item: 1,
        receiptDate: '23/10/2024',
        materialDescription: 'Pellets polietileno virgen alta densidad',
        qty: 5000,
        supplier: 'Polímeros Industriales S.A.',
        heatOrLot: 'LOT-POL-992',
        qualityCert: 'NO CUMPLE',
        remissionGuide: 'GR-2024-740',
        purchaseOrder: 'PO-97992',
        finalResult: 'RECHAZADO'
      }
    ],
    evidences: [
      {
        id: 'evi-5',
        title: 'Etiqueta roja de cuarentena en Silo Q-2',
        timestamp: '23 Oct 2024 • 11:15',
        location: 'Calidad - Línea 3',
        imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80'
      }
    ],
    timeline: [
      {
        id: 't-41',
        title: 'Lote ingresado a muestreo',
        description: 'Toma de 5 muestras aleatorias',
        timestamp: '2024-10-23 10:45:00',
        timeFormatted: '10:45',
        actor: 'Ana Lucía Torres',
        actorRole: 'Analista de Calidad',
        type: 'create'
      },
      {
        id: 't-42',
        title: 'Prueba de durómetro fallida',
        description: '56 Shore D detectado (Límite: 65)',
        timestamp: '2024-10-23 11:05:00',
        timeFormatted: '11:05',
        actor: 'Ana Lucía Torres',
        actorRole: 'Analista de Calidad',
        type: 'inspection'
      },
      {
        id: 't-43',
        title: 'Rechazo asentado y cuarentena activa',
        description: 'Bloqueo automático en SAP para evitar consumo en planta',
        timestamp: '2024-10-23 11:20:00',
        timeFormatted: '11:20',
        actor: 'Ing. Carlos Mendoza',
        actorRole: 'Supervisor de Calidad',
        type: 'rejection'
      }
    ],
    signatures: {
      inspector: {
        name: 'Ana Lucía Torres',
        role: 'Analista de Calidad',
        date: '23/10/2024',
        confirmed: true
      },
      qaManager: {
        name: 'Ing. Carlos Mendoza',
        role: 'Supervisor de Calidad - Planta Norte',
        date: '23/10/2024',
        confirmed: true
      }
    }
  },
  {
    id: 'rec-dev-0089',
    folio: 'REG-DEV-2024-0089',
    formatId: 'for-dev-01',
    formatTitle: 'Acta de Devolución y Rechazo a Proveedor',
    formatCode: 'FOR-DEV-01',
    workflowPhase: 'devolucion',
    sequenceStepNumber: 3,
    linkedPurchaseOrder: 'PO-97992',
    linkedInspectionFolio: 'REG-CAL-2024-1038',
    reference: 'PO-97992',
    supplier: 'Polímeros Industriales S.A.',
    area: 'Calidad • Cuarentena',
    timestamp: '14:10',
    date: '23 Oct 2024',
    status: 'Rechazado',
    operatorName: 'Ing. Carlos Mendoza',
    operatorEmployeeId: 'EMP-40921',
    operatorRole: 'Supervisor de Calidad - Planta Norte',
    revisionNumber: '0',
    project: 'INYECCIÓN DE CARCASAS LÍNEA 3',
    client: 'Polímeros Industriales S.A.',
    technicalSpecs: 'ASTM D2240 / Límite mínimo dureza 65 Shore D',
    returnDetails: {
      reason: 'Lote de 5000 kg de resina polimérica fuera de norma técnica (56 Shore D detectado vs 65 Shore D mínimo requerido). Desviación crítica no apta para ensamble.',
      damageType: 'Fuera de Tolerancia / Dimensión',
      requestedAction: 'Reposición Urgente',
      returnCarrier: 'Transportes Rápidos del Norte S.A.',
      trackingGuide: 'RET-GUIA-9921',
      quarantineLocation: 'Silo Q-2 Cuarentena'
    },
    erpData: {
      supplierCode: 'PRV-21099',
      purchaseOrder: 'PO-97992',
      partNumber: 'RES-POL-400',
      expectedQty: 5000,
      unit: 'kg',
      spec: 'Dureza requerida: 65 Shore D',
      location: 'Silo Q-2 Cuarentena',
      heatOrLot: 'LOT-POL-992',
      remissionGuide: 'GR-2024-740'
    },
    capturedData: {
      actualQty: 5000,
      packagingCondition: 'Dañado',
      visualInspectionPassed: false,
      dimensionCompliance: false,
      qualityCertAttached: true,
      technicalChecklist: {
        thicknessVerified: false,
        millCertVerified: true,
        visualInspectionFreeRust: false
      },
      observations: 'Material bloqueado y cargado en unidad de flete de retorno de proveedor con remisión de salida formal.',
      discrepancyNote: 'Devolución total autorizada por Jefatura de Calidad. Se solicita reposición de lote en un plazo no mayor a 72 horas.'
    },
    discrepancy: {
      hasDiscrepancy: true,
      differenceQty: 0,
      percentageDiff: '-100% Retorno',
      reason: 'Devolución de 5000 kg a proveedor por no conformidad de dureza.',
      authorized: true
    },
    tableItems: [
      {
        item: 1,
        receiptDate: '23/10/2024',
        materialDescription: 'Pellets polietileno virgen alta densidad (DEVUELTO)',
        qty: 5000,
        supplier: 'Polímeros Industriales S.A.',
        heatOrLot: 'LOT-POL-992',
        qualityCert: 'RECHAZADO',
        remissionGuide: 'RET-GUIA-9921',
        purchaseOrder: 'PO-97992',
        finalResult: 'RECHAZADO'
      }
    ],
    evidences: [
      {
        id: 'evi-dev-1',
        title: 'Etiqueta de devolución y precinto de salida a proveedor',
        timestamp: '23 Oct 2024 • 14:00',
        location: 'Rampa de Devoluciones Almacén',
        imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
        fileName: 'etiqueta_devolucion_proveedor.jpg',
        fileSize: '1.2 MB',
        fileType: 'image/jpeg'
      },
      {
        id: 'evi-dev-2',
        title: 'Muestras de laboratorio con etiqueta de rechazo',
        timestamp: '23 Oct 2024 • 14:05',
        location: 'Laboratorio de Materiales',
        imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
        fileName: 'analisis_dureza_rechazado.png',
        fileSize: '950 KB',
        fileType: 'image/png'
      }
    ],
    timeline: [
      {
        id: 't-dev-1',
        title: 'Inspección previa rechazada',
        description: 'Vinculado a folio REG-CAL-2024-1038',
        timestamp: '2024-10-23 11:20:00',
        timeFormatted: '11:20',
        actor: 'Ana Lucía Torres',
        actorRole: 'Analista de Calidad',
        type: 'rejection'
      },
      {
        id: 't-dev-2',
        title: 'Acta de devolución generada',
        description: 'Notificación enviada a Compras y Proveedor',
        timestamp: '2024-10-23 13:45:00',
        timeFormatted: '13:45',
        actor: 'Ing. Carlos Mendoza',
        actorRole: 'Supervisor de Calidad',
        type: 'create'
      },
      {
        id: 't-dev-3',
        title: 'Embarque de retorno y firma de salida',
        description: 'Guía de transporte RET-GUIA-9921 sellada',
        timestamp: '2024-10-23 14:10:00',
        timeFormatted: '14:10',
        actor: 'Ing. Carlos Mendoza',
        actorRole: 'Supervisor de Calidad',
        type: 'signature'
      }
    ],
    signatures: {
      inspector: {
        name: 'Ing. Carlos Mendoza',
        role: 'Supervisor de Calidad - Planta Norte',
        date: '23/10/2024',
        confirmed: true
      },
      qaManager: {
        name: 'Ing. Javier Morales',
        role: 'Jefe de Fabricaciones',
        date: '23/10/2024',
        confirmed: true
      }
    }
  }
];
