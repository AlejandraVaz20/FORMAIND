import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Clock, 
  Barcode, 
  Database, 
  Building2, 
  UserCheck,
  FileText,
  Eye,
  Camera,
  ArrowRight,
  ShoppingCart,
  Microscope,
  Undo2,
  AlertTriangle
} from 'lucide-react';
import { InspectionRecord } from '../types';
import { FormalDocumentViewer } from './FormalDocumentViewer';
import { ImageLightboxModal } from './ImageLightboxModal';

interface RecordDetailModalProps {
  record: InspectionRecord | null;
  onClose: () => void;
  onInitiateSequentialFormat?: (formatId: string, linkedRecord: InspectionRecord) => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  record,
  onClose,
  onInitiateSequentialFormat
}) => {
  const [showFormalDoc, setShowFormalDoc] = useState<boolean>(false);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  if (!record) return null;

  if (showFormalDoc) {
    return (
      <FormalDocumentViewer
        record={record}
        onClose={() => setShowFormalDoc(false)}
      />
    );
  }

  const handleOpenPhoto = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Función para descargar/imprimir como PDF usando las herramientas nativas del navegador
  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200 print:bg-white print:p-0 print:block">
        <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl print:border-none print:shadow-none print:w-full print:max-w-none print:h-auto print:max-h-none print:block">
          
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70 print:bg-white print:border-b-2 print:border-slate-800">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="font-mono text-xs sm:text-sm font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded shrink-0 print:text-black print:border-black print:bg-white">
                {record.folio}
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-slate-900 truncate print:text-black print:text-lg">
                    {record.formatTitle}
                  </h3>
                  {record.workflowPhase && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 print:border print:border-black print:text-black print:bg-white ${
                      record.workflowPhase === 'compra'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : record.workflowPhase === 'inspeccion'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {record.workflowPhase === 'compra' ? 'Paso 1: Compra' :
                       record.workflowPhase === 'inspeccion' ? 'Paso 2: Inspección' :
                       'Paso 3: Devolución'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-mono print:text-black">
                  Código: {record.formatCode} • {record.area}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0 print:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sequential Action Banner if applicable */}
          {onInitiateSequentialFormat && (
            <div className="px-6 py-2.5 bg-gradient-to-r from-slate-100 to-blue-50/60 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs print:hidden">
              {record.formatId === 'for-com-01' ? (
                <>
                  <div className="flex items-center space-x-2 text-blue-900 font-medium">
                    <ShoppingCart className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Orden de Compra emitida. ¿El material ya arribó a andén para inspección?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onInitiateSequentialFormat('for-cal-04', record);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer shrink-0 text-xs"
                  >
                    <Microscope className="w-3.5 h-3.5" />
                    <span>Llenar Inspección Física (Paso 2)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : record.formatId === 'for-cal-04' && (record.status === 'Rechazado' || record.capturedData?.packagingCondition === 'Dañado' || !record.capturedData?.visualInspectionPassed) ? (
                <>
                  <div className="flex items-center space-x-2 text-rose-900 font-medium">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Inspección con rechazo o daño detectado. Requiere formato de devolución.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onInitiateSequentialFormat('for-dev-01', record);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer shrink-0 text-xs"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Generar Devolución (Paso 3)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-2 text-slate-600 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Flujo secuencial certificado según norma de calidad ISO 9001</span>
                </div>
              )}
            </div>
          )}

          {/* Modal Scrollable Content */}
          <div className="p-6 overflow-y-auto space-y-5 text-xs print:overflow-visible print:p-4">
            
            {/* Top metadata grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl print:bg-white print:border-black print:rounded-none">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block print:text-black">Folio de Registro</span>
                <span className="font-mono font-bold text-slate-900 text-sm print:text-black">{record.folio}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block print:text-black">Fecha y Hora</span>
                <span className="font-semibold text-slate-800 print:text-black">{record.date} • {record.timestamp}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block print:text-black">Estado de Auditoría</span>
                <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full font-bold text-[11px] mt-0.5 print:border print:border-black print:bg-white print:text-black ${
                  record.status === 'Completado' ? 'bg-emerald-100 text-emerald-800' :
                  record.status === 'Rechazado' ? 'bg-rose-100 text-rose-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {record.status}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block print:text-black">Responsable</span>
                <span className="font-semibold text-slate-800 block truncate print:text-black">{record.operatorName}</span>
                <span className="text-[10px] text-slate-500 print:text-black">{record.operatorRole}</span>
              </div>
            </div>

            {/* Special Section: Purchase Details if FOR-COM-01 */}
            {record.purchaseDetails && (
              <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2 print:bg-white print:border-black print:rounded-none">
                <div className="flex items-center space-x-2 text-blue-900 font-bold text-xs print:text-black">
                  <ShoppingCart className="w-4 h-4 text-blue-600 print:text-black" />
                  <span>Detalles de Requisición y Orden de Compra (Paso 1)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block print:text-black">Fecha Solicitada</span>
                    <span className="font-semibold text-slate-900 print:text-black">{record.purchaseDetails.requestedDeliveryDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block print:text-black">Centro de Costos</span>
                    <span className="font-mono font-semibold text-slate-900 print:text-black">{record.purchaseDetails.costCenter}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block print:text-black">Prioridad</span>
                    <span className="font-bold text-blue-700 print:text-black">{record.purchaseDetails.priority}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block print:text-black">Comprador</span>
                    <span className="font-semibold text-slate-900 print:text-black">{record.purchaseDetails.buyerName}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Special Section: Return Details if FOR-DEV-01 */}
            {record.returnDetails && (
              <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2 print:bg-white print:border-black print:rounded-none">
                <div className="flex items-center space-x-2 text-rose-900 font-bold text-xs print:text-black">
                  <Undo2 className="w-4 h-4 text-rose-600 print:text-black" />
                  <span>Detalles de Devolución a Proveedor (Paso 3)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block print:text-black">Tipo de Causa</span>
                    <span className="font-bold text-rose-800 print:text-black">{record.returnDetails.damageType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block print:text-black">Acción Requerida</span>
                    <span className="font-bold text-slate-900 print:text-black">{record.returnDetails.requestedAction}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block print:text-black">Transportista / Guía</span>
                    <span className="font-semibold text-slate-900 print:text-black">{record.returnDetails.returnCarrier}</span>
                  </div>
                </div>
                <div className="p-2 bg-white border border-rose-200 rounded-lg text-xs print:border-black print:rounded-none">
                  <span className="font-bold text-rose-950 block mb-0.5 print:text-black">Motivo Técnico:</span>
                  <p className="text-rose-900 print:text-black">{record.returnDetails.reason}</p>
                </div>
              </div>
            )}

            {/* Section 1: Pre-filled ERP Data */}
            <div className="space-y-2">
              <div className="flex items-center space-x-1.5 text-slate-700 font-bold uppercase tracking-wider text-[11px] print:text-black">
                <Database className="w-3.5 h-3.5 text-blue-600 print:text-black" />
                <span>Datos Obtenidos del ERP / Orden de Compra</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 bg-blue-50/30 border border-blue-100 rounded-xl print:bg-white print:border-black print:rounded-none">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block print:text-black">Proveedor / Entidad</span>
                  <span className="font-semibold text-slate-900 block truncate print:text-black">{record.supplier}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block print:text-black">Referencia / Lote</span>
                  <span className="font-mono font-bold text-blue-700 block print:text-black">{record.reference}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block print:text-black">Cantidad Teórica</span>
                  <span className="font-semibold text-slate-900 block print:text-black">
                    {record.erpData?.expectedQty} {record.erpData?.unit}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block print:text-black">Especificación Técnica</span>
                  <span className="text-slate-700 block print:text-black">{record.erpData?.spec}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block print:text-black">Bahía / Ubicación</span>
                  <span className="font-semibold text-slate-900 block print:text-black">{record.erpData?.location}</span>
                </div>
              </div>
            </div>

            {/* Section 2: Captured Data in Shop Floor */}
            <div className="space-y-2">
              <div className="flex items-center space-x-1.5 text-slate-700 font-bold uppercase tracking-wider text-[11px] print:text-black">
                <UserCheck className="w-3.5 h-3.5 text-blue-600 print:text-black" />
                <span>Datos Físicos Verificados en Planta por el Operador</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl print:bg-white print:border-black print:rounded-none">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block print:text-black">Cantidad Real Contada</span>
                  <span className="font-bold text-slate-900 text-sm print:text-black">
                    {record.capturedData?.actualQty} {record.erpData?.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block print:text-black">Condición Embalaje</span>
                  <span className={`font-semibold print:text-black ${record.capturedData?.packagingCondition === 'Dañado' ? 'text-rose-700 font-bold' : 'text-slate-800'}`}>
                    {record.capturedData?.packagingCondition}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block print:text-black">Inspección Visual</span>
                  <span className={`font-semibold print:text-black ${record.capturedData?.visualInspectionPassed ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {record.capturedData?.visualInspectionPassed ? '✓ Conforme' : '✕ No Conforme'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block print:text-black">Tolerancia Dimensional</span>
                  <span className={`font-semibold print:text-black ${record.capturedData?.dimensionCompliance ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {record.capturedData?.dimensionCompliance ? '✓ En Tolerancia' : '✕ Fuera de Tolerancia'}
                  </span>
                </div>
              </div>

              {record.capturedData?.observations && (
                <div className="p-3 bg-white border border-slate-200 rounded-lg print:border-black print:rounded-none">
                  <span className="font-bold text-slate-800 block mb-0.5 print:text-black">Observaciones de Turno:</span>
                  <p className="text-slate-600 print:text-black">{record.capturedData.observations}</p>
                </div>
              )}
            </div>

            {/* Section 3: Photo Evidences with Lightbox Click Support */}
            {record.evidences && record.evidences.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-slate-700 font-bold uppercase tracking-wider text-[11px] print:text-black">
                    <Camera className="w-3.5 h-3.5 text-blue-600 print:text-black" />
                    <span>Evidencias Fotográficas ({record.evidences.length})</span>
                  </div>
                  <span className="text-[11px] text-blue-700 font-medium flex items-center space-x-1 print:hidden">
                    <Eye className="w-3 h-3" />
                    <span>Haz clic en una imagen para abrirla y hacer zoom</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 print:grid-cols-3">
                  {record.evidences.map((photo, pIdx) => (
                    <div
                      key={photo.id || pIdx}
                      onClick={() => handleOpenPhoto(pIdx)}
                      className="group border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-2xs hover:shadow-md hover:border-blue-500 transition-all cursor-pointer relative print:border-black print:rounded-none print:shadow-none"
                      title="Haz clic para abrir y ampliar la imagen"
                    >
                      <div className="h-28 bg-slate-200 overflow-hidden relative print:h-32">
                        <img 
                          src={photo.imageUrl} 
                          alt={photo.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/30 transition-colors flex items-center justify-center print:hidden">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-black/80 text-white text-[10px] font-bold rounded-md flex items-center space-x-1 shadow">
                            <Eye className="w-3 h-3" />
                            <span>Abrir Imagen</span>
                          </span>
                        </div>
                        <span className="absolute top-1.5 left-1.5 bg-slate-900/80 text-white text-[9px] px-1.5 py-0.5 rounded font-mono print:bg-white print:text-black print:border print:border-black">
                          #{pIdx + 1}
                        </span>
                      </div>
                      <div className="p-2 bg-white print:border-t print:border-black">
                        <p className="text-[11px] font-bold text-slate-800 truncate print:text-black">{photo.title}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5 print:text-black">{photo.location} • {photo.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 4: Signature & Digital Audit Stamp */}
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 print:bg-white print:border-black print:rounded-none">
              <div className="space-y-1 text-left">
                <div className="flex items-center space-x-1.5 text-emerald-700 font-bold text-xs print:text-black">
                  <ShieldCheck className="w-4 h-4 print:text-black" />
                  <span>Documento Digitalmente Firmado e Inmutable</span>
                </div>
                <p className="text-[11px] text-slate-500 print:text-black">
                  Firmado por: <span className="font-semibold text-slate-800 print:text-black">{record.operatorName}</span> ({record.operatorRole})
                </p>
                <p className="text-[10px] text-slate-400 font-mono print:text-black">
                  SHA-256: 7e4b98c2d10...389a01f (Certificado Digital Planta Norte)
                </p>
              </div>

              <div className="text-center font-mono text-slate-700 p-2 bg-white rounded border border-slate-200 shrink-0 print:border-black print:text-black">
                <div className="text-xs tracking-widest font-extrabold">||| | |||| || |||</div>
                <div className="text-[9px] text-slate-500 font-semibold mt-0.5 print:text-black">{record.folio}</div>
              </div>
            </div>

          </div>

          {/* Modal Actions Footer */}
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between print:hidden">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFormalDoc(true)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#1E3A8A] hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ver Formato Empresarial Formal (A4)</span>
                <span className="sm:hidden">Formal</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Descargar PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>

        </div>
      </div>

      {/* Lightbox Modal */}
      {record.evidences && (
        <ImageLightboxModal
          isOpen={lightboxOpen}
          images={record.evidences}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
};