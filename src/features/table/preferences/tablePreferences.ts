import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'plato.table-preferences.v1';
type Preferences = { version: 1; sound: boolean; vibration: boolean; guideSeen: boolean };
type Snapshot = Preferences & { ready: boolean; storageError: boolean };
let snapshot: Snapshot = { version: 1, sound: true, vibration: true, guideSeen: false, ready: false, storageError: false };
const listeners = new Set<() => void>();
let loading: Promise<void> | undefined;
let writes = Promise.resolve();
export const getTablePreferences = () => snapshot;
export function subscribeTablePreferences(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
function publish(patch: Partial<Snapshot>) {
  snapshot = { ...snapshot, ...patch };
  listeners.forEach(listener => listener());
}
export function loadTablePreferences() {
  return loading ??= (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const value: unknown = JSON.parse(raw);
        if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1 || !('sound' in value) || typeof value.sound !== 'boolean' || !('vibration' in value) || typeof value.vibration !== 'boolean' || !('guideSeen' in value) || typeof value.guideSeen !== 'boolean') throw new Error('Invalid preferences');
        publish({ sound: value.sound, vibration: value.vibration, guideSeen: value.guideSeen });
      }
      publish({ ready: true });
    } catch { publish({ ready: true, storageError: true }); }
  })();
}
export function updateTablePreferences(patch: Partial<Pick<Preferences, 'sound' | 'vibration' | 'guideSeen'>>) {
  publish(patch);
  const { sound, vibration, guideSeen } = snapshot;
  const value: Preferences = { version: 1, sound, vibration, guideSeen };
  writes = writes.then(async () => {
    try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value)); publish({ storageError: false }); }
    catch { publish({ storageError: true }); }
  });
}
