import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Scan, 
  Camera, 
  Flashlight, 
  FlashlightOff,
  CheckCircle2, 
  Barcode, 
  QrCode, 
  Zap,
  RotateCcw,
  AlertCircle,
  Keyboard
} from 'lucide-react';
import { ErpSampleRecord } from '../types';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  erpRecords: ErpSampleRecord[];
  onBarcodeDetected: (record: ErpSampleRecord) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  erpRecords,
  onBarcodeDetected
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isScanningRef = useRef<boolean>(false);

  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedSuccess, setScannedSuccess] = useState<ErpSampleRecord | null>(null);
  const [torchSupported, setTorchSupported] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [manualCode, setManualCode] = useState<string>('');

  // Synthesize industrial beep using Web Audio API
  const playBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Audio context might be restricted before gesture
    }
  };

  const handleSuccessfulDetection = useCallback((codeRaw: string) => {
    if (scannedSuccess) return;

    playBeep();
    const clean = codeRaw.trim().toUpperCase();

    // Check if code matches any ERP record
    let match = erpRecords.find(r => 
      r.code.toUpperCase().includes(clean) || 
      clean.includes(r.code.toUpperCase()) ||
      (r.heatOrLot && r.heatOrLot.toUpperCase().includes(clean)) ||
      (r.remissionGuide && r.remissionGuide.toUpperCase().includes(clean))
    );

    // If not found in mock, create a dynamic match so physical tags also work!
    if (!match) {
      match = {
        id: `erp-scan-${Date.now()}`,
        code: clean.startsWith('PO') || clean.startsWith('GR') || clean.startsWith('LOT') ? clean : `TAG-${clean}`,
        type: clean.includes('LOT') ? 'LOTE' : clean.includes('OF') ? 'OF' : 'PO',
        title: `Material Identificado vía Escaneo (${clean})`,
        supplierOrClient: 'Proveedor de Etiqueta Industrial Escaneada',
        supplierCode: 'PRV-SCAN-01',
        materialCode: `MAT-${clean.slice(0, 8)}`,
        materialName: `Insumo validado por código de barras ${clean}`,
        expectedQuantity: 100,
        unit: 'pzas',
        specification: 'Identificación directa por lectura óptica de andén',
        warehouseLocation: 'Planta Norte - Bahía de Recepción',
        orderDate: new Date().toISOString().split('T')[0]
      };
    }

    setScannedSuccess(match);

    setTimeout(() => {
      onBarcodeDetected(match!);
      setScannedSuccess(null);
      onClose();
    }, 850);
  }, [erpRecords, onBarcodeDetected, onClose, scannedSuccess]);

  // Stop camera tracks
  const stopCamera = () => {
    isScanningRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
  };

  // Start camera and barcode detection loop
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    setScannedSuccess(null);

    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCamera(false);
        setCameraError('El acceso a cámara no está soportado en este navegador.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      // Check if torch/flashlight is supported
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities: any = track.getCapabilities ? track.getCapabilities() : {};
        if (capabilities.torch) {
          setTorchSupported(true);
        }
      }

      // Initialize BarcodeDetector if available
      const BarcodeDetectorClass = (window as any).BarcodeDetector;
      if (BarcodeDetectorClass) {
        try {
          const barcodeDetector = new BarcodeDetectorClass({
            formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'data_matrix']
          });

          isScanningRef.current = true;

          const scanLoop = async () => {
            if (!isScanningRef.current || !videoRef.current) return;

            if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              try {
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes && barcodes.length > 0) {
                  const raw = barcodes[0].rawValue;
                  if (raw) {
                    handleSuccessfulDetection(raw);
                    return; // Stop scan loop on first detection
                  }
                }
              } catch {
                // detector frame error, keep trying
              }
            }

            if (isScanningRef.current) {
              animationFrameRef.current = requestAnimationFrame(scanLoop);
            }
          };

          animationFrameRef.current = requestAnimationFrame(scanLoop);
        } catch (e) {
          console.warn('Error inicializando BarcodeDetector:', e);
        }
      }

    } catch (err: any) {
      console.warn('No se pudo acceder a la cámara:', err);
      setCameraError('Permiso de cámara no concedido o cámara en uso por otra aplicación.');
    }
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextState = !isTorchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextState }]
      });
      setIsTorchOn(nextState);
    } catch (e) {
      console.warn('Error al activar linterna:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleSuccessfulDetection(manualCode.trim());
      setManualCode('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-0 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Lector de Código de Barras / QR en Vivo
              </h3>
              <p className="text-[11px] text-slate-500">
                Apunta hacia la etiqueta industrial o introduce el código
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {torchSupported && (
              <button
                type="button"
                onClick={toggleTorch}
                title={isTorchOn ? 'Apagar linterna' : 'Encender linterna industrial'}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isTorchOn ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                {isTorchOn ? <Flashlight className="w-4 h-4" /> : <FlashlightOff className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Camera Viewfinder */}
        <div className="p-4 bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden min-h-[260px] flex-1">
          {/* Real video feed */}
          <video
            ref={videoRef}
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover opacity-85"
          />

          {/* Viewfinder brackets */}
          <div className="w-64 sm:w-72 h-40 border-2 border-blue-400/90 rounded-xl relative flex items-center justify-center z-10 pointer-events-none">
            <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-blue-500 rounded-tl" />
            <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-blue-500 rounded-tr" />
            <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-blue-500 rounded-bl" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-blue-500 rounded-br" />

            {/* Laser scanning line animation */}
            <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_14px_#f43f5e] animate-bounce" />

            {scannedSuccess ? (
              <div className="bg-emerald-500/95 backdrop-blur-xs text-white px-4 py-2.5 rounded-lg flex items-center space-x-2 text-xs font-bold shadow-2xl animate-in zoom-in-95">
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Leído: {scannedSuccess.code}!</span>
              </div>
            ) : (
              <div className="text-center text-slate-300 text-xs flex flex-col items-center drop-shadow-md">
                <Barcode className="w-8 h-8 text-blue-400 mb-1 animate-pulse" />
                <span className="font-medium">Enfocando código 1D / 2D...</span>
              </div>
            )}
          </div>

          {/* Subtext info */}
          <div className="mt-3 relative z-10 flex items-center space-x-2 text-[11px] text-slate-300 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>
              {cameraError ? 'Modo lector listo con códigos manuales' : 'Sensor óptico activo (BarcodeDetector)'}
            </span>
          </div>
        </div>

        {/* Manual Barcode Input & Quick Demo Codes */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-3 shrink-0 overflow-y-auto max-h-[300px]">
          
          {/* Text input for handheld scanner / keyboard entry */}
          <form onSubmit={handleManualSubmit} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Keyboard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="O escribe o pega el código (ej. PO-98421-MX)..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              Validar
            </button>
          </form>

          {/* Quick Demo Codes */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-600 uppercase">
                Códigos de Prueba Rápidos:
              </span>
              <span className="text-[10px] text-blue-600 font-semibold">1-Click</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {erpRecords.slice(0, 4).map((rec) => (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => handleSuccessfulDetection(rec.code)}
                  className="flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-left text-xs group cursor-pointer"
                >
                  <div className="min-w-0 pr-1">
                    <span className="font-mono font-bold text-slate-900 group-hover:text-blue-700 block truncate">
                      {rec.code}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {rec.supplierOrClient}
                    </span>
                  </div>
                  <Barcode className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
