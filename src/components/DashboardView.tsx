import React, { useState } from 'react';
import {
  Search,
  Plus,
  CheckSquare,
  Clock,
  FileCheck2,
  ArrowRight,
  Lightbulb,
  Calendar,
  Microscope,
  Package,
  Cog,
  Truck,
  FileSpreadsheet,
  ExternalLink,
  Filter,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock4
} from 'lucide-react';
import { FormatDefinition, InspectionRecord } from '../types';
import { PredictiveSearchBar } from './PredictiveSearchBar';

interface DashboardViewProps {
  formats: FormatDefinition[];
  inspections: InspectionRecord[];
  onStartFillFormat: (formatId: string) => void;
  onOpenCatalog: () => void;
  onOpenAllHistory: () => void;
  onViewRecord: (record: InspectionRecord) => void;
  onOpenScanner: () => void;
  onNewRecord: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  formats,
  inspections,
  onStartFillFormat,
  onOpenCatalog,
  onOpenAllHistory,
  onViewRecord,
  onOpenScanner,
  onNewRecord
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'reciente' | 'areas'>('reciente');
  const [searchQuery, setSearchQuery] = useState('');

  // Top 4 frequent formats matching image
  const frequentFormats = formats.slice(0, 4);

  // Filtered recent activities based on search
  const filteredInspections = inspections.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.folio.toLowerCase().includes(query) ||
      item.formatTitle.toLowerCase().includes(query) ||
      item.supplier.toLowerCase().includes(query) ||
      item.reference.toLowerCase().includes(query)
    );
  });

  const getFormatIcon = (iconName: string) => {
    switch (iconName) {
      case 'microscope':
        return <Microscope className="w-5 h-5 text-blue-600" />;
      case 'clipboard':
      case 'package':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'cog':
        return <Cog className="w-5 h-5 text-teal-600" />;
      case 'truck':
        return <Truck className="w-5 h-5 text-blue-600" />;
      default:
        return <FileSpreadsheet className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completado':
        return (
          <span className="inline-flex items-center text-xs font-semibold text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
            Completado
          </span>
        );
      case 'En Proceso':
        return (
          <span className="inline-flex items-center text-xs font-semibold text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
            En Proceso
          </span>
        );
      case 'Rechazado':
        return (
          <span className="inline-flex items-center text-xs font-semibold text-rose-700">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
            Rechazado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-xs font-semibold text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">

      {/* Top Header & Search bar matching screenshot */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Panel de Control Simplificado
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Busca cualquier formato operativo o escanea directamente un código de barras para comenzar.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 w-full md:w-auto">
          {/* Predictive Search Bar with autocomplete and Enter key support */}
          <div className="w-full md:w-88">
            <PredictiveSearchBar
              id="input-search-dashboard"
              formats={formats}
              inspections={inspections}
              initialValue={searchQuery}
              placeholder="¿Qué formato o registro necesitas? (Enter para buscar)"
              onSearchSubmit={(q) => setSearchQuery(q)}
              onSelectResult={(result) => {
                if (result.type === 'format') {
                  onStartFillFormat(result.originalItem.id);
                } else if (result.type === 'record') {
                  onViewRecord(result.originalItem);
                } else {
                  setSearchQuery(result.title);
                }
              }}
            />
          </div>

          {/* "+ Nuevo Registro" primary button */}
          <button
            id="btn-nuevo-registro"
            onClick={onNewRecord}
            className="flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-[#1D4ED8] hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Registro</span>
          </button>
        </div>
      </div>

      {/* Industrial Capture Banner (Flujo Rápido) matching image */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2 mb-4 uppercase tracking-wider">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Flujo Rápido de Captura Industrial
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tarjeta 1 */}
          <div className="p-5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-transparent dark:border-slate-700/50 flex gap-4 transition-colors">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-sm shrink-0">1</div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">Selecciona o escanea</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Elige el formato de la lista o lee la etiqueta con el lector de código de barras.</p>
            </div>
          </div>

          {/* Tarjeta 2 */}
          <div className="p-5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-transparent dark:border-slate-700/50 flex gap-4 transition-colors">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-sm shrink-0">2</div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">El sistema autocompleta</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Datos de SAP (PO, proveedor, especificaciones de lote) se cargan sin digitalización manual.</p>
            </div>
          </div>

          {/* Tarjeta 3 */}
          <div className="p-5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-transparent dark:border-slate-700/50 flex gap-4 transition-colors">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-sm shrink-0">3</div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">Completa y válida</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Verifica las cantidades, añade observaciones rápidas y confirma con firma digital.</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metrics Cards Row matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Registros Hoy</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">142</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              +18% vs turno anterior
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            82% de la meta diaria completada
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pendientes de Validación</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">7</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
              2 en revisión
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Dentro del margen operativo normal (límite: 12)
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tiempo Promedio</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">1.8 <span className="text-lg font-normal text-slate-600">min</span></span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              -76% vs papel
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Agilidad promedio por registro digital
          </p>
        </div>
      </div>

      {/* Formatos Más Frecuentes section matching screenshot */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Formatos Más Frecuentes
            </h2>
            <p className="text-xs text-slate-500">
              Acceso directo a las tareas rutinarias de tu turno
            </p>
          </div>
          <button
            id="btn-ver-catalogo"
            onClick={onOpenCatalog}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer"
          >
            <span>Ver catálogo completo (28)</span>
            <span>&gt;</span>
          </button>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {frequentFormats.map((fmt) => (
            <div
              key={fmt.id}
              id={`card-formato-${fmt.id}`}
              className="bg-white border border-slate-200 rounded-xl p-4.5 flex flex-col justify-between shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all group"
            >
              <div>
                {/* Header Tag + Code */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-medium rounded text-[11px]">
                    {fmt.area}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {fmt.code}
                  </span>
                </div>

                {/* Icon in soft blue container */}
                <div className="w-10 h-10 rounded-lg bg-blue-50/80 border border-blue-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  {getFormatIcon(fmt.iconName)}
                </div>

                {/* Title & Description */}
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {fmt.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {fmt.description}
                </p>
              </div>

              {/* Status Indicator & Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center space-x-1.5 text-[11px] font-medium text-emerald-700 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Autocompletado ERP activo</span>
                </div>

                <button
                  id={`btn-llenar-${fmt.id}`}
                  onClick={() => onStartFillFormat(fmt.id)}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer group/btn"
                >
                  <span>Llenar Formato</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Table & Tabs Section matching screenshot */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {/* Sub-tabs header */}
        <div className="flex items-center justify-between px-5 border-b border-slate-200">
          <div className="flex items-center space-x-6">
            <button
              id="tab-actividad-reciente"
              onClick={() => setActiveSubTab('reciente')}
              className={`py-3.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors ${activeSubTab === 'reciente'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              <Clock4 className="w-3.5 h-3.5" />
              <span>Actividad Reciente</span>
            </button>

            <button
              id="tab-formatos-area"
              onClick={() => setActiveSubTab('areas')}
              className={`py-3.5 text-xs font-semibold flex items-center space-x-2 border-b-2 transition-colors ${activeSubTab === 'areas'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Formatos por Área</span>
            </button>
          </div>

          <button
            id="btn-ver-todo-historial"
            onClick={onOpenAllHistory}
            className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
          >
            Ver todo el historial
          </button>
        </div>

        {/* Tab 1: Recent Activity Table */}
        {activeSubTab === 'reciente' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-5">Folio</th>
                  <th className="py-3 px-5">Formato</th>
                  <th className="py-3 px-5">Referencia / Proveedor</th>
                  <th className="py-3 px-5">Hora</th>
                  <th className="py-3 px-5">Estado</th>
                  <th className="py-3 px-5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInspections.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3.5 px-5 font-mono font-medium text-blue-600">
                      {item.folio}
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-900">
                      {item.formatTitle}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      {item.supplier} {item.reference ? `· ${item.reference}` : ''}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-mono">
                      {item.timestamp}
                    </td>
                    <td className="py-3.5 px-5">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => onViewRecord(item)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Tab 2: Formatos por Área breakdown */
          <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">Calidad e Inspección</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono">8 formatos</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">Recepción de materia prima, pruebas dimensionales y liberación de lotes.</p>
              <button
                onClick={onOpenCatalog}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Explorar formatos de Calidad →
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">Almacén e Inventarios</span>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-mono">6 formatos</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">Entradas por PO, traspasos de bodega y pesaje en báscula industrial.</p>
              <button
                onClick={onOpenCatalog}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Explorar formatos de Almacén →
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">Producción y Seguridad</span>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-mono">14 formatos</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">Órdenes de fabricación, checklist de montacargas y rondas TPM.</p>
              <button
                onClick={onOpenCatalog}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Explorar formatos de Planta →
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
