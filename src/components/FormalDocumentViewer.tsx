import React, { useState } from 'react';
import { Printer, Download, X, CheckCircle2, ShieldCheck, Eye, Layers } from 'lucide-react';
import { InspectionRecord } from '../types';
import { ImageLightboxModal } from './ImageLightboxModal';

interface FormalDocumentViewerProps {
  record: InspectionRecord;
  onClose?: () => void;
  isModal?: boolean;
}

export const FormalDocumentViewer: React.FC<FormalDocumentViewerProps> = ({
  record,
  onClose,
  isModal = true
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handlePrint = () => {
    window.print();
  };

  // El formato impreso/descargable no debe verse igual para todos los tipos de registro:
  // cada uno solo debe mostrar la información que corresponde a su propósito.
  const hasNoConformidad = !!record.returnDetails;
  const isWarehouseFormat = record.formatId?.startsWith('for-alm') || record.formatId?.startsWith('for-log');

  const sectionTwoTitle =
    record.workflowPhase === 'compra'
      ? '2. RECEPCIÓN DE MATERIALES EN ALMACÉN'
      : record.workflowPhase === 'devolucion'
      ? '2. DETALLE DEL MATERIAL A DEVOLVER'
      : isWarehouseFormat
      ? '2. DESPACHO / MOVIMIENTO DE ALMACÉN'
      : '2. INSPECCIÓN DE CALIDAD DE MATERIALES';

  // Numeración de secciones dinámica: la sección de No Conformidad solo existe (y solo
  // ocupa un número) cuando el registro realmente tiene una devolución/rechazo asociado.
  const sectionNoConformidadNum = 3;
  const sectionObservacionesNum = hasNoConformidad ? 4 : 3;
  const sectionAprobacionNum = hasNoConformidad ? 5 : 4;

  const content = (
    <div className="bg-white text-black p-8 max-w-[850px] mx-auto text-xs leading-tight font-serif print:p-0 print:m-0 print:max-w-none print:shadow-none shadow-lg border border-slate-300">
      
      {/* Formal Header Table matching Page 1 & 3 */}
      <table className="w-full border-collapse border-2 border-black mb-4">
        <tbody>
          <tr>
            {/* Logo box */}
            <td className="w-28 p-2 border-r-2 border-black text-center align-middle bg-slate-50 print:bg-white">
              <div className="flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center font-sans font-black text-xs">
                  AKD
                </div>
                <span className="text-[8px] font-sans font-bold tracking-tighter mt-1">
                  INDUSTRIAL S.A.
                </span>
              </div>
            </td>

            {/* Title middle box */}
            <td className="p-3 border-r-2 border-black text-center align-middle">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider block text-slate-600">
                CONTROL DE CALIDAD & OPERACIONES
              </span>
              <h1 className="text-sm font-sans font-black uppercase tracking-tight mt-0.5">
                {record.formatTitle.toUpperCase()}
              </h1>
              <span className="text-[9px] font-sans text-slate-500 mt-0.5 block">
                SISTEMA INTEGRADO DE GESTIÓN ISO 9001 / IATF 16949
              </span>
            </td>

            {/* Document metadata right box */}
            <td className="w-44 p-0 align-top text-[10px] font-sans">
              <table className="w-full border-collapse">
                <tbody>
                  <tr className="border-b border-black">
                    <td className="p-1 font-bold bg-slate-100 print:bg-white border-r border-black w-20">Revisión:</td>
                    <td className="p-1 text-center font-mono">{record.revisionNumber || '0'}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1 font-bold bg-slate-100 print:bg-white border-r border-black">Fecha:</td>
                    <td className="p-1 text-center font-mono">{record.date}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="p-1 font-bold bg-slate-100 print:bg-white border-r border-black">Página:</td>
                    <td className="p-1 text-center font-mono">1 de 1</td>
                  </tr>
                  <tr>
                    <td className="p-1 font-bold bg-slate-100 print:bg-white border-r border-black">Folio:</td>
                    <td className="p-1 text-center font-mono font-black text-blue-900 print:text-black">{record.folio}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Section 1: DATOS GENERALES matching Page 1 */}
      <div className="mb-4">
        <div className="bg-slate-200 print:bg-slate-200 font-sans font-bold text-[10px] uppercase px-2 py-0.5 border-x-2 border-t-2 border-black">
          1. DATOS GENERALES
        </div>
        <table className="w-full border-collapse border-2 border-black font-sans text-[10px]">
          <tbody>
            <tr className="border-b border-black">
              <td className="p-1.5 font-bold w-36 border-r border-black bg-slate-50 print:bg-white">PROYECTO:</td>
              <td className="p-1.5 border-r border-black font-semibold">{record.project || 'TRABADORES DE SEGURIDAD PARA MANDOS'}</td>
              <td className="p-1.5 font-bold w-24 border-r border-black bg-slate-50 print:bg-white">REGISTRO:</td>
              <td className="p-1.5 font-mono">{record.formatCode}-003</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-1.5 font-bold border-r border-black bg-slate-50 print:bg-white">CLIENTE / PROV.:</td>
              <td className="p-1.5 border-r border-black font-semibold">{record.supplier}</td>
              <td className="p-1.5 font-bold border-r border-black bg-slate-50 print:bg-white">FECHA:</td>
              <td className="p-1.5 font-mono">{record.date}</td>
            </tr>
            <tr>
              <td className="p-1.5 font-bold border-r border-black bg-slate-50 print:bg-white">ESPECIFICACIONES:</td>
              <td colSpan={3} className="p-1.5">
                {record.technicalSpecs || record.erpData.spec}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 2: contenido variable según el tipo de formato (recepción, inspección, devolución o almacén) */}
      <div className="mb-4">
        <div className="bg-slate-200 print:bg-slate-200 font-sans font-bold text-[10px] uppercase px-2 py-0.5 border-x-2 border-t-2 border-black">
          {sectionTwoTitle}
        </div>
        <table className="w-full border-collapse border-2 border-black font-sans text-[9px] text-center">
          <thead>
            <tr className="bg-slate-100 print:bg-white border-b-2 border-black font-bold">
              <th className="p-1 border-r border-black w-8">ITEM</th>
              <th className="p-1 border-r border-black w-16">FECHA REC.</th>
              <th className="p-1 border-r border-black text-left">DESCRIPCIÓN DEL MATERIAL</th>
              <th className="p-1 border-r border-black w-12">CANT.</th>
              <th className="p-1 border-r border-black">PROVEEDOR</th>
              <th className="p-1 border-r border-black w-20">IDENTIFICACIÓN (COLADA/LOTE)</th>
              <th className="p-1 border-r border-black w-14">CERTIF. CALIDAD</th>
              <th className="p-1 border-r border-black w-16">GUÍA REMISIÓN</th>
              <th className="p-1 border-r border-black w-16">ORDEN COMPRA</th>
              <th className="p-1 w-16">RESULTADO FINAL</th>
            </tr>
          </thead>
          <tbody>
            {record.tableItems && record.tableItems.length > 0 ? (
              record.tableItems.map((ti, idx) => (
                <tr key={idx} className="border-b border-black">
                  <td className="p-1.5 border-r border-black font-mono">{ti.item}</td>
                  <td className="p-1.5 border-r border-black font-mono">{ti.receiptDate}</td>
                  <td className="p-1.5 border-r border-black text-left font-medium">{ti.materialDescription}</td>
                  <td className="p-1.5 border-r border-black font-mono font-bold">{ti.qty}</td>
                  <td className="p-1.5 border-r border-black text-left truncate max-w-[100px]">{ti.supplier}</td>
                  <td className="p-1.5 border-r border-black font-mono text-[8.5px]">{ti.heatOrLot}</td>
                  <td className="p-1.5 border-r border-black font-bold">{ti.qualityCert}</td>
                  <td className="p-1.5 border-r border-black font-mono">{ti.remissionGuide}</td>
                  <td className="p-1.5 border-r border-black font-mono">{ti.purchaseOrder}</td>
                  <td className="p-1.5 font-bold">
                    <span className={ti.finalResult === 'APROBADO' ? 'text-black' : 'text-rose-700 font-black'}>
                      {ti.finalResult}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-b border-black">
                <td className="p-1.5 border-r border-black font-mono">1</td>
                <td className="p-1.5 border-r border-black font-mono">{record.date}</td>
                <td className="p-1.5 border-r border-black text-left font-medium">
                  {record.erpData.partNumber} - {record.technicalSpecs || record.erpData.spec}
                </td>
                <td className="p-1.5 border-r border-black font-mono font-bold">{record.capturedData.actualQty}</td>
                <td className="p-1.5 border-r border-black text-left">{record.supplier}</td>
                <td className="p-1.5 border-r border-black font-mono">{record.erpData.heatOrLot || 'LOT-889'}</td>
                <td className="p-1.5 border-r border-black font-bold">CUMPLE</td>
                <td className="p-1.5 border-r border-black font-mono">{record.erpData.remissionGuide || 'GR-912'}</td>
                <td className="p-1.5 border-r border-black font-mono">{record.reference}</td>
                <td className="p-1.5 font-bold">
                  {record.status === 'Completado' ? 'APROBADO' : record.status.toUpperCase()}
                </td>
              </tr>
            )}

            {/* Empty filler rows for formal industrial look */}
            {[1, 2, 3].map((n) => (
              <tr key={`filler-${n}`} className="border-b border-black text-slate-300">
                <td className="p-1.5 border-r border-black font-mono">{(record.tableItems?.length || 1) + n}</td>
                <td className="p-1.5 border-r border-black">-</td>
                <td className="p-1.5 border-r border-black text-left">-</td>
                <td className="p-1.5 border-r border-black">-</td>
                <td className="p-1.5 border-r border-black">-</td>
                <td className="p-1.5 border-r border-black">-</td>
                <td className="p-1.5 border-r border-black">-</td>
                <td className="p-1.5 border-r border-black">-</td>
                <td className="p-1.5 border-r border-black">-</td>
                <td className="p-1.5">-</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sequential Traceability Badge if linked */}
      {(record.linkedPurchaseOrder || record.linkedInspectionFolio) && (
        <div className="mb-3 p-2 bg-slate-50 border border-slate-300 font-sans text-[9px] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700 uppercase">Trazabilidad Secuencial:</span>
            {record.linkedPurchaseOrder && (
              <span className="font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                OC Origen: {record.linkedPurchaseOrder}
              </span>
            )}
            {record.linkedInspectionFolio && (
              <span className="font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                Inspección Vinculada: {record.linkedInspectionFolio}
              </span>
            )}
          </div>
          <span className="text-slate-500 font-medium">Cadena Consecutiva de Calidad</span>
        </div>
      )}

      {/* Section: NO CONFORMIDAD Y DISPOSICIÓN — únicamente para formatos de devolución/rechazo */}
      {hasNoConformidad && record.returnDetails && (
        <div className="mb-4">
          <div className="bg-rose-100 print:bg-slate-200 font-sans font-bold text-[10px] uppercase px-2 py-0.5 border-x-2 border-t-2 border-black text-rose-900 print:text-black">
            {sectionNoConformidadNum}. NO CONFORMIDAD, CAUSA Y DISPOSICIÓN
          </div>
          <table className="w-full border-collapse border-2 border-black font-sans text-[10px]">
            <tbody>
              <tr className="border-b border-black">
                <td className="p-1.5 font-bold w-36 border-r border-black bg-slate-50 print:bg-white">MATERIAL AFECTADO:</td>
                <td className="p-1.5 border-r border-black font-semibold">{record.erpData.partNumber} — {record.erpData.heatOrLot || 'S/N'}</td>
                <td className="p-1.5 font-bold w-32 border-r border-black bg-slate-50 print:bg-white">TIPO DE DAÑO:</td>
                <td className="p-1.5 font-bold">{record.returnDetails.damageType}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="p-1.5 font-bold border-r border-black bg-slate-50 print:bg-white">CAUSA / MOTIVO:</td>
                <td className="p-1.5 border-r border-black" colSpan={3}>{record.returnDetails.reason}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="p-1.5 font-bold border-r border-black bg-slate-50 print:bg-white">DISPOSICIÓN / ACCIÓN SOLICITADA:</td>
                <td className="p-1.5 border-r border-black font-bold">{record.returnDetails.requestedAction}</td>
                <td className="p-1.5 font-bold border-r border-black bg-slate-50 print:bg-white">UBICACIÓN CUARENTENA:</td>
                <td className="p-1.5">{record.returnDetails.quarantineLocation}</td>
              </tr>
              <tr>
                <td className="p-1.5 font-bold border-r border-black bg-slate-50 print:bg-white">TRANSPORTISTA:</td>
                <td className="p-1.5 border-r border-black">{record.returnDetails.returnCarrier}</td>
                <td className="p-1.5 font-bold border-r border-black bg-slate-50 print:bg-white">GUÍA DE RASTREO:</td>
                <td className="p-1.5 font-mono">{record.returnDetails.trackingGuide || 'Pendiente de asignar'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Section: OBSERVACIONES Y METROLOGÍA */}
      <div className="mb-4">
        <div className="bg-slate-200 print:bg-slate-200 font-sans font-bold text-[10px] uppercase px-2 py-0.5 border-x-2 border-t-2 border-black">
          {sectionObservacionesNum}. OBSERVACIONES Y METROLOGÍA
        </div>
        <div className="border-2 border-black p-2 font-sans text-[10px] min-h-[55px] space-y-1 bg-white">
          {record.capturedData.thicknessMeasured && (
            <p className="font-semibold">
              • Para la inspección dimensional se utilizó calibrador vernier digital calibrado (Espesor medido: {record.capturedData.thicknessMeasured}).
            </p>
          )}
          {record.capturedData.observations && (
            <p>• {record.capturedData.observations}</p>
          )}
          {record.discrepancy.hasDiscrepancy && (
            <p className="font-semibold text-slate-800">
              • Nota de volumen: {record.discrepancy.reason} (Diferencia de {record.discrepancy.percentageDiff} asentada en ERP).
            </p>
          )}
        </div>
      </div>

      {/* Section: ANEXO FOTOGRÁFICO DE EVIDENCIA (Clickable) */}
      {record.evidences && record.evidences.length > 0 && (
        <div className="mb-4">
          <div className="bg-slate-200 print:bg-slate-200 font-sans font-bold text-[10px] uppercase px-2 py-0.5 border-x-2 border-t-2 border-black flex items-center justify-between">
            <span>ANEXO: REGISTRO FOTOGRÁFICO DE INSPECCIÓN FÍSICA ({record.evidences.length} EVIDENCIAS)</span>
            <span className="text-[8px] font-normal text-slate-600 print:hidden font-sans">
              (Haz clic en cualquier imagen para abrir el visor interactivo con zoom)
            </span>
          </div>
          <div className="border-2 border-black p-2 bg-white grid grid-cols-2 sm:grid-cols-3 gap-2">
            {record.evidences.map((photo, i) => (
              <div 
                key={photo.id}
                onClick={() => {
                  setLightboxIndex(i);
                  setLightboxOpen(true);
                }}
                className="border border-slate-300 rounded p-1 bg-slate-50 cursor-pointer group hover:border-blue-500 transition-colors"
                title="Haz clic para ampliar"
              >
                <div className="h-24 bg-slate-200 rounded overflow-hidden relative">
                  <img 
                    src={photo.imageUrl} 
                    alt={photo.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 flex items-center justify-center transition-colors print:hidden">
                    <span className="opacity-0 group-hover:opacity-100 text-white text-[9px] font-bold bg-black/80 px-2 py-0.5 rounded flex items-center space-x-1">
                      <Eye className="w-2.5 h-2.5" />
                      <span>Abrir</span>
                    </span>
                  </div>
                </div>
                <div className="mt-1 font-sans text-[9px]">
                  <div className="font-bold text-slate-800 truncate">{photo.title}</div>
                  <div className="text-slate-500 text-[8px]">{photo.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section: APROBACIÓN FINAL / FIRMAS — roles adaptados según el tipo de formato */}
      <div>
        <div className="bg-slate-200 print:bg-slate-200 font-sans font-bold text-[10px] uppercase px-2 py-0.5 border-x-2 border-t-2 border-black">
          {sectionAprobacionNum}. APROBACIÓN FINAL Y FIRMAS
        </div>
        <table className="w-full border-collapse border-2 border-black font-sans text-[9px]">
          <tbody>
            <tr>
              {/* Primera firma: Jefe de Planta, o quien solicita la devolución */}
              <td className="w-1/3 p-2 border-r-2 border-black align-bottom h-24 text-center">
                <div className="mb-2 font-serif italic text-[11px] text-slate-700">
                  {record.signatures?.plantManager?.name || (hasNoConformidad ? record.operatorName : 'Ing. Roberto Salgado')}
                </div>
                <div className="border-t border-black pt-1">
                  <div className="font-bold uppercase">{hasNoConformidad ? 'Solicitó Devolución' : 'Jefe de Planta'}</div>
                  <div className="text-[8px] text-slate-600">AK Drilling International S.A.</div>
                  <div className="text-[8px] text-slate-500 font-mono mt-0.5">Fecha: {record.date}</div>
                </div>
              </td>

              {/* QA/QC Inspector (with digital badge) — siempre presente y firmado digitalmente */}
              <td className="w-1/3 p-2 border-r-2 border-black align-bottom h-24 text-center bg-blue-50/20 print:bg-white">
                <div className="mb-1 flex flex-col items-center">
                  <span className="text-[8px] text-emerald-800 font-bold border border-emerald-500 px-1 py-0.2 rounded inline-block mb-1">
                    ✓ FIRMADO DIGITALMENTE
                  </span>
                  <span className="font-serif italic text-[11px] font-bold text-blue-900 print:text-black">
                    {record.signatures?.inspector?.name || record.operatorName}
                  </span>
                  <span className="text-[7.5px] font-mono text-slate-500">
                    ID: {record.operatorEmployeeId}
                  </span>
                </div>
                <div className="border-t border-black pt-1">
                  <div className="font-bold uppercase">{hasNoConformidad ? 'Autorizó Calidad' : 'QA / QC - Calidad'}</div>
                  <div className="text-[8px] text-slate-600">AK Drilling International S.A.</div>
                  <div className="text-[8px] text-slate-500 font-mono mt-0.5">Fecha: {record.date}</div>
                </div>
              </td>

              {/* Tercera firma: Jefe de Fabricaciones, o quien recibe la devolución (proveedor/transportista) */}
              <td className="w-1/3 p-2 align-bottom h-24 text-center">
                <div className="mb-2 font-serif italic text-[11px] text-slate-700">
                  {record.signatures?.qaManager?.name || (hasNoConformidad ? (record.returnDetails?.returnCarrier || 'Transportista') : 'Ing. Javier Morales')}
                </div>
                <div className="border-t border-black pt-1">
                  <div className="font-bold uppercase">{hasNoConformidad ? 'Recibió Proveedor / Transportista' : 'Jefe de Fabricaciones'}</div>
                  <div className="text-[8px] text-slate-600">AK Drilling International S.A.</div>
                  <div className="text-[8px] text-slate-500 font-mono mt-0.5">Fecha: {record.date}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer ISO statement */}
      <div className="mt-3 flex items-center justify-between text-[8px] font-sans text-slate-400 border-t border-slate-200 pt-1">
        <span>FORMAIND - Sistema de Digitalización de Procesos Industriales</span>
        <span>Código de Seguridad: SHA256-{record.folio.replace(/-/g, '')}-ISO</span>
        <span>Conforme a Requisitos de Documentación ISO 9001 / IATF 16949</span>
      </div>

    </div>
  );

  if (!isModal) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200 print:p-0 print:bg-white print:fixed-none">
      <div className="bg-slate-100 border border-slate-300 rounded-xl max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden shadow-2xl print:border-none print:shadow-none print:max-w-none print:max-h-none print:rounded-none">
        
        {/* Floating top controls bar (hidden on print) */}
        <div className="px-6 py-3 bg-slate-800 text-white flex items-center justify-between print:hidden shrink-0">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-xs bg-blue-600 px-2 py-0.5 rounded text-white">
              {record.folio}
            </span>
            <span className="text-xs font-semibold text-slate-200">
              Vista Previa de Formato Empresarial Descargable (A4)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar como PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Document Container */}
        <div className="p-6 overflow-y-auto print:p-0 print:overflow-visible">
          {content}
        </div>

      </div>

      {/* Lightbox Modal */}
      {record.evidences && record.evidences.length > 0 && (
        <ImageLightboxModal
          isOpen={lightboxOpen}
          images={record.evidences}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};
