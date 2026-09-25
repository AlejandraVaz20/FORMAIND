import React, { useState } from 'react';

interface VoiceDictationButtonProps {
  onDictate: (text: string) => void;
  className?: string;
}

export default function VoiceDictationButton({ onDictate, className = '' }: VoiceDictationButtonProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSimulatedDictation = () => {
    setStatusMessage('Simulando voz...');
    
    // Frases industriales de prueba para simular el dictado de forma fluida
    const frasesPrueba = [
      "Material verificado sin daños en el contenedor.",
      "Se detectó una ligera variación en las tolerancias del empaque.",
      "Lote recibido conforme a las especificaciones de la orden de compra.",
      "Revisión técnica aprobada satisfactoriamente en planta."
    ];
    
    const fraseAleatoria = frasesPrueba[Math.floor(Math.random() * frasesPrueba.length)];

    setTimeout(() => {
      onDictate(fraseAleatoria);
      setStatusMessage(null);
    }, 400);
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <button
        type="button"
        onClick={handleSimulatedDictation}
        className="flex items-center gap-2 px-4 py-2 rounded-md font-bold transition-all border cursor-pointer bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 shadow-sm"
        title="Simular entrada por voz de forma segura"
      >
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        Dictador (Seguro)
      </button>
      {statusMessage && (
        <span className="text-blue-600 dark:text-blue-400 text-[10px] uppercase tracking-wider mt-1 font-bold animate-pulse">
          {statusMessage}
        </span>
      )}
    </div>
  );
}