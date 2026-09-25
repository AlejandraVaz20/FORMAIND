import React, { useState } from 'react';
import { Layers, User, Lock, Eye, EyeOff, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS_HINT } from '../context/AuthContext';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Ingresa tu usuario y contraseña.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(username, password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Usuario o contraseña incorrectos.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg mb-3">
            <Layers className="w-7 h-7 text-white" />
          </div>
          <span className="font-extrabold text-white text-2xl tracking-tight">
            FORMA<span className="text-blue-500">IND</span>
          </span>
          <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mt-1">
            Digitalización Industrial
          </span>
        </div>

        {/* Login card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4"
        >
          <div>
            <h1 className="text-lg font-bold text-slate-900">Iniciar sesión</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Accede con tu usuario corporativo para continuar.
            </p>
          </div>

          {error && (
            <div className="flex items-start space-x-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Usuario o correo
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                placeholder="ej. cmendoza"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-[#1D4ED8] hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold rounded-lg shadow-xs transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando…</span>
              </>
            ) : (
              <span>Iniciar sesión</span>
            )}
          </button>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowHint((v) => !v)}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline cursor-pointer"
            >
              {showHint ? 'Ocultar' : 'Ver'} usuarios de demostración
            </button>
            <span className="flex items-center space-x-1 text-[10px] text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sesión cifrada localmente</span>
            </span>
          </div>

          {showHint && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              {DEMO_ACCOUNTS_HINT.map((acc) => (
                <div key={acc.username} className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold text-slate-700">{acc.username}</span>
                  <span className="text-slate-500">{acc.jobTitle}</span>
                </div>
              ))}
              <p className="text-[10px] text-slate-400 pt-1">
                Contraseñas: Calidad2024! / Compras2024! / Almacen2024! (respectivamente)
              </p>
            </div>
          )}
        </form>

        <p className="text-center text-[11px] text-slate-500 mt-5">
          © {new Date().getFullYear()} FORMAIND · Sistema Industrial de Trazabilidad
        </p>
      </div>
    </div>
  );
};
