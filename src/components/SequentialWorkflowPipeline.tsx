import React from 'react';
import { 
  ShoppingCart, 
  Microscope, 
  Undo2, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles,
  Layers
} from 'lucide-react';
import { FormatDefinition } from '../types';

interface SequentialWorkflowPipelineProps {
  currentFormatId?: string;
  onSelectFormat: (formatId: string) => void;
  compact?: boolean;
}

export const SequentialWorkflowPipeline: React.FC<SequentialWorkflowPipelineProps> = ({
  currentFormatId,
  onSelectFormat,
  compact = false
}) => {
  const steps = [
    {
      stepNumber: 1,
      formatId: 'for-com-01',
      code: 'FOR-COM-01',
      phase: 'Compra de Material',
      title: '1. Orden de Compra',
      badge: 'Fase Inicial',
      icon: <ShoppingCart className="w-4 h-4" />,
      color: 'blue',
      description: 'Generación formal de la requisición y orden de compra (PO) con especificaciones y proveedor.',
      outcome: 'Emite PO-98421 / Programación de Arribo'
    },
    {
      stepNumber: 2,
      formatId: 'for-cal-04',
      code: 'FOR-CAL-04',
      phase: 'Inspección Física',
      title: '2. Inspección al Recibir',
      badge: 'Recepción Andén',
      icon: <Microscope className="w-4 h-4" />,
      color: 'emerald',
      description: 'Verificación física, conteo y metrología al recibir el producto contrastando vs la Orden de Compra.',
      outcome: 'Aprobación de Ingreso o Detección de Falla'
    },
    {
      stepNumber: 3,
      formatId: 'for-dev-01',
      code: 'FOR-DEV-01',
      phase: 'Devolución y Rechazo',
      title: '3. Devolución (Si aplica)',
      badge: 'No Conformidad',
      icon: <Undo2 className="w-4 h-4" />,
      color: 'rose',
      description: 'Acta oficial de rechazo y retorno cuando se detecta embalaje dañado, fuera de medida o faltante.',
      outcome: 'Retorno a Proveedor / Nota de Crédito'
    }
  ];

  if (compact) {
    return (
      <div className="bg-slate-900 text-white rounded-xl p-3 sm:p-4 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Cadena Secuencial Obligatoria de Suministro & Calidad
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">ISO 9001 / IATF 16949</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {steps.map((s, idx) => {
            const isActive = currentFormatId === s.formatId;
            return (
              <button
                key={s.formatId}
                type="button"
                onClick={() => onSelectFormat(s.formatId)}
                className={`flex items-center space-x-2.5 p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600/30 border-blue-400 text-white shadow-xs ring-1 ring-blue-400'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                  isActive ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}>
                  {s.stepNumber}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">{s.code}</span>
                    {isActive && (
                      <span className="text-[9px] bg-blue-500 text-white px-1.5 py-0.2 rounded font-bold">Activo</span>
                    )}
                  </div>
                  <div className="text-xs font-bold truncate text-slate-100">{s.title}</div>
                </div>
                {idx < 2 && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0 hidden md:block" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-700/80 shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-700/70">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-blue-500 text-white font-mono text-[10px] font-black uppercase tracking-wider">
              Flujo Operativo Secuencial
            </span>
            <span className="text-xs text-slate-300 font-semibold">
              Ciclo Integral de Materiales: Compra ➔ Inspección Física ➔ Devolución
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cada formato está estrictamente encadenado para garantizar trazabilidad y control de no conformidades.
          </p>
        </div>

        <div className="flex items-center space-x-1 text-[11px] text-slate-400 font-mono bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 shrink-0">
          <span>Secuencia Obligatoria</span>
          <span>•</span>
          <span className="text-emerald-400 font-bold">Trazabilidad Total</span>
        </div>
      </div>

      {/* 3 Step Pipeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 relative">
        {steps.map((s, idx) => {
          const isActive = currentFormatId === s.formatId;
          return (
            <div
              key={s.formatId}
              className={`rounded-xl p-4 border transition-all relative flex flex-col justify-between ${
                isActive
                  ? 'bg-blue-950/60 border-blue-400 shadow-lg ring-2 ring-blue-500/40'
                  : 'bg-slate-800/70 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                      s.stepNumber === 1
                        ? 'bg-blue-500 text-white'
                        : s.stepNumber === 2
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-500 text-white'
                    }`}>
                      {s.stepNumber}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-300">
                      {s.code}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    s.stepNumber === 1
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : s.stepNumber === 2
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {s.badge}
                  </span>
                </div>

                <div className="flex items-center space-x-2 mt-1">
                  <div className="p-1.5 rounded-lg bg-slate-700/80 text-white shrink-0">
                    {s.icon}
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">
                    {s.title}
                  </h4>
                </div>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {s.description}
                </p>

                <div className="mt-3 p-2 rounded-lg bg-slate-900/70 border border-slate-800 text-[11px]">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Entregable:</span>
                  <span className="text-slate-200 font-medium">{s.outcome}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/60">
                <button
                  type="button"
                  onClick={() => onSelectFormat(s.formatId)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-xs ${
                    s.stepNumber === 1
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : s.stepNumber === 2
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-rose-700 hover:bg-rose-600 text-white'
                  }`}
                >
                  <span>Llenar Formato Paso {s.stepNumber}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer rule note */}
      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-start space-x-2">
        <Layers className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-200">Regla de Secuencia Operativa:</span> Los datos de la Orden de Compra (<span className="font-mono text-blue-300">FOR-COM-01</span>) se heredan automáticamente en la Inspección Física (<span className="font-mono text-emerald-300">FOR-CAL-04</span>). Si el material inspeccionado es rechazado o está dañado, el sistema genera de inmediato el Acta de Devolución (<span className="font-mono text-rose-300">FOR-DEV-01</span>) con el número de reclamo y fotos anexas.
        </div>
      </div>

    </div>
  );
};
