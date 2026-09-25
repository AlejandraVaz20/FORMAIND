import { InspectionRecord, AuthAccount, AuthSession, UserProfile } from '../types';

const DB_NAME = 'FormaIndDB';
// v2 adds three stores so ALL datos persistentes de la app viven en una sola base de
// datos local (IndexedDB) en vez de repartirse entre localStorage y memoria:
//   - credentials: cuentas de acceso (usuario + hash de contraseña + salt)
//   - profiles:    perfil/firma de cada usuario autenticado
//   - session:     token de sesión activo (una sola fila, id = 'current')
const DB_VERSION = 2;

export interface OfflineDraft {
  id: string; // formatId or 'active_wizard'
  formatId: string;
  step: number;
  data: Record<string, any>;
  updatedAt: string;
}

let dbInstance: IDBDatabase | null = null;

export const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      return resolve(dbInstance);
    }

    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB no está soportado en este entorno.'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store 1: All inspections
      if (!db.objectStoreNames.contains('inspections')) {
        db.createObjectStore('inspections', { keyPath: 'id' });
      }

      // Store 2: In-progress form drafts
      if (!db.objectStoreNames.contains('drafts')) {
        db.createObjectStore('drafts', { keyPath: 'id' });
      }

      // Store 3: Queue of records created offline awaiting ERP sync
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id' });
      }

      // Store 4: Cuentas de acceso (login)
      if (!db.objectStoreNames.contains('credentials')) {
        db.createObjectStore('credentials', { keyPath: 'username' });
      }

      // Store 5: Perfiles de usuario (datos personales + firma digital)
      if (!db.objectStoreNames.contains('profiles')) {
        db.createObjectStore('profiles', { keyPath: 'id' });
      }

      // Store 6: Sesión activa
      if (!db.objectStoreNames.contains('session')) {
        db.createObjectStore('session', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event: Event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event: Event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};


/**
 * Initialize DB and seed initial inspections if empty
 */
export const initDB = async (initialData: InspectionRecord[] = []): Promise<InspectionRecord[]> => {
  try {
    const db = await getDB();
    const existing = await getAllInspections();

    if (existing.length === 0 && initialData.length > 0) {
      const tx = db.transaction('inspections', 'readwrite');
      const store = tx.objectStore('inspections');
      for (const item of initialData) {
        store.put(item);
      }
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      return initialData;
    }

    return existing;
  } catch (err) {
    console.warn('Error inicializando IndexedDB, fallback a memoria:', err);
    return initialData;
  }
};

/**
 * Retrieve all inspection records from IndexedDB
 */
export const getAllInspections = async (): Promise<InspectionRecord[]> => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('inspections', 'readonly');
      const store = tx.objectStore('inspections');
      const request = store.getAll();

      request.onsuccess = () => {
        // Sort descending by date/time if possible
        const list = (request.result as InspectionRecord[]) || [];
        resolve(list);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('Error al leer de IndexedDB:', e);
    return [];
  }
};

/**
 * Save an inspection record to IndexedDB, and enqueue in syncQueue if offline
 */
export const saveInspection = async (record: InspectionRecord, isOffline = false): Promise<void> => {
  try {
    const db = await getDB();
    const storesToLock: ('inspections' | 'syncQueue')[] = isOffline 
      ? ['inspections', 'syncQueue'] 
      : ['inspections'];

    const tx = db.transaction(storesToLock, 'readwrite');
    const inspStore = tx.objectStore('inspections');
    inspStore.put(record);

    if (isOffline) {
      const queueStore = tx.objectStore('syncQueue');
      queueStore.put({
        id: record.id,
        record,
        queuedAt: new Date().toISOString()
      });
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error('Error guardando en IndexedDB:', e);
  }
};

/**
 * Save in-progress draft for wizard
 */
export const saveDraft = async (draftId: string, data: Record<string, any>, step: number, formatId: string): Promise<void> => {
  try {
    const db = await getDB();
    const tx = db.transaction('drafts', 'readwrite');
    const store = tx.objectStore('drafts');
    store.put({
      id: draftId,
      formatId,
      step,
      data,
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    console.warn('Error guardando borrador:', e);
  }
};

/**
 * Retrieve saved draft
 */
export const getDraft = async (draftId: string): Promise<OfflineDraft | null> => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('drafts', 'readonly');
      const store = tx.objectStore('drafts');
      const req = store.get(draftId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

/**
 * Clear draft after form submission
 */
export const clearDraft = async (draftId: string): Promise<void> => {
  try {
    const db = await getDB();
    const tx = db.transaction('drafts', 'readwrite');
    const store = tx.objectStore('drafts');
    store.delete(draftId);
  } catch (e) {
    console.warn('Error borrando borrador:', e);
  }
};

/**
 * Get items currently in sync queue
 */
export const getPendingSyncQueue = async (): Promise<any[]> => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('syncQueue', 'readonly');
      const store = tx.objectStore('syncQueue');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
};

/**
 * Clear sync queue when synchronization with ERP finishes
 */
export const clearSyncQueue = async (): Promise<number> => {
  try {
    const db = await getDB();
    const queue = await getPendingSyncQueue();
    const count = queue.length;
    const tx = db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    store.clear();
    return count;
  } catch {
    return 0;
  }
};

// ============================================================================
// Cuentas de acceso (login), perfiles de usuario y sesión activa.
// Viven en la misma base de datos local (IndexedDB) que las inspecciones y los
// borradores, para que TODOS los datos de la aplicación queden en un solo lugar.
// ============================================================================

/** Devuelve todas las cuentas de acceso guardadas localmente. */
export const getAllCredentials = async (): Promise<AuthAccount[]> => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('credentials', 'readonly');
      const store = tx.objectStore('credentials');
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as AuthAccount[]) || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
};

/** Busca una cuenta por nombre de usuario (case-insensitive). */
export const findCredentialByUsername = async (username: string): Promise<AuthAccount | null> => {
  const all = await getAllCredentials();
  const target = username.trim().toLowerCase();
  return all.find((c) => c.username.toLowerCase() === target) || null;
};

/** Inserta o actualiza una cuenta de acceso. */
export const putCredential = async (record: AuthAccount): Promise<void> => {
  try {
    const db = await getDB();
    const tx = db.transaction('credentials', 'readwrite');
    tx.objectStore('credentials').put(record);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error('Error guardando credencial en IndexedDB:', e);
  }
};

/** Obtiene el perfil (datos personales + firma) de un usuario por su id. */
export const getProfile = async (profileId: string): Promise<UserProfile | null> => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('profiles', 'readonly');
      const req = tx.objectStore('profiles').get(profileId);
      req.onsuccess = () => resolve((req.result as UserProfile) || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

/** Guarda (crea o actualiza) el perfil de un usuario. */
export const putProfile = async (profile: UserProfile): Promise<void> => {
  try {
    const db = await getDB();
    const tx = db.transaction('profiles', 'readwrite');
    tx.objectStore('profiles').put(profile);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error('Error guardando perfil en IndexedDB:', e);
  }
};

/** Guarda el token de sesión activo (una sola fila, id fijo 'current'). */
export const putSession = async (session: AuthSession): Promise<void> => {
  try {
    const db = await getDB();
    const tx = db.transaction('session', 'readwrite');
    tx.objectStore('session').put({ id: 'current', ...session });
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error('Error guardando sesión en IndexedDB:', e);
  }
};

/** Recupera la sesión activa guardada, o null si no hay ninguna. */
export const getSession = async (): Promise<AuthSession | null> => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('session', 'readonly');
      const req = tx.objectStore('session').get('current');
      req.onsuccess = () => resolve((req.result as AuthSession) || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

/** Elimina la sesión activa (logout). */
export const clearSession = async (): Promise<void> => {
  try {
    const db = await getDB();
    const tx = db.transaction('session', 'readwrite');
    tx.objectStore('session').delete('current');
  } catch (e) {
    console.warn('Error borrando sesión de IndexedDB:', e);
  }
};

// CÓDIGO PARA BORRADORES
const DRAFTS_DB_NAME = 'FormaindDraftsDB';
const DRAFTS_DB_VERSION = 1;
const DRAFTS_STORE = 'drafts';

export const initDraftsDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DRAFTS_DB_NAME, DRAFTS_DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(DRAFTS_STORE)) {
        db.createObjectStore(DRAFTS_STORE, { keyPath: 'id' });
      }
    };
  });
};

export const saveDraftToDB = async (draftData: any): Promise<void> => {
  const db = await initDraftsDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DRAFTS_STORE, 'readwrite');
    const store = transaction.objectStore(DRAFTS_STORE);
    const draftRecord = {
      ...draftData,
      id: draftData.id || `draft_${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    const request = store.put(draftRecord);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllDrafts = async (): Promise<any[]> => {
  const db = await initDraftsDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DRAFTS_STORE, 'readonly');
    const store = transaction.objectStore(DRAFTS_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

export const deleteDraftFromDB = async (id: string): Promise<void> => {
  const db = await initDraftsDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DRAFTS_STORE, 'readwrite');
    const store = transaction.objectStore(DRAFTS_STORE);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};