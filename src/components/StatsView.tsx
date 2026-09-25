import React from 'react';
import { 
  TrendingUp, 
  Clock, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Leaf, 
  ArrowUpRight, 
  Zap,
  BarChart3
} from 'lucide-react';

export const StatsView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Reportes & Indicadores de Digitalización
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Métricas de transición operativa: reducción de tiempos, cero papel y cumplimiento de turno.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Ahorro en Papel</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">4,280</div>
          <p className="text-xs text-emerald-700 mt-1 font-semibold flex items-center">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span>Hojas físicas eliminadas este mes</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Tiempo por Formato</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">1.8 min</div>
          <p className="text-xs text-blue-700 mt-1 font-semibold flex items-center">
            <span>-76% comparado con papel manual</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Errores de Transcripción</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">0.02%</div>
          <p className="text-xs text-indigo-700 mt-1 font-semibold flex items-center">
            <span>Gracias al autocompletado de SAP</span>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Auditorías ISO 9001</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">100%</div>
          <p className="text-xs text-amber-700 mt-1 font-semibold flex items-center">
            <span>Trazabilidad y firmas conformes</span>
          </p>
        </div>
      </div>

      {/* Comparison block: Formato en Papel vs FORMAIND Digital */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Comparativa de Eficiencia Operativa: Proceso Físico vs. FORMAIND
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Antiguo proceso en papel */}
          <div className="p-5 rounded-xl border border-rose-200 bg-rose-50/20 space-y-3">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 uppercase">
              Formato en Papel (Tradicional)
            </span>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start space-x-2">
                <span className="text-rose-600 font-bold">✕</span>
                <span>Digitación manual repetitiva de códigos de 14 dígitos, proveedores y fechas.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-600 font-bold">✕</span>
                <span>Letra ilegible en planta y riesgo de manchones de aceite o extravío de hojas.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-600 font-bold">✕</span>
                <span>Demora de hasta 48 horas para que los datos lleguen al sistema ERP central.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-600 font-bold">✕</span>
                <span>Promedio de 7.5 minutos por cada hoja física completada.</span>
              </li>
            </ul>
          </div>

          {/* Nuevo proceso digital */}
          <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/20 space-y-3">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase">
              FORMAIND (Digital con Autocompletado)
            </span>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start space-x-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Autocompletado instantáneo al leer el código de barras del lote o PO.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>El operador solo valida y completa 2 a 3 datos físicos faltantes.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Sincronización en tiempo real y folio inmutable con firma digital biométrica.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Promedio de 1.8 minutos con cero hojas impresas.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
