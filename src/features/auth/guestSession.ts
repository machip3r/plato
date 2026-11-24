import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const guestSessionKey = 'plato.guest-session.v1';
const apiBaseUrl = process.env.EXPO_PUBLIC_PLATO_API_URL?.replace(/\/+$/, '');

export type GuestSession = {
  accessToken: string;
  playerId: string;
  displayName: string;
};

type StoredGuestSession = Pick<GuestSession, 'accessToken' | 'displayName'>;

type GuestSessionResponse = GuestSession & { expiresAt: string };

export class AuthApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

/** Starts an anonymous online identity and stores its bearer credential on this install. */
export async function createGuestSession(displayName: string): Promise<GuestSession> {
  const name = validateName(displayName);
  const existing = await readGuestSession();
  if (existing) {
    throw new Error('Este dispositivo ya tiene una sesión de invitado. Cierra esa sesión antes de crear otra.');
  }

  const response = await request<GuestSessionResponse>('/guest-sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName: name }),
  });
  if (!response.accessToken || !response.playerId || !response.displayName) {
    throw new Error('El servidor devolvió una sesión de invitado incompleta.');
  }

  await storeGuestSession({ accessToken: response.accessToken, displayName: response.displayName });
  return response;
}

export async function getGuestAccessToken(): Promise<string | null> {
  return (await readGuestSession())?.accessToken ?? null;
}

export async function clearGuestSession(): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.sessionStorage.removeItem(guestSessionKey);
    return;
  }
  await SecureStore.deleteItemAsync(guestSessionKey);
}

/** Links guest history to the signed-in Clerk player, then removes the guest credential locally. */
export async function convertGuestSessionToAccount(clerkAccessToken: string): Promise<void> {
  const guest = await readGuestSession();
  if (!guest) throw new Error('No hay una sesión de invitado para convertir.');
  if (!clerkAccessToken.trim()) throw new Error('Inicia sesión para convertir la cuenta de invitado.');

  await request('/auth/claim-guest', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${clerkAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ guestAccessToken: guest.accessToken }),
  });
  await clearGuestSession();
}

/** Sets the chosen PLATO name once; the server rejects subsequent changes. */
export async function setAccountDisplayName(clerkAccessToken: string, displayName: string): Promise<void> {
  if (!clerkAccessToken.trim()) throw new Error('Inicia sesión para guardar tu nombre.');
  const name = validateName(displayName);
  await request('/profile/display-name', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${clerkAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ displayName: name }),
  });
}

async function readGuestSession(): Promise<StoredGuestSession | null> {
  const raw = Platform.OS === 'web'
    ? (typeof window === 'undefined' ? null : window.sessionStorage.getItem(guestSessionKey))
    : await SecureStore.getItemAsync(guestSessionKey);
  if (!raw) return null;

  try {
    const value = JSON.parse(raw) as Partial<StoredGuestSession>;
    if (typeof value.accessToken === 'string' && value.accessToken.startsWith('plg_') && typeof value.displayName === 'string') {
      return { accessToken: value.accessToken, displayName: value.displayName };
    }
  } catch {
    // Malformed local credentials are discarded rather than sent to the API.
  }
  await clearGuestSession();
  return null;
}

async function storeGuestSession(session: StoredGuestSession): Promise<void> {
  const value = JSON.stringify(session);
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') throw new Error('La sesión de invitado no está disponible en este entorno.');
    window.sessionStorage.setItem(guestSessionKey, value);
    return;
  }
  await SecureStore.setItemAsync(guestSessionKey, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

async function request<T = void>(path: string, init: RequestInit): Promise<T> {
  if (!apiBaseUrl) throw new Error('Configura EXPO_PUBLIC_PLATO_API_URL antes de conectar con el backend.');
  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, cache: 'no-store' });
  if (!response.ok) {
    let details: { code?: string; message?: string } = {};
    try { details = await response.json() as typeof details; } catch { /* Keep a safe generic message. */ }
    throw new AuthApiError(details.message ?? 'No se pudo completar la operación de cuenta.', response.status, details.code);
  }
  if (response.status === 204) return undefined as T;
  return await response.json() as T;
}

function validateName(value: string): string {
  const name = value.trim().replace(/\s+/g, ' ');
  const length = Array.from(name).length;
  if (length < 1 || length > 24 || /[\p{Cc}\p{Cf}]/u.test(name)) {
    throw new Error('El nombre debe tener entre 1 y 24 caracteres y no incluir caracteres de control.');
  }
  return name;
}
