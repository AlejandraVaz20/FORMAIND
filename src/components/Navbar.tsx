import React, { useState, useRef, useEffect } from 'react';
import { 
  Scan, 
  Bell, 
  Layers, 
  User,
  Sun,
  Moon,
  Contrast,
  WifiOff,
  RefreshCw,
  LogOut,
  CheckCheck,
  AlertCircle,
  Info
} from 'lucide-react';
import { UserProfile } from '../types';
import { useTheme } from '../context/ThemeContext';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenScanner: () => void;
  onNewRecord: () => void;
  userProfile?: UserProfile;
  onOpenProfile?: () => void;
  unreadCount?: number;
  isOnline?: boolean;
  pendingSyncCount?: number;
  isSyncing?: boolean;
  onSyncNow?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenScanner,
  userProfile,
  onOpenProfile,
  isOnline = true,
  pendingSyncCount = 0,
  isSyncing = false,
  onSyncNow,
  onLogout
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Sincronización ERP',
      description: 'Lote de recepción #REG-ALM-2024 pendiente de validación central.',
      time: 'Hace 10 min',
      read: false,
      type: 'warning'
    },
    {
      id: '2',
      title: 'Actualización de Calidad',
      description: 'Norma IATF 16949 sincronizada correctamente.',
      time: 'Hace 1 hora',
      read: false,
      type: 'success'
    }
  ]);

  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const notifMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setShowNotificationMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const { theme, cycleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left Brand & System status */}
          <div className="flex items-center space-x-3 shrink-0">
            <div 
              onClick={() => onSelectTab('inicio')}
              className="flex items-center space-x-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center text-white shadow-xs">
                <Layers className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight leading-none group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                  FORMA<span className="text-blue-600 dark:text-blue-500">IND</span>
                </span>
                <span className="text-[9px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
                  Digitalización Industrial
                </span>
              </div>
            </div>

            {!isOnline ? (
              <div className="hidden lg:flex items-center space-x-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50 px-2.5 py-1 rounded-full text-xs font-semibold ml-2">
                <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Offline</span>
              </div>
            ) : pendingSyncCount > 0 ? (
              <button
                type="button"
                onClick={onSyncNow}
                disabled={isSyncing}
                className="hidden lg:flex items-center space-x-1.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700/50 px-2.5 py-1 rounded-full text-xs font-semibold transition-all animate-pulse ml-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync ({pendingSyncCount})</span>
              </button>
            ) : (
              <div className="hidden lg:flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-700/50 px-2.5 py-1 rounded-full text-xs font-medium ml-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>ERP Conectado</span>
              </div>
            )}
          </div>

          {/* Center Navigation Links (Borradores eliminado) */}
          <nav className="hidden lg:flex items-center space-x-2">
            <button
              onClick={() => onSelectTab('inicio')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentTab === 'inicio' ? 'bg-[#1E3A8A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => onSelectTab('formatos')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentTab === 'formatos' ? 'bg-[#1E3A8A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              Formatos
            </button>
            <button
              onClick={() => onSelectTab('llenar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentTab === 'llenar' ? 'bg-[#1E3A8A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              Llenar Formato
            </button>
            <button
              onClick={() => onSelectTab('registros')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentTab === 'registros' ? 'bg-[#1E3A8A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              Registros & Trazabilidad
            </button>
            <button
              onClick={() => onSelectTab('estadisticas')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentTab === 'estadisticas' ? 'bg-[#1E3A8A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              Reportes & Estadísticas
            </button>
          </nav>

          {/* Right Action Icons & User Profile */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onOpenScanner}
              title="Escanear código de barras (F2)"
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold transition-all"
            >
              <Scan className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="hidden xl:inline">Escanear</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-slate-500 dark:text-slate-400 font-mono">
                F2
              </kbd>
            </button>

            <button
              type="button"
              onClick={cycleTheme}
              title="Cambiar tema"
              className="flex items-center space-x-1.5 px-2.5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
            >
              {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
              {theme === 'dark' && <Moon className="w-4 h-4 text-blue-400" />}
              {theme === 'high-contrast' && <Contrast className="w-4 h-4 text-yellow-400" />}
              <span className="text-[10px] font-mono uppercase font-bold hidden xl:inline">
                {theme === 'light' ? 'Luz' : theme === 'dark' ? 'Dark' : 'Hi-Con'}
              </span>
            </button>

            <div className="relative" ref={notifMenuRef}>
              <button 
                type="button"
                onClick={() => setShowNotificationMenu(v => !v)}
                className="p-2 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative transition-colors cursor-pointer"
                title="Notificaciones operativas"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                )}
              </button>

              {showNotificationMenu && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Notificaciones</span>
                      {unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {unreadCount} nuevas
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Marcar leídas
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => toggleNotificationRead(notif.id)}
                        className={`p-3.5 transition-colors cursor-pointer flex gap-3 items-start ${
                          notif.read ? 'bg-white dark:bg-[#1E293B] opacity-70' : 'bg-blue-50/40 dark:bg-blue-900/20'
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {notif.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500" />}
                          {notif.type === 'success' && <CheckCheck className="w-4 h-4 text-emerald-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{notif.title}</span>
                            <span className="text-[10px] text-slate-400">{notif.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{notif.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile button */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setShowUserMenu((v) => !v)}
                className="flex items-center space-x-2.5 pl-2 pr-1 py-1 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer group text-left"
              >
                <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold overflow-hidden ring-2 ring-blue-500/30 group-hover:ring-blue-500 transition-all">
                  {userProfile?.avatarUrl ? (
                    <img src={userProfile.avatarUrl} alt={userProfile.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="hidden 2xl:flex flex-col text-left">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                      {userProfile?.fullName || 'Ing. Carlos Mendoza'}
                    </span>
                    {userProfile?.hasSignature && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    {userProfile?.jobTitle || 'Supervisor de Calidad'} • {userProfile?.employeeId || 'EMP-40921'}
                  </span>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-2">
                  <button
                    type="button"
                    onClick={() => { setShowUserMenu(false); onOpenProfile?.(); }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-2"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Ver perfil y firma digital</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowUserMenu(false); onLogout?.(); }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Mobile navigation bar (Borradores eliminado) */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0F172A]/80 px-2 py-1.5 text-xs">
        <button onClick={() => onSelectTab('inicio')} className={`px-2.5 py-1 rounded ${currentTab === 'inicio' ? 'bg-[#1E3A8A] text-white font-medium' : 'text-slate-600 dark:text-slate-300'}`}>Inicio</button>
        <button onClick={() => onSelectTab('formatos')} className={`px-2.5 py-1 rounded ${currentTab === 'formatos' ? 'bg-[#1E3A8A] text-white font-medium' : 'text-slate-600 dark:text-slate-300'}`}>Formatos</button>
        <button onClick={() => onSelectTab('llenar')} className={`px-2.5 py-1 rounded ${currentTab === 'llenar' ? 'bg-[#1E3A8A] text-white font-medium' : 'text-slate-600 dark:text-slate-300'}`}>Llenar</button>
        <button onClick={() => onSelectTab('registros')} className={`px-2.5 py-1 rounded ${currentTab === 'registros' ? 'bg-[#1E3A8A] text-white font-medium' : 'text-slate-600 dark:text-slate-300'}`}>Registros</button>
        <button onClick={() => onSelectTab('estadisticas')} className={`px-2.5 py-1 rounded ${currentTab === 'estadisticas' ? 'bg-[#1E3A8A] text-white font-medium' : 'text-slate-600 dark:text-slate-300'}`}>Reportes</button>
      </div>
    </header>
  );
};