import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { getTablePreferences } from '../preferences/tablePreferences';

/** Decorative feedback is always optional and must never interrupt a turn. */
export function playTableHaptic(cue: 'card' | 'confirm') {
  const preferences = getTablePreferences();
  if (!preferences.ready || !preferences.vibration) return;
  try {
    const effect = Platform.OS === 'android'
      ? Haptics.performAndroidHapticsAsync(cue === 'card' ? Haptics.AndroidHaptics.Segment_Tick : Haptics.AndroidHaptics.Confirm)
      : cue === 'card' ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) : Haptics.selectionAsync();
    void effect.catch(() => undefined);
  } catch { /* Unsupported devices keep playing without haptics. */ }
}
