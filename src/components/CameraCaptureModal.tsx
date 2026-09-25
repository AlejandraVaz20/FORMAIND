import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle, FlipHorizontal } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string, fileName?: string) => void;
  defaultTitle?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  defaultTitle = 'Foto de Evidencia'
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isCapturing, setIsCapturing] = useState(false);

  // Start camera when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setErrorMsg(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startCamera = async () => {
    stopCamera();
    setErrorMsg(null);

    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
        throw new Error('La API de cámara no está disponible en este navegador o contexto.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      // Fallback try without constraints
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.play().catch(() => {});
        }
      } catch (fallbackErr: any) {
        setErrorMsg('No se pudo acceder a la cámara del dispositivo. Verifica los permisos del navegador.');
      }
    }
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Draw frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedImage(dataUrl);
    }

    setTimeout(() => {
      setIsCapturing(false);
    }, 150);
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage, `foto-camara-${Date.now()}.jpg`);
      onClose();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 text-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide">Cámara del Dispositivo</h3>
              <p className="text-[11px] text-slate-400">Captura de evidencia fotográfica en tiempo real</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview Area */}
        <div className="relative bg-black w-full aspect-4/3 sm:aspect-16/9 flex items-center justify-center overflow-hidden">
          {errorMsg ? (
            <div className="p-6 text-center max-w-sm">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
              <p className="text-xs text-white font-medium mb-3">{errorMsg}</p>
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer inline-flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reintentar Conexión</span>
              </button>
            </div>
          ) : capturedImage ? (
            <img 
              src={capturedImage} 
              alt="Captura tomada" 
              className="w-full h-full object-contain"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isCapturing ? 'opacity-30' : 'opacity-100'} transition-opacity`}
              />

              {/* Viewfinder target guides */}
              <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-t-2 border-l-2 border-white/70"></div>
                  <div className="w-6 h-6 border-t-2 border-r-2 border-white/70"></div>
                </div>
                <div className="flex justify-center items-center">
                  <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/70"></div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-b-2 border-l-2 border-white/70"></div>
                  <div className="w-6 h-6 border-b-2 border-r-2 border-white/70"></div>
                </div>
              </div>
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          {capturedImage ? (
            <div className="w-full flex items-center justify-between space-x-3">
              <button
                type="button"
                onClick={retakePhoto}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Volver a Tomar</span>
              </button>
              <button
                type="button"
                onClick={confirmPhoto}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Usar Esta Fotografía</span>
              </button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between">
              <button
                type="button"
                onClick={toggleCamera}
                title="Cambiar Cámara"
                className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              >
                <FlipHorizontal className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={takePhoto}
                disabled={!!errorMsg}
                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer bg-white/20 disabled:opacity-40"
                title="Tomar Foto"
              >
                <div className="w-12 h-12 rounded-full bg-white"></div>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-white px-3 py-2 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
