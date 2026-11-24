import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

export function BetStep({ label, symbol, change, disabled }: { label: string; symbol: string; change: () => void; disabled: boolean }) {
  const interval = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const repeated = useRef(false);
  const currentChange = useRef(change);
  useEffect(() => { currentChange.current = change; }, [change]);
  useEffect(() => () => clearInterval(interval.current), []);
  useEffect(() => { if (disabled) clearInterval(interval.current); }, [disabled]);
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityHint="Mantén pulsado para cambiar más rápido" disabled={disabled}
    onPressIn={() => { repeated.current = false; }}
    onLongPress={() => { repeated.current = true; interval.current = setInterval(() => currentChange.current(), 100); }}
    onPressOut={() => clearInterval(interval.current)}
    onPress={() => { if (!repeated.current) change(); }}
    style={({ pressed }) => [s.betStep, disabled && s.disabled, pressed && s.pressed]}><Text style={s.betStepSymbol}>{symbol}</Text></Pressable>;
}

export function Control({ text, label, onPress, disabled = false, wide = false, accent = false, muted = false }: { text: string; label?: string; onPress: () => void; disabled?: boolean; wide?: boolean; accent?: boolean; muted?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label ?? text} disabled={disabled} onPress={onPress} style={({ pressed }) => [s.control, wide && s.wide, accent && s.accent, muted && { opacity: 0.85 }, disabled && s.disabled, pressed && s.pressed]}><Text style={[s.controlText, accent && s.accentText]}>{text}</Text></Pressable>;
}

export function PreparedCard({ title, sub, cancelLabel, onCancel }: { title: React.ReactNode; sub: string; cancelLabel?: string; onCancel?: () => void }) {
  return <View style={s.prepareCard}>
    <Text style={s.prepareTitle}>{title}</Text>
    <Text style={s.prepareSub}>{sub}</Text>
    {cancelLabel && onCancel && <Pressable accessibilityRole="button" accessibilityLabel={cancelLabel} onPress={onCancel} style={({ pressed }) => [s.prepareCancel, pressed && s.pressed]}><Text style={s.prepareCancelText}>{cancelLabel}</Text></Pressable>}
  </View>;
}

export function CtaButton({ label, onPress, disabled = false, height, arrow = true }: { label: string; onPress: () => void; disabled?: boolean; height: number; arrow?: boolean }) {
  const reduced = useReducedMotion();
  const [breath] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (reduced || disabled) { breath.setValue(1); return; }
    const animation = Animated.loop(Animated.sequence([
      Animated.delay(900), Animated.timing(breath, { toValue: 1.035, duration: 700, useNativeDriver: true }),
      Animated.timing(breath, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]));
    animation.start();
    return () => { animation.stop(); breath.stopAnimation(); };
  }, [reduced, disabled, breath]);
  return <Animated.View style={{ flex: 1, transform: [{ scale: breath }] }}>
    <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress} style={({ pressed }) => [s.floatButton, s.floatPrimary, { minHeight: height }, disabled && s.disabled, pressed && s.pressed]}>
      <Text style={s.floatPrimaryText}>{label}</Text>{arrow && <Text style={s.floatPrimaryArrow}>↗</Text>}
    </Pressable>
  </Animated.View>;
}

const s = StyleSheet.create({
  betStep: { flex: 1, minWidth: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(236,211,148,0.55)', backgroundColor: 'rgba(20,54,13,0.88)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  betStepSymbol: { color: '#F0EBD7', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 },
  floatButton: { minHeight: 48, paddingHorizontal: 20, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#061704', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  floatPrimary: { backgroundColor: '#F2CB6B', borderWidth: 2, borderColor: '#FFF4CE' },
  floatPrimaryText: { color: '#223014', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 15 },
  floatPrimaryArrow: { color: '#223014', fontSize: 20 },
  prepareCard: { backgroundColor: 'rgba(18,57,27,0.92)', borderWidth: 1, borderColor: 'rgba(221,193,126,0.5)', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center' },
  prepareTitle: { color: '#FFF4CE', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 15, textAlign: 'center' },
  prepareSub: { color: '#E3CE94', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 9, marginTop: 3 },
  prepareCancel: { marginTop: 10, minHeight: 38, paddingHorizontal: 18, borderRadius: 19, borderWidth: 1.5, borderColor: 'rgba(236,211,148,0.55)', backgroundColor: 'rgba(255,244,206,0.08)', alignItems: 'center', justifyContent: 'center' },
  prepareCancelText: { color: '#F0EBD7', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 },
  control: { minHeight: 50, minWidth: 48, paddingHorizontal: 16, backgroundColor: '#EAE8E2', alignItems: 'center', justifyContent: 'center', borderRadius: 3 },
  wide: { flex: 1 },
  controlText: { color: '#101610', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 14 },
  accent: { backgroundColor: '#F2CB6B' },
  accentText: { color: '#1E290E' },
  disabled: { opacity: 0.65 },
  pressed: { transform: [{ scale: 0.97 }] },
});
