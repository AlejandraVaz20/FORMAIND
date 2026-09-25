import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  ArrowRight, 
  FileText, 
  Database, 
  Clock, 
  CheckCircle2, 
  CornerDownLeft,
  Layers,
  Sparkles
} from 'lucide-react';
import { FormatDefinition, InspectionRecord, ErpSampleRecord } from '../types';

export interface PredictiveSearchResult {
  id: string;
  type: 'format' | 'record' | 'erp' | 'text';
  title: string;
  subtitle: string;
  badge?: string;
  code?: string;
  originalItem?: any;
}

interface PredictiveSearchBarProps {
  formats?: FormatDefinition[];
  inspections?: InspectionRecord[];
  erpRecords?: ErpSampleRecord[];
  placeholder?: string;
  initialValue?: string;
  onSearchSubmit: (query: string) => void;
  onSelectResult?: (result: PredictiveSearchResult) => void;
  className?: string;
  id?: string;
  autoFocus?: boolean;
}

export const PredictiveSearchBar: React.FC<PredictiveSearchBarProps> = ({
  formats = [],
  inspections = [],
  erpRecords = [],
  placeholder = 'Buscar por formato, orden ERP, proveedor o folio...',
  initialValue = '',
  onSearchSubmit,
  onSelectResult,
  className = '',
  id = 'predictive-search-input'
}) => {
  const [query, setQuery] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Sync initialValue if changed
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute predictive suggestions
  const suggestions: PredictiveSearchResult[] = React.useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (!clean) return [];

    const results: PredictiveSearchResult[] = [];

    // 1. Matches in Formats
    formats.forEach(f => {
      if (
        f.title.toLowerCase().includes(clean) ||
        f.code.toLowerCase().includes(clean) ||
        f.area.toLowerCase().includes(clean) ||
        f.description.toLowerCase().includes(clean)
      ) {
        results.push({
          id: `format-${f.id}`,
          type: 'format',
          title: f.title,
          subtitle: `${f.code} • ${f.area}`,
          badge: 'Formato',
          code: f.code,
          originalItem: f
        });
      }
    });

    // 2. Matches in Registered Inspections (Trazabilidad)
    inspections.forEach(r => {
      if (
        r.folio.toLowerCase().includes(clean) ||
        r.formatTitle.toLowerCase().includes(clean) ||
        r.supplier.toLowerCase().includes(clean) ||
        r.reference.toLowerCase().includes(clean) ||
        r.operatorName.toLowerCase().includes(clean)
      ) {
        results.push({
          id: `record-${r.id}`,
          type: 'record',
          title: `${r.folio} - ${r.supplier}`,
          subtitle: `${r.formatTitle} • ${r.date}`,
          badge: r.status,
          code: r.folio,
          originalItem: r
        });
      }
    });

    // 3. Matches in ERP records
    erpRecords.forEach(e => {
      if (
        e.code.toLowerCase().includes(clean) ||
        e.materialName.toLowerCase().includes(clean) ||
        e.supplierOrClient.toLowerCase().includes(clean)
      ) {
        results.push({
          id: `erp-${e.id}`,
          type: 'erp',
          title: `${e.code} (${e.supplierOrClient})`,
          subtitle: `${e.materialName} • ${e.expectedQuantity} ${e.unit}`,
          badge: 'ERP SAP',
          code: e.code,
          originalItem: e
        });
      }
    });

    return results.slice(0, 8); // Top 8 predictive matches
  }, [query, formats, inspections, erpRecords]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen && suggestions.length > 0) {
        setIsOpen(true);
        setSelectedIndex(0);
      } else {
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelect(suggestions[selectedIndex]);
      } else {
        // Submit what user typed
        executeSearch(query);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleSelect = (item: PredictiveSearchResult) => {
    setQuery(item.title);
    setIsOpen(false);
    setSelectedIndex(-1);
    if (onSelectResult) {
      onSelectResult(item);
    } else {
      onSearchSubmit(item.title);
    }
  };

  const executeSearch = (textToSearch: string) => {
    setIsOpen(false);
    setSelectedIndex(-1);
    onSearchSubmit(textToSearch);
  };

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    onSearchSubmit('');
    inputRef.current?.focus();
  };

  // Helper to highlight matched query substring
  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? (
        <span key={i} className="bg-amber-200/80 text-slate-900 font-bold px-0.5 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      
      {/* Search Input Field */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
            // Also notify parent for live filter as typing
            onSearchSubmit(e.target.value);
          }}
          onFocus={() => {
            if (query.trim().length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-9 pr-16 py-2.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs"
        />

        <div className="absolute right-2.5 flex items-center space-x-1">
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="Borrar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => executeSearch(query)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
            title="Presiona Enter para buscar"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Predictive Suggestions Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 max-h-[380px] flex flex-col">
          
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>Sugerencias predictivas para "{query}"</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              Presiona <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded font-semibold">↵ Enter</kbd> para buscar
            </span>
          </div>

          <div className="overflow-y-auto divide-y divide-slate-100 text-xs py-1">
            {suggestions.length > 0 ? (
              suggestions.map((item, index) => {
                const isHighlighted = selectedIndex === index;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isHighlighted ? 'bg-blue-50/80 text-blue-900' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <div className={`p-1.5 rounded-md shrink-0 ${
                        item.type === 'format' 
                          ? 'bg-blue-100 text-blue-700' 
                          : item.type === 'record' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.type === 'format' && <FileText className="w-3.5 h-3.5" />}
                        {item.type === 'record' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {item.type === 'erp' && <Database className="w-3.5 h-3.5" />}
                      </div>

                      <div className="min-w-0">
                        <div className="font-bold truncate text-xs">
                          {highlightMatch(item.title, query)}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      {item.badge && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.badge === 'Formato'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : item.badge === 'Completado' || item.badge === 'OK'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.badge === 'ERP SAP'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isHighlighted ? 'translate-x-0.5 text-blue-600' : 'text-slate-300'}`} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-slate-400">
                <p className="text-xs">No hay sugerencias coincidentes directas.</p>
                <button
                  type="button"
                  onClick={() => executeSearch(query)}
                  className="mt-1.5 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Buscar "{query}" en todo el sistema →
                </button>
              </div>
            )}
          </div>

          <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => executeSearch(query)}
              className="text-[11px] font-bold text-slate-600 hover:text-blue-700 w-full py-1 text-center cursor-pointer"
            >
              Ver todos los resultados para "{query}" →
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
