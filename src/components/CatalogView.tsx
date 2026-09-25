import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowRight, 
  Microscope, 
  Package, 
  Cog, 
  Truck, 
  Shield, 
  Wrench, 
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';
import { FormatDefinition, AreaType } from '../types';

interface CatalogViewProps {
  formats: FormatDefinition[];
  onStartFillFormat: (formatId: string) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  formats,
  onStartFillFormat
}) => {
  const [selectedArea, setSelectedArea] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const areas: string[] = ['Todas', 'Calidad', 'Almacén', 'Producción', 'Ventas', 'Seguridad', 'Mantenimiento'];

  const filteredFormats = formats.filter((fmt) => {
    const matchesArea = selectedArea === 'Todas' || fmt.area === selectedArea;
    const matchesSearch = 
      fmt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fmt.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fmt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fmt.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesArea && matchesSearch;
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
      case 'shield':
        return <Shield className="w-5 h-5 text-amber-600" />;
      case 'wrench':
        return <Wrench className="w-5 h-5 text-indigo-600" />;
      default:
        return <FileSpreadsheet className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Catálogo Oficial de Formatos Industriales
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            28 formatos operativos estandarizados con autocompletado ERP disponible.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, código o norma..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Area Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {areas.map((area) => (
          <button
            key={area}
            onClick={() => setSelectedArea(area)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedArea === area
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {area}
          </button>
        ))}
      </div>

      {/* Formats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFormats.map((fmt) => (
          <div
            key={fmt.id}
            className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded text-[10px]">
                  {fmt.area}
                </span>
                <span className="font-mono text-xs font-semibold text-slate-400">
                  {fmt.code}
                </span>
              </div>

              <div className="flex items-start space-x-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50/80 border border-blue-100 flex items-center justify-center shrink-0">
                  {getFormatIcon(fmt.iconName)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {fmt.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>~{fmt.estimatedMinutes} min promedio</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                {fmt.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {fmt.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded border border-slate-100"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* ERP Fields preview */}
              <div className="mt-3 p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  ⚡ Datos que el sistema autocompleta:
                </span>
                <span className="text-[11px] text-slate-600 line-clamp-1">
                  {fmt.erpPrefilledFields.slice(0, 3).join(', ')}...
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => onStartFillFormat(fmt.id)}
                className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer group/btn"
              >
                <span>Digitalizar este Formato</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
