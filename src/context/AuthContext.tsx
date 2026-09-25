import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import {
  seedDefaultAccounts,
  login as loginRequest,
  logout as logoutRequest,
  getActiveSession,
  LoginResult
} from '../utils/authStorage';
import { loadUserProfileById, saveUserProfileToStorage } from '../data/initialUserProfile';

interface AuthSessionInfo {
  username: string;
  profileId: string;
  issuedAt: string;
  expiresAt: string;
}

interface AuthContextValue {
  session: AuthSessionInfo | null;
  currentProfile: UserProfile | null;
  isAuthReady: boolean;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  updateCurrentProfile: (updated: UserProfile) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Cuentas operativas de demostración para el entorno local/offline-first de FORMAIND.
// En un despliegue real esto se sustituiría por un directorio de usuarios de la planta
// (SAP/LDAP), pero la lógica de login en sí (hash PBKDF2, sesión con expiración, mensajes
// de error, persistencia en la base de datos local) es completamente funcional.
const DEFAULT_ACCOUNT_SEEDS = [
  { username: 'cmendoza', password: 'Calidad2024!', profileId: 'usr-40921' },
  { username: 'mvaldez', password: 'Compras2024!', profileId: 'usr-51120' },
  { username: 'jrivera', password: 'Almacen2024!', profileId: 'usr-63204' }
];

// Mostrado en la pantalla de login como ayuda, sin exponer las contraseñas guardadas.
export const DEMO_ACCOUNTS_HINT = [
  { username: 'cmendoza', jobTitle: 'Supervisor de Calidad' },
  { username: 'mvaldez', jobTitle: 'Jefatura de Compras' },
  { username: 'jrivera', jobTitle: 'Encargado de Almacén' }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSessionInfo | null>(null);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  useEffect(() => {
    seedDefaultAccounts(DEFAULT_ACCOUNT_SEEDS)
      .then(() => getActiveSession())
      .then(async (activeSession) => {
        if (activeSession) {
          setSession(activeSession);
          const profile = await loadUserProfileById(activeSession.profileId);
          setCurrentProfile(profile);
        }
      })
      .finally(() => setIsAuthReady(true));
  }, []);

  const login = async (username: string, password: string): Promise<LoginResult> => {
    const result = await loginRequest(username, password);
    if (result.success && result.profileId) {
      const activeSession = await getActiveSession();
      setSession(activeSession);
      const profile = await loadUserProfileById(result.profileId);
      setCurrentProfile(profile);
    }
    return result;
  };

  const logout = () => {
    logoutRequest();
    setSession(null);
    setCurrentProfile(null);
  };

  const updateCurrentProfile = (updated: UserProfile) => {
    setCurrentProfile(updated);
    saveUserProfileToStorage(updated);
  };

  return (
    <AuthContext.Provider
      value={{ session, currentProfile, isAuthReady, login, logout, updateCurrentProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  return ctx;
};
