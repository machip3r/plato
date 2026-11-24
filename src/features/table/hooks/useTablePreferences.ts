import { useEffect, useSyncExternalStore } from 'react';
import { subscribeTablePreferences, getTablePreferences, loadTablePreferences } from '../preferences/tablePreferences';

export function useTablePreferences() {
  const value = useSyncExternalStore(subscribeTablePreferences, getTablePreferences, getTablePreferences);
  useEffect(() => { void loadTablePreferences(); }, []);
  return value;
}
