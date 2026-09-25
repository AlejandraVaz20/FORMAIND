import React from 'react';
import { 
  ShoppingCart, 
  Microscope, 
  Undo2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  PackageCheck,
  Building2,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { InspectionRecord } from '../types';

interface TraceabilityFlowGraphProps {
  record: InspectionRecord;
  onNavigateToRecord?: (folio: string) => void;
  className?: string;
}

export const TraceabilityFlowGraph: React.FC<TraceabilityFlowGraphProps> = ({
  record,
  onNavigateToRecord,
  className = ''
}) => {
  const isPurchase = record.workflowPhase === 'compra' || record.formatCode === 'FOR-COM-01';
  const isInspection = record.workflowPhase === 'inspeccion' || record.formatCode === 'FOR-CAL-04';
  const isReturn = record.workflowPhase === 'devolucion' || record.formatCode === 'FOR-DEV-01' || record.status === 'Rechazado';

  const isRejected = record.status === 'Rechazado';
  const hasDiscrepancy = record.discrepancy?.hasDiscrepancy;

  // Nodes definition
  const nodes = [
    {
      id: 'step-1-po',
      phaseNumber: 1,
      title: 'Orden de Compra (PO)',
      code: record.reference || 'PO-98421-MX',
      subtext: record.supplier,
      icon: <ShoppingCart className="w-4 h-4" />,
      status: 'completado',
      isCurrent: isPurchase,
      badgeText: 'Fase Inicial SAP',
      date: record.erpData?.purchaseOrder ? record.date : 'Emitida'
    },
    {
      id: 'step-2-insp',
      phaseNumber: 2,
      title: 'Inspección en Andén',
      code: isInspection ? record.folio : (record.linkedInspectionFolio || 'REG-CAL-2024-1042'),
      subtext: `${record.capturedData?.actualQty || record.erpData?.expectedQty || 100} pzas inspeccionadas`,
      icon: <Microscope className="w-4 h-4" />,
      status: isRejected ? 'rechazado' : hasDiscrepancy ? 'discrepancia' : 'completado',
      isCurrent: isInspection,
      badgeText: isRejected ? 'Rechazado' : hasDiscrepancy ? 'Con Discrepancia' : 'Aprobado',
      date: record.date
    },
    {
      id: 'step-3-dest',
      phaseNumber: 3,
      title: isRejected ? 'Acta de Devolución' : 'Liberación a Planta',
      code: isRejected 
        ? (record.returnDetails?.trackingGuide || 'REG-DEV-2024-0012')
        : 'Bahía 4 - Aceptado',
      subtext: isRejected 
        ? (record.returnDetails?.damageType || 'Material No Conforme')
        : 'Ingreso Autorizado a Inventario',
      icon: isRejected ? <Undo2 className="w-4 h-4" /> : <PackageCheck className="w-4 h-4" />,
      status: isRejected ? (isReturn ? 'en_curso' : 'requerido') : 'completado',
      isCurrent: isReturn,
      badgeText: isRejected ? 'Cuarentena / Retorno' : 'Conforme ISO 9001',
      date: isRejected ? 'En Retorno' : 'Liberado'
    }
  ];

  return (
    <div className={`bg-slate-900 text-white rounded-xl p-4 border border-slate-800 shadow-md ${className}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold uppercase tracking-wider text-slate-200">
            Cadena de Trazabilidad del Lote & Ciclo de Vida
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Ref: <strong className="text-blue-400">{record.reference}</strong>
        </span>
      </div>

      {/* Nodes Connection Graph */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative">
        {nodes.map((node, index) => {
          let ringColor = 'border-slate-700 bg-slate-800/80 text-slate-300';
          let badgeBg = 'bg-slate-700 text-slate-300';
          let statusIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;

          if (node.status === 'completado') {
            ringColor = node.isCurrent
              ? 'border-blue-500 bg-blue-950/60 ring-2 ring-blue-500/60 text-white'
              : 'border-emerald-700/60 bg-emerald-950/30 text-slate-200';
            badgeBg = 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50';
            statusIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
          } else if (node.status === 'rechazado') {
            ringColor = 'border-rose-500 bg-rose-950/60 ring-2 ring-rose-500/60 text-white';
            badgeBg = 'bg-rose-900/70 text-rose-200 border border-rose-700';
            statusIcon = <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
          } else if (node.status === 'discrepancia') {
            ringColor = 'border-amber-500 bg-amber-950/60 ring-2 ring-amber-500/60 text-white';
            badgeBg = 'bg-amber-900/70 text-amber-200 border border-amber-700';
            statusIcon = <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
          } else if (node.status === 'en_curso') {
            ringColor = 'border-blue-400 bg-blue-900/50 ring-2 ring-blue-400 text-white animate-pulse';
            badgeBg = 'bg-blue-900 text-blue-200 border border-blue-600';
            statusIcon = <AlertTriangle className="w-3.5 h-3.5 text-blue-300 shrink-0" />;
          }

          return (
            <div key={node.id} className="relative flex flex-col">
              {/* Connector arrow on desktop */}
              {index < nodes.length - 1 && (
                <div className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 text-slate-500">
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </div>
              )}

              {/* Node Card */}
              <div 
                className={`p-3 rounded-lg border transition-all h-full flex flex-col justify-between ${ringColor}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-700 text-[10px] font-bold flex items-center justify-center text-slate-200">
                        {node.phaseNumber}
                      </span>
                      <span className="text-xs font-bold truncate">
                        {node.title}
                      </span>
                    </div>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${badgeBg}`}>
                      {node.badgeText}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      <div className="p-1 rounded bg-slate-800 text-slate-300 shrink-0">
                        {node.icon}
                      </div>
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-black text-blue-300 block truncate">
                          {node.code}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {node.subtext}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center space-x-1">
                    {statusIcon}
                    <span>{node.date}</span>
                  </div>
                  {node.isCurrent && (
                    <span className="text-[9px] font-bold text-blue-300 bg-blue-900/60 px-1.5 py-0.2 rounded border border-blue-500/40 uppercase">
                      Paso Seleccionado
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
