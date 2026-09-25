import { UserProfile } from '../types';
import { getProfile, putProfile } from '../utils/offlineStorage';

export const DEFAULT_USER_PROFILES: Record<string, UserProfile> = {
  'usr-40921': {
    id: 'usr-40921',
    fullName: 'Ing. Carlos Mendoza',
    jobTitle: 'Supervisor de Calidad de Turno',
    employeeId: 'EMP-40921',
    department: 'Calidad e Inspección',
    plantLocation: 'Planta Norte - Nave B',
    email: 'carlos.mendoza@industrial-akd.com',
    shift: 'Turno Matutino A (06:00 - 14:30)',
    certifications: 'Auditor Interno ISO 9001:2015 · Metrología Dimensional Nivel II · IATF 16949',
    hasSignature: true,
    digitalSignatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="80"><path d="M 20 45 Q 60 10 110 50 T 200 40 Q 240 25 280 50 M 50 65 L 250 62" stroke="%231E3A8A" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    username: 'cmendoza'
  },
  'usr-51120': {
    id: 'usr-51120',
    fullName: 'Lic. Mariana Valdez',
    jobTitle: 'Jefatura de Compras',
    employeeId: 'EMP-51120',
    department: 'Compras y Abastecimiento',
    plantLocation: 'Planta Norte - Oficinas Centrales',
    email: 'mariana.valdez@industrial-akd.com',
    shift: 'Turno Administrativo (09:00 - 18:00)',
    certifications: 'Negociación Estratégica de Proveedores · Certificación CPSM',
    hasSignature: true,
    digitalSignatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="80"><path d="M 25 50 Q 70 20 120 45 T 210 35 Q 250 55 275 30 M 60 68 L 245 65" stroke="%231E3A8A" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    username: 'mvaldez'
  },
  'usr-63204': {
    id: 'usr-63204',
    fullName: 'Téc. Jorge Rivera',
    jobTitle: 'Encargado de Almacén',
    employeeId: 'EMP-63204',
    department: 'Almacén y Logística',
    plantLocation: 'Planta Norte - Nave A (Almacén)',
    email: 'jorge.rivera@industrial-akd.com',
    shift: 'Turno Vespertino B (14:30 - 23:00)',
    certifications: 'Manejo de Montacargas Certificado · Control de Inventarios WMS',
    hasSignature: true,
    digitalSignatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="80"><path d="M 30 55 Q 65 15 100 50 T 190 45 Q 230 20 270 55 M 55 70 L 240 68" stroke="%231E3A8A" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
    avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&auto=format&fit=crop&q=80',
    username: 'jrivera'
  }
};

const DEFAULT_PROFILE_ID = 'usr-40921';

/**
 * Carga el perfil (datos personales + firma) del usuario autenticado por su profileId,
 * desde la base de datos local (IndexedDB). Si nunca se ha guardado uno personalizado,
 * regresa (y siembra) el perfil semilla correspondiente.
 */
export const loadUserProfileById = async (profileId: string): Promise<UserProfile> => {
  try {
    const saved = await getProfile(profileId);
    if (saved) return saved as UserProfile;
  } catch (e) {
    console.warn('No se pudo cargar el perfil de usuario desde la base de datos local', e);
  }
  const seed = DEFAULT_USER_PROFILES[profileId] || DEFAULT_USER_PROFILES[DEFAULT_PROFILE_ID];
  await putProfile(seed);
  return seed;
};

export const saveUserProfileToStorage = async (profile: UserProfile): Promise<void> => {
  await putProfile(profile);
};
