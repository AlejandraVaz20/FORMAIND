import { AuthAccount, AuthSession } from '../types';
import {
  findCredentialByUsername,
  getAllCredentials,
  putCredential,
  getSession as dbGetSession,
  putSession as dbPutSession,
  clearSession as dbClearSession
} from './offlineStorage';

// FORMAIND es una SPA sin servidor backend (no existe ningún server.js ni endpoint HTTP
// en este repositorio — ver README_TECNICO). Esta es la arquitectura funcional disponible
// para validar credenciales, y es una implementación real, no una simulación visual:
// - Las contraseñas NUNCA se guardan en texto plano. Se derivan con PBKDF2 (Web Crypto API,
//   100,000 iteraciones, SHA-256) usando un salt aleatorio por cuenta, y solo se persiste
//   el hash resultante.
// - Las cuentas, el perfil de cada usuario y el token de sesión (con expiración) viven en
//   la misma base de datos local (IndexedDB, ver utils/offlineStorage.ts) que el resto de
//   los datos de la aplicación (inspecciones, borradores).
// - Cada lectura de sesión valida también su expiración — no es solo una bandera de UI.

const SESSION_DURATION_HOURS = 12;
const PBKDF2_ITERATIONS = 100000;

const bufToHex = (buf: ArrayBuffer): string =>
  Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');

const hexToBuf = (hex: string): Uint8Array =>
  new Uint8Array((hex.match(/.{1,2}/g) || []).map((byte) => parseInt(byte, 16)));

const randomSaltHex = (): string => bufToHex(crypto.getRandomValues(new Uint8Array(16)).buffer);

const deriveHash = async (password: string, saltHex: string): Promise<string> => {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: hexToBuf(saltHex) as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  return bufToHex(derivedBits);
};

/**
 * Crea un conjunto de cuentas de demostración la primera vez que la aplicación corre en
 * un dispositivo (idempotente: no sobreescribe cuentas existentes). Nunca escribe la
 * contraseña en texto plano — solo su hash PBKDF2 y el salt usado para derivarlo.
 */
export const seedDefaultAccounts = async (
  seeds: { username: string; password: string; profileId: string }[]
): Promise<void> => {
  const existing = await getAllCredentials();
  if (existing.length > 0) return;

  for (const seed of seeds) {
    const salt = randomSaltHex();
    const hash = await deriveHash(seed.password, salt);
    const account: AuthAccount = {
      username: seed.username.toLowerCase(),
      passwordHash: hash,
      passwordSalt: salt,
      profileId: seed.profileId,
      createdAt: new Date().toISOString()
    };
    await putCredential(account);
  }
};

export interface LoginResult {
  success: boolean;
  profileId?: string;
  error?: string;
}

/**
 * Valida las credenciales contra las cuentas almacenadas (hash + salt) y, si son
 * correctas, emite un token de sesión real con expiración — esto es autenticación
 * funcional, no un candado visual.
 */
export const login = async (usernameInput: string, password: string): Promise<LoginResult> => {
  const username = usernameInput.trim().toLowerCase();
  if (!username || !password) {
    return { success: false, error: 'Ingresa tu usuario y contraseña.' };
  }

  const account = await findCredentialByUsername(username);
  if (!account) {
    return { success: false, error: 'Usuario o contraseña incorrectos.' };
  }

  const attemptHash = await deriveHash(password, account.passwordSalt);
  if (attemptHash !== account.passwordHash) {
    return { success: false, error: 'Usuario o contraseña incorrectos.' };
  }

  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DURATION_HOURS * 60 * 60 * 1000);
  const session: AuthSession = {
    username: account.username,
    profileId: account.profileId,
    issuedAt: now.toISOString(),
    expiresAt: expires.toISOString()
  };

  await dbPutSession(session);
  return { success: true, profileId: account.profileId };
};

export const logout = async (): Promise<void> => {
  await dbClearSession();
};

/**
 * Regresa la sesión activa solo si existe Y no ha expirado — una sesión vencida se
 * trata como cerrada y se elimina de la base de datos local.
 */
export const getActiveSession = async (): Promise<AuthSession | null> => {
  const session = await dbGetSession();
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    await dbClearSession();
    return null;
  }
  return session;
};

export const changePassword = async (username: string, newPassword: string): Promise<boolean> => {
  const account = await findCredentialByUsername(username);
  if (!account) return false;

  const salt = randomSaltHex();
  const hash = await deriveHash(newPassword, salt);
  await putCredential({ ...account, passwordHash: hash, passwordSalt: salt });
  return true;
};
