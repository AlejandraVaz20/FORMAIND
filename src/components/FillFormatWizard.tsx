import React, { useState, useRef, useEffect } from 'react';
import VoiceDictationButton from './VoiceDictationButton';
import { saveDraftToDB } from '../utils/offlineStorage';

interface FillFormatWizardProps {
  setRoute?: (route: string) => void;
  draftData?: any;
}

interface EvidenciaItem {
  id: string;
  url: string;
  nombre: string;
}

export function FillFormatWizard({ setRoute, draftData }: FillFormatWizardProps) {
  const [formatType, setFormatType] = useState<'recepcion' | 'inspeccion'>(draftData?.tipo || 'recepcion');
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState({
    id: draftData?.id || '',
    proveedor: draftData?.proveedor || '',
    ordenCompra: draftData?.ordenCompra || '',
    fecha: draftData?.fecha || new Date().toISOString().split('T')[0],
    transportista: draftData?.transportista || '',
    numeroContenedor: draftData?.numeroContenedor || '', 
    codigoMaterial: draftData?.codigoMaterial || '',
    cantidadEsperada: draftData?.cantidadEsperada || '',
    cantidadRecibida: draftData?.cantidadRecibida || '',
    observaciones: draftData?.observaciones || '',
    caracteristicasEvaluadas: draftData?.caracteristicasEvaluadas || '',
    evidencias: (draftData?.evidencias || []) as EvidenciaItem[], 
    estado: 'completado'
  });
  
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // --- CÁMARA EN TIEMPO REAL ---
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
      alert("No se pudo acceder a la cámara. Verifica los permisos del navegador.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL('image/jpeg');
        
        setFormData(prev => ({
          ...prev,
          evidencias: [
            ...prev.evidencias,
            {
              id: Date.now().toString(),
              url: imageUrl,
              nombre: `Evidencia ${prev.evidencias.length + 1}`
            }
          ]
        }));
        
        stopCamera();
      }
    }
  };

  const handleDictation = (text: string) => {
    setFormData(prev => ({
      ...prev,
      observaciones: prev.observaciones ? `${prev.observaciones} ${text}` : text
    }));
  };

  const handleSaveDraft = async () => {
    setSaveStatus('Guardando...');
    try {
      await saveDraftToDB({ ...formData, tipo: formatType, id: formData.id || Date.now().toString(), estado: 'borrador' });
      setSaveStatus('Borrador guardado');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error(error);
      setSaveStatus('Error al guardar');
    }
  };

  const handleGoBack = () => {
    if (setRoute) {
      setRoute('inicio');
    }
  };

  const handleNextStep = () => {
    if (formatType === 'recepcion') {
      setFormatType('inspeccion');
    } else {
      setShowPreview(true);
    }
  };

  // Función para confirmar el registro y enviarlo a la sección de Registros completados
  const handleConfirmAndComplete = async () => {
    try {
      const finalRecord = { 
        ...formData, 
        tipo: formatType, 
        id: formData.id || Date.now().toString(), 
        estado: 'completado',
        fechaCompletado: new Date().toISOString()
      };
      
      // Guardamos en la base de datos local como completado (puede adaptarse según tu función de registros)
      await saveDraftToDB(finalRecord);

      setShowPreview(false);
      
      // Redirigimos automáticamente a la vista de Registros & Trazabilidad
      if (setRoute) {
        setRoute('registros');
      }
    } catch (error) {
      console.error("Error al finalizar el registro:", error);
      alert("Hubo un error al guardar el registro completado.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          evidencias: [
            ...prev.evidencias,
            {
              id: Date.now().toString(),
              url: reader.result as string,
              nombre: `Evidencia ${prev.evidencias.length + 1}`
            }
          ]
        }));
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const inputClass = "w-full p-2.5 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all outline-none";
  const labelClass = "block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide";
  const sectionClass = "bg-slate-50 p-5 rounded-xl border border-slate-200/80 shadow-sm";
  const sectionTitleClass = "text-blue-700 font-extrabold mb-4 flex items-center gap-2 border-b border-slate-200 pb-2 text-sm uppercase tracking-wide";

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-slate-200 relative">
      
      {/* MODAL DE VISTA PREVIA Y CONFIRMACIÓN */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 uppercase">Documento Consolidado de Inspección</h2>
                <p className="text-xs text-slate-500">FORMAIND - Sistema de Digitalización Industrial</p>
              </div>
              <button 
                onClick={() => setShowPreview(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                <div><span className="font-bold text-slate-500 uppercase">Proveedor:</span> {formData.proveedor || 'N/A'}</div>
                <div><span className="font-bold text-slate-500 uppercase">Orden de Compra (PO):</span> {formData.ordenCompra || 'N/A'}</div>
                <div><span className="font-bold text-slate-500 uppercase">Fecha:</span> {formData.fecha}</div>
                <div><span className="font-bold text-slate-500 uppercase">Contenedor:</span> {formData.numeroContenedor || 'N/A'}</div>
                <div><span className="font-bold text-slate-500 uppercase">Material:</span> {formData.codigoMaterial || 'N/A'}</div>
                <div><span className="font-bold text-slate-500 uppercase">Cantidad Recibida:</span> {formData.cantidadRecibida || '0'} / {formData.cantidadEsperada || '0'}</div>
              </div>

              <div className="border border-slate-200 p-4 rounded-lg">
                <h4 className="font-bold text-xs uppercase text-blue-600 mb-1">A. Evaluación Técnica (Calidad)</h4>
                <p className="text-xs text-slate-600 whitespace-pre-wrap">{formData.caracteristicasEvaluadas || 'Sin observaciones técnicas registradas.'}</p>
              </div>

              <div className="border border-slate-200 p-4 rounded-lg">
                <h4 className="font-bold text-xs uppercase text-blue-600 mb-2">B. Evidencias Fotográficas ({formData.evidencias.length})</h4>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {formData.evidencias.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No se adjuntaron evidencias.</span>
                  ) : (
                    formData.evidencias.map((ev: EvidenciaItem) => (
                      <div key={ev.id} className="w-20 shrink-0 text-center">
                        <img src={ev.url} alt={ev.nombre} className="w-20 h-20 object-cover rounded border border-slate-200 mb-1" />
                        <span className="text-[10px] font-medium text-slate-600 truncate block">{ev.nombre}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="border border-slate-200 p-4 rounded-lg">
                <h4 className="font-bold text-xs uppercase text-blue-600 mb-1">C. Observaciones y Comentarios</h4>
                <p className="text-xs text-slate-600">{formData.observaciones || 'Sin comentarios adicionales.'}</p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-emerald-800 block">Responsable de Captura:</span>
                  <span className="text-emerald-700">Ing. Carlos Mendoza (Supervisor de Calidad - Planta Norte)</span>
                </div>
                <span className="bg-emerald-600 text-white font-bold px-3 py-1 rounded-full text-[10px]">Firma Digital OK</span>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Regresar a Editar
              </button>
              <button
                onClick={handleConfirmAndComplete}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-blue-700 transition-all cursor-pointer"
              >
                Confirmar y Ver en Registros &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CÁMARA */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent p-4 flex justify-between items-center z-10">
              <span className="text-white font-bold tracking-wider uppercase text-sm">Captura de Evidencia</span>
              <button onClick={stopCamera} className="text-white hover:text-rose-500 transition-colors bg-black/50 rounded-full p-1.5 cursor-pointer">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <video ref={videoRef} autoPlay playsInline className="w-full h-auto max-h-[70vh] object-contain" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-6 flex justify-center pb-8">
              <button 
                type="button"
                onClick={takePhoto}
                className="w-16 h-16 rounded-full bg-white/20 border-4 border-white flex items-center justify-center hover:bg-white/40 hover:scale-105 transition-all cursor-pointer"
                title="Tomar fotografía"
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-inner"></div>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 flex gap-3 border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={() => setFormatType('recepcion')}
          className={`px-5 py-2.5 rounded-lg font-bold transition-all text-sm cursor-pointer ${
            formatType === 'recepcion' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Formato de Recepción
        </button>
        <button
          type="button"
          onClick={() => setFormatType('inspeccion')}
          className={`px-5 py-2.5 rounded-lg font-bold transition-all text-sm cursor-pointer ${
            formatType === 'inspeccion' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Formato de Inspección
        </button>
      </div>

      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 sm:pr-4">

        {formatType === 'recepcion' && (
          <>
            <div className={sectionClass}>
              <h3 className={sectionTitleClass}>
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-md flex items-center justify-center text-xs">1</span>
                Datos Generales del Proveedor
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Proveedor</label>
                  <input type="text" className={inputClass} value={formData.proveedor} onChange={e => setFormData({...formData, proveedor: e.target.value})} placeholder="Ej. Aceros Industriales SA" />
                </div>
                <div>
                  <label className={labelClass}>Orden de Compra (PO)</label>
                  <input type="text" className={inputClass} value={formData.ordenCompra} onChange={e => setFormData({...formData, ordenCompra: e.target.value})} placeholder="Ej. PO-98421" />
                </div>
                <div>
                  <label className={labelClass}>Fecha de Recepción</label>
                  <input type="date" className={inputClass} value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} />
                </div>
              </div>
            </div>

            <div className={sectionClass}>
              <h3 className={sectionTitleClass}>
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-md flex items-center justify-center text-xs">2</span>
                Logística y Transporte
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Línea Transportista / Chofer</label>
                  <input type="text" className={inputClass} value={formData.transportista} onChange={e => setFormData({...formData, transportista: e.target.value})} placeholder="Nombre de línea o chofer" />
                </div>
                <div>
                  <label className={labelClass}>Número de Contenedor</label>
                  <input type="text" className={inputClass} value={formData.numeroContenedor} onChange={e => setFormData({...formData, numeroContenedor: e.target.value})} placeholder="Ej. HLXU 123456-7" />
                </div>
              </div>
            </div>

            <div className={sectionClass}>
              <h3 className={sectionTitleClass}>
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-md flex items-center justify-center text-xs">3</span>
                Cantidades Físicas (Almacén)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Código / Descripción Material</label>
                  <input type="text" className={inputClass} value={formData.codigoMaterial} onChange={e => setFormData({...formData, codigoMaterial: e.target.value})} placeholder="Ej. MAT-001 Rollos Acero" />
                </div>
                <div>
                  <label className={labelClass}>Cantidad Esperada (ERP)</label>
                  <input type="number" className={inputClass} value={formData.cantidadEsperada} onChange={e => setFormData({...formData, cantidadEsperada: e.target.value})} placeholder="0" />
                </div>
                <div>
                  <label className={labelClass}>Cantidad Real Recibida</label>
                  <input type="number" className={inputClass} value={formData.cantidadRecibida} onChange={e => setFormData({...formData, cantidadRecibida: e.target.value})} placeholder="0" />
                </div>
              </div>
            </div>
          </>
        )}

        {formatType === 'inspeccion' && (
          <>
            <div className="bg-amber-50 p-5 rounded-xl border border-amber-200/60 mb-6">
              <h3 className="text-amber-800 font-extrabold mb-2 flex items-center gap-2 uppercase tracking-wide text-sm">
                Datos Vinculados desde Recepción
              </h3>
              <p className="text-xs text-amber-700 mb-4 font-medium">
                La inspección de calidad evalúa el material previamente ingresado por almacén.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-white p-3 rounded-lg border border-amber-100 shadow-sm">
                <div><span className="font-bold text-slate-500 text-xs block uppercase">PO / OC</span> <span className="font-semibold text-slate-800">{formData.ordenCompra || '-'}</span></div>
                <div><span className="font-bold text-slate-500 text-xs block uppercase">Proveedor</span> <span className="font-semibold text-slate-800">{formData.proveedor || '-'}</span></div>
                <div><span className="font-bold text-slate-500 text-xs block uppercase">Material</span> <span className="font-semibold text-slate-800">{formData.codigoMaterial || '-'}</span></div>
                <div><span className="font-bold text-slate-500 text-xs block uppercase">Recibido</span> <span className="font-semibold text-slate-800">{formData.cantidadRecibida || '0'}</span></div>
              </div>
            </div>

            <div className={sectionClass}>
              <h3 className={sectionTitleClass}>
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-md flex items-center justify-center text-xs">A</span>
                Evaluación Técnica (Calidad)
              </h3>
              <label className={labelClass}>Detalle de pruebas, mediciones o validaciones:</label>
              <textarea
                className={`${inputClass} min-h-[120px]`}
                value={formData.caracteristicasEvaluadas}
                onChange={e => setFormData({...formData, caracteristicasEvaluadas: e.target.value})}
                placeholder="Ej. Se verificó el espesor con calibrador Vernier cumpliendo tolerancia de ±0.5mm..."
              />
            </div>

            <div className={sectionClass}>
              <h3 className={sectionTitleClass}>
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-md flex items-center justify-center text-xs">B</span>
                Evidencias Fotográficas
              </h3>
              <p className="text-xs text-slate-500 mb-4 font-medium">
                Tome una foto directamente o suba un archivo. Puede asignar un nombre a cada evidencia.
              </p>
              <div className="flex gap-4 overflow-x-auto pb-2 items-start">
                
                <div className="flex flex-col gap-2 shrink-0">
                  <button 
                    type="button"
                    onClick={startCamera}
                    className="w-32 h-[3.25rem] rounded-lg border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-blue-400 hover:text-blue-500 transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Cámara</span>
                  </button>

                  <label className="w-32 h-[3.25rem] rounded-lg border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-blue-400 hover:text-blue-500 transition-colors cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Subir Archivo</span>
                  </label>
                </div>

                {formData.evidencias.map((evidencia: EvidenciaItem, index: number) => (
                  <div key={evidencia.id} className="relative w-32 shrink-0 flex flex-col gap-2">
                    <div className="relative w-32 h-20 rounded-lg border-2 border-slate-200 overflow-hidden group">
                      <img src={evidencia.url} alt={evidencia.nombre} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const newEvidencias = formData.evidencias.filter((e: EvidenciaItem) => e.id !== evidencia.id);
                          setFormData({...formData, evidencias: newEvidencias});
                        }}
                        className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={evidencia.nombre}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const newEvidencias = [...formData.evidencias];
                        newEvidencias[index].nombre = e.target.value;
                        setFormData({...formData, evidencias: newEvidencias});
                      }}
                      placeholder="Nombre de evidencia"
                      className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className={sectionClass}>
           <h3 className={sectionTitleClass}>
              <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-md flex items-center justify-center text-xs">
                {formatType === 'recepcion' ? '4' : 'C'}
              </span>
              Observaciones y Comentarios Adicionales
            </h3>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <textarea
              className={`${inputClass} flex-1 min-h-[100px]`}
              value={formData.observaciones}
              onChange={e => setFormData({...formData, observaciones: e.target.value})}
              placeholder="Reporte de anomalías, empaques dañados, desviaciones..."
            />
            <VoiceDictationButton onDictate={handleDictation} className="sm:mt-0 w-full sm:w-auto" />
          </div>
        </div>

      </div> 

      <div className="mt-6 border-t border-slate-200 pt-5 bg-white z-10">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Responsable de Captura
        </h3>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-4">
          <div>
            <p className="text-sm font-bold text-slate-800">
              Ing. Carlos Mendoza - N° EMP-40921
            </p>
            <p className="text-xs font-semibold text-slate-500">
              (Supervisor de Calidad - Planta Norte)
            </p>
          </div>
          <div className="flex items-center gap-2 mt-3 sm:mt-0 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-700">Sesión Activa</span>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between items-center mt-2 border-t border-slate-100 pt-4 gap-4">
          <button 
            type="button"
            onClick={handleGoBack}
            className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors w-full sm:w-auto text-left cursor-pointer"
          >
            &larr; Atrás
          </button>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {saveStatus && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{saveStatus}</span>}
            
            <button 
              type="button"
              onClick={handleSaveDraft}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border-2 border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              Guardar Borrador
            </button>
            
            <button 
              type="button"
              onClick={handleNextStep}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all cursor-pointer"
            >
              {formatType === 'recepcion' ? 'Continuar a Inspección \u2192' : 'Finalizar y Guardar \u2192'}
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
}