import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  User, 
  ShieldCheck, 
  PenTool, 
  Briefcase, 
  Building, 
  Hash, 
  Mail, 
  Clock, 
  Award, 
  RotateCcw, 
  Check, 
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { UserProfile } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [activeTab, setActiveTab] = useState<'datos' | 'firma'>('datos');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Canvas ref for signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasNewDrawing, setHasNewDrawing] = useState(false);
  const [inkColor, setInkColor] = useState<'#1E3A8A' | '#0F172A'>('#1E3A8A');

  useEffect(() => {
    setFormData(profile);
  }, [profile, isOpen]);

  // Set up signature canvas
  useEffect(() => {
    if (activeTab === 'firma' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = inkColor;

        // If existing signature exists, draw preview or clear
        if (formData.digitalSignatureUrl && !hasNewDrawing) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 20, 10, canvas.width - 40, canvas.height - 20);
          };
          img.src = formData.digitalSignatureUrl;
        }
      }
    }
  }, [activeTab, inkColor, formData.digitalSignatureUrl]);

  if (!isOpen) return null;

  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasNewDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasNewDrawing(true);
    setFormData(prev => ({ ...prev, digitalSignatureUrl: '', hasSignature: false }));
  };

  const handleSaveSignatureToProfile = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const updated = {
      ...formData,
      digitalSignatureUrl: dataUrl,
      hasSignature: true
    };
    setFormData(updated);
    onSaveProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    let signatureToSave = formData.digitalSignatureUrl;
    if (hasNewDrawing && canvasRef.current) {
      signatureToSave = canvasRef.current.toDataURL('image/png');
    }

    const updated = {
      ...formData,
      digitalSignatureUrl: signatureToSave,
      hasSignature: Boolean(signatureToSave)
    };

    onSaveProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-bold text-sm shadow-xs overflow-hidden">
              {formData.avatarUrl ? (
                <img 
                  src={formData.avatarUrl} 
                  alt={formData.fullName} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Perfil de Usuario & Credenciales Operativas
              </h2>
              <p className="text-xs text-slate-500">
                Identificación oficial para firma de actas e inspecciones en planta
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center space-x-1 px-6 pt-3 border-b border-slate-200 bg-slate-50/40">
          <button
            type="button"
            onClick={() => setActiveTab('datos')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'datos'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Datos Personales & Puesto</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('firma')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'firma'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Firma Digital & Sellos</span>
            {formData.hasSignature && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1"></span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">
                Datos de usuario y firma digital actualizados correctamente.
              </span>
            </div>
          )}

          {/* TAB 1: DATOS PERSONALES */}
          {activeTab === 'datos' && (
            <form id="profile-form" onSubmit={handleSaveAll} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Nombre Completo */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">
                    Nombre Completo <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Ej. Ing. Carlos Mendoza"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Puesto / Cargo */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Puesto / Cargo en Empresa <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      placeholder="Ej. Supervisor de Calidad de Turno"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Número de Empleado */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Número de Empleado <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      placeholder="Ej. EMP-40921"
                      className="w-full pl-9 pr-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Área / Departamento */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Área o Departamento <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Calidad e Inspección">Calidad e Inspección</option>
                      <option value="Almacén General">Almacén General</option>
                      <option value="Producción y Ensamble">Producción y Ensamble</option>
                      <option value="Logística y Embarques">Logística y Embarques</option>
                      <option value="Mantenimiento Industrial">Mantenimiento Industrial</option>
                      <option value="Seguridad e Higiene">Seguridad e Higiene</option>
                    </select>
                  </div>
                </div>

                {/* Planta / Ubicación */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Planta / Ubicación Física
                  </label>
                  <input
                    type="text"
                    value={formData.plantLocation}
                    onChange={(e) => setFormData({ ...formData, plantLocation: e.target.value })}
                    placeholder="Ej. Planta Norte - Nave B"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Correo Corporativo */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Correo Corporativo
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="usuario@empresa.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Turno */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Turno Asignado
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.shift}
                      onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                      placeholder="Ej. Turno Matutino A (06:00 - 14:30)"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Certificaciones */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">
                    Certificaciones Industriales / Acreditaciones ISO
                  </label>
                  <div className="relative">
                    <Award className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <textarea
                      rows={2}
                      value={formData.certifications}
                      onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                      placeholder="Ej. Auditor Interno ISO 9001:2015, Metrología Dimensional Nivel II"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

              </div>

              {/* Informative footer for profile */}
              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl flex items-start space-x-2 text-[11px] text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Estos datos se vincularán automáticamente a cada formato que completes o autorices, garantizando la trazabilidad bajo normas ISO 9001 / IATF 16949.
                </span>
              </div>
            </form>
          )}

          {/* TAB 2: FIRMA DIGITAL */}
          {activeTab === 'firma' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Trazado de Firma Digital del Responsable
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Dibuja tu firma con el mouse o pantalla táctil. Quedará guardada y se estampará en los formatos oficiales.
                  </p>
                </div>

                {/* Color choices */}
                <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setInkColor('#1E3A8A')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 ${
                      inkColor === '#1E3A8A' ? 'bg-white shadow-2xs text-blue-900' : 'text-slate-500'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#1E3A8A]"></span>
                    <span>Azul Formal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInkColor('#0F172A')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 ${
                      inkColor === '#0F172A' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#0F172A]"></span>
                    <span>Negro Tinta</span>
                  </button>
                </div>
              </div>

              {/* Canvas box */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-2 bg-slate-50/50 flex flex-col items-center justify-center relative touch-none">
                <canvas
                  ref={canvasRef}
                  width={520}
                  height={130}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="bg-white rounded-lg border border-slate-200 shadow-2xs cursor-crosshair w-full max-w-[520px] h-[130px]"
                />

                <div className="w-full flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400">
                  <span>Línea base de firma</span>
                  <span>Área activa sensible</span>
                </div>
              </div>

              {/* Canvas controls */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="flex items-center space-x-1 px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Limpiar Trazo</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveSignatureToProfile}
                  className="flex items-center space-x-1.5 px-4 py-1.5 bg-[#1E3A8A] hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Trazo de Firma</span>
                </button>
              </div>

              {/* Preview of signature card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Vista Previa en Formato Oficial (A4):
                </span>
                
                <div className="bg-white p-3 border border-slate-300 rounded-lg max-w-xs mx-auto text-center font-serif text-xs">
                  <div className="h-12 flex items-center justify-center">
                    {formData.digitalSignatureUrl ? (
                      <img 
                        src={formData.digitalSignatureUrl} 
                        alt="Firma" 
                        className="max-h-12 object-contain" 
                      />
                    ) : (
                      <span className="text-slate-300 italic text-[11px]">
                        [Sin firma digital configurada]
                      </span>
                    )}
                  </div>
                  <div className="border-t border-black pt-1 font-sans text-[9px] text-slate-700 font-bold uppercase">
                    {formData.fullName}
                  </div>
                  <div className="text-[8px] text-slate-500 font-sans">
                    {formData.jobTitle} • {formData.employeeId}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center space-x-1.5 px-5 py-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Guardar Cambios</span>
          </button>
        </div>

      </div>
    </div>
  );
};
