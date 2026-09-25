import React, { useState, useEffect } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Maximize2, 
  Calendar, 
  MapPin, 
  FileText, 
  HardDrive
} from 'lucide-react';
import { PhotoEvidence } from '../types';

interface ImageLightboxModalProps {
  isOpen: boolean;
  images: PhotoEvidence[];
  initialIndex?: number;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  images,
  initialIndex = 0,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoomLevel(1);
    setRotation(0);
  }, [initialIndex, isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handleNext = () => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setZoomLevel(1);
    setRotation(0);
  };

  const handlePrev = () => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setZoomLevel(1);
    setRotation(0);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  const handleDownload = () => {
    if (!currentImage.imageUrl) return;
    const a = document.createElement('a');
    a.href = currentImage.imageUrl;
    a.download = currentImage.fileName || `evidencia_${currentImage.id || 'foto'}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const extension = currentImage.fileName
    ? currentImage.fileName.split('.').pop()?.toUpperCase()
    : currentImage.fileType
    ? currentImage.fileType.split('/')[1]?.toUpperCase()
    : 'IMAGEN';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-6xl h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-950/80 border-b border-slate-800/80 text-white shrink-0 z-10">
          <div className="flex items-center space-x-3 min-w-0">
            <span className="px-2 py-0.5 rounded bg-blue-600/90 text-[10px] font-mono font-bold tracking-wider uppercase shrink-0">
              {extension}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-100 truncate">
                {currentImage.title || 'Evidencia Fotográfica'}
              </h3>
              <p className="text-[11px] text-slate-400 truncate flex items-center space-x-2">
                <span>Foto {currentIndex + 1} de {images.length}</span>
                {currentImage.fileName && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-slate-300">{currentImage.fileName}</span>
                  </>
                )}
                {currentImage.fileSize && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-slate-300">{currentImage.fileSize}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Acercar (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Alejar (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRotate}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer hidden sm:flex"
              title="Rotar 90°"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-xs font-mono font-bold hidden sm:flex"
              title="Restablecer tamaño original (0)"
            >
              100%
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Descargar imagen"
            >
              <Download className="w-4 h-4" />
            </button>
            <div className="h-5 w-[1px] bg-slate-800 mx-1" />
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-rose-900/40 rounded-lg transition-colors cursor-pointer"
              title="Cerrar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Image Canvas */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 bg-slate-950/60">
          
          {/* Navigation Previous Button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-blue-600 text-white border border-slate-700/80 shadow-xl transition-all cursor-pointer z-20 hover:scale-110"
              title="Foto anterior (←)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Main Image */}
          <div 
            className="transition-transform duration-200 ease-out max-w-full max-h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
            style={{
              transform: `scale(${zoomLevel}) rotate(${rotation}deg)`
            }}
          >
            <img 
              src={currentImage.imageUrl} 
              alt={currentImage.title}
              className="max-h-[70vh] max-w-[85vw] object-contain rounded-lg shadow-2xl pointer-events-auto ring-1 ring-slate-800"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Navigation Next Button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-blue-600 text-white border border-slate-700/80 shadow-xl transition-all cursor-pointer z-20 hover:scale-110"
              title="Siguiente foto (→)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Zoom indicator bubble */}
          {zoomLevel !== 1 && (
            <div className="absolute bottom-4 left-4 bg-slate-900/90 text-white font-mono text-xs px-3 py-1 rounded-full border border-slate-700 z-10">
              Zoom: {Math.round(zoomLevel * 100)}%
            </div>
          )}
        </div>

        {/* Bottom Info Bar & Thumbnails */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shrink-0">
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-[11px]">
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>{currentImage.timestamp || 'Fecha no registrada'}</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentImage.location || 'Planta'}</span>
            </span>
            {currentImage.fileSize && (
              <span className="flex items-center space-x-1.5">
                <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono">{currentImage.fileSize}</span>
              </span>
            )}
          </div>

          {/* Thumbnails strip if multiple photos */}
          {images.length > 1 && (
            <div className="flex items-center space-x-2 overflow-x-auto py-0.5">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setZoomLevel(1);
                    setRotation(0);
                  }}
                  className={`w-11 h-11 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    currentIndex === idx 
                      ? 'border-blue-500 ring-2 ring-blue-500/40 scale-105' 
                      : 'border-slate-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={img.imageUrl} 
                    alt={img.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
