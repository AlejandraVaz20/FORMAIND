export type AreaType = 'Calidad' | 'Almacén' | 'Producción' | 'Ventas' | 'Logística' | 'Mantenimiento' | 'Seguridad';

export type RecordStatus = 'Completado' | 'En Proceso' | 'Rechazado' | 'Con Discrepancia';

export type WorkflowPhase = 'compra' | 'inspeccion' | 'devolucion' | 'general';

export interface FormatDefinition {
  id: string;
  code: string; // e.g. FOR-CAL-04
  title: string;
  area: AreaType;
  description: string;
  iconName: 'microscope' | 'package' | 'cog' | 'truck' | 'clipboard' | 'shield' | 'wrench' | 'shopping-cart' | 'undo-2';
  erpConnected: boolean;
  estimatedMinutes: number;
  tags: string[];
  fieldsToComplete: string[];
  erpPrefilledFields: string[];
  // Sequential chain attributes
  workflowPhase?: WorkflowPhase;
  sequenceStepNumber?: 1 | 2 | 3;
  nextFormatId?: string;
  previousFormatId?: string;
}

export interface ErpSampleRecord {
  id: string;
  code: string; // PO-98421-MX, PO-88339, LOTE-AC-992, OF-4510
  type: 'PO' | 'LOTE' | 'OF' | 'EMBARQUE';
  title: string;
  supplierOrClient: string;
  supplierCode?: string; // PRV-40892
  materialCode: string; // NP-STEEL-8840-HD
  materialName: string;
  expectedQuantity: number;
  unit: string;
  specification: string;
  warehouseLocation: string;
  orderDate: string;
  heatOrLot?: string; // LOT-2024-889
  remissionGuide?: string; // GR-2024-912
}

export interface TableItemInspection {
  item: number;
  receiptDate: string;
  materialDescription: string;
  qty: number;
  supplier: string;
  heatOrLot: string;
  qualityCert: string;
  remissionGuide: string;
  purchaseOrder: string;
  finalResult: 'APROBADO' | 'RECHAZADO' | 'OBSERVADO';
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  timeFormatted: string; // "10:15"
  actor: string;
  actorRole: string;
  type: 'create' | 'erp_sync' | 'inspection' | 'signature' | 'rejection' | 'edit';
}

export interface PhotoEvidence {
  id: string;
  title: string;
  timestamp: string;
  location: string;
  imageUrl: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string; // 'image/png' | 'image/jpeg' | 'image/gif'
}

export interface UserProfile {
  id: string;
  fullName: string;
  jobTitle: string;
  employeeId: string;
  department: string;
  plantLocation: string;
  email: string;
  shift: string;
  certifications: string;
  digitalSignatureUrl?: string;
  hasSignature: boolean;
  avatarUrl: string;
  // Login username linked to this profile (used by the authentication system).
  username?: string;
}

// A registered login account. The password is never stored in plain text — only its
// PBKDF2 hash and the random salt used to derive it (see utils/authStorage.ts).
export interface AuthAccount {
  username: string;
  passwordHash: string; // hex-encoded
  passwordSalt: string; // hex-encoded
  profileId: string; // links to a UserProfile.id
  createdAt: string;
}

export interface AuthSession {
  username: string;
  profileId: string;
  issuedAt: string;
  expiresAt: string;
}

export interface InspectionRecord {
  id: string;
  folio: string; // REG-CAL-2024-1042
  formatId: string;
  formatTitle: string;
  formatCode: string;
  reference: string; // PO-98421-MX
  supplier: string; // Acero y Aleaciones Industriales
  area: string; // Calidad • Nave B
  timestamp: string;
  date: string;
  status: RecordStatus;
  operatorName: string;
  operatorEmployeeId: string; // EMP-40921
  operatorRole: string;
  // Usuario de login autenticado que capturó el registro — para trazabilidad de auditoría
  // independiente del nombre para mostrar (que podría cambiar si se edita el perfil).
  createdByUsername?: string;
  createdAt?: string; // ISO timestamp exacto de creación
  
  // Sequential Workflow Chain
  workflowPhase?: WorkflowPhase;
  sequenceStepNumber?: 1 | 2 | 3;
  linkedPurchaseOrder?: string;
  linkedInspectionFolio?: string;
  purchaseDetails?: {
    requestedDeliveryDate: string;
    costCenter: string;
    priority: 'Normal' | 'Alta' | 'Urgente';
    buyerName: string;
    totalAmountUsd?: number;
  };
  returnDetails?: {
    reason: string;
    damageType: 'Embalaje Destrozado' | 'Fuera de Tolerancia / Dimensión' | 'Material Oxidado / Corroído' | 'Faltante de Volumen' | 'Sin Certificado de Molino';
    requestedAction: 'Reposición Urgente' | 'Nota de Crédito' | 'Retorno para Reparación';
    returnCarrier: string;
    trackingGuide?: string;
    quarantineLocation: string;
  };

  // Formal document metadata (matching Page 1 & 3)
  revisionNumber: string;
  project: string;
  client: string;
  technicalSpecs: string;
  
  // Data separated by origin:
  // 1. Automatic ERP Data
  erpData: {
    supplierCode: string; // PRV-40892
    purchaseOrder: string; // PO-98421-MX
    partNumber: string; // NP-STEEL-8840-HD
    expectedQty: number;
    unit: string;
    spec: string;
    location: string;
    heatOrLot?: string;
    remissionGuide?: string;
  };

  // 2. User Captured Data in Plant
  capturedData: {
    actualQty: number;
    packagingCondition: 'Excelente' | 'Aceptable' | 'Dañado';
    thicknessMeasured?: string; // e.g. "12.7 mm"
    visualInspectionPassed: boolean;
    dimensionCompliance: boolean;
    qualityCertAttached: boolean;
    technicalChecklist: {
      thicknessVerified: boolean;
      millCertVerified: boolean;
      visualInspectionFreeRust: boolean;
    };
    observations?: string;
    discrepancyNote?: string;
  };

  // 3. Status/Warnings/Review flags
  discrepancy: {
    hasDiscrepancy: boolean;
    differenceQty: number; // e.g. +50
    percentageDiff: string; // e.g. "+50%"
    reason?: string;
    authorized: boolean;
  };

  // 4. Formal table items (for multi-line or tabular formats)
  tableItems: TableItemInspection[];

  // 5. Photos / Evidences
  evidences: PhotoEvidence[];

  // 6. Traceability Timeline
  timeline: TimelineEvent[];

  // 7. Approvals & Signatures
  signatures: {
    inspector: {
      name: string;
      role: string;
      date: string;
      confirmed: boolean;
    };
    plantManager?: {
      name: string;
      role: string;
      date: string;
      confirmed: boolean;
    };
    qaManager?: {
      name: string;
      role: string;
      date: string;
      confirmed: boolean;
    };
  };
}
