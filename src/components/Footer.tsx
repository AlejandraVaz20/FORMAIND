import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-slate-50/70 text-slate-400 text-xs py-5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-600">FormaInd</span>
          <span>© 2025</span>
          <span>·</span>
          <span>Digitalización de Procesos Industriales</span>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-slate-500">
          <span>Conforme ISO 9001 / IATF 16949</span>
          <span>·</span>
          <span className="flex items-center space-x-1 text-emerald-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Terminal activa</span>
          </span>
          <span>·</span>
          <span>Planta Norte</span>
        </div>
      </div>
    </footer>
  );
};
