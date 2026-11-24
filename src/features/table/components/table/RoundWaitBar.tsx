import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { BETWEEN_ROUNDS_DELAY_MS } from '../../../../game/timing';
import { IllustratedAvatar } from '../../../../ui/IllustratedAvatar';

export function RoundWaitBar({ hostName, avatar, round, getDeadline, compact = false, full = false }: { hostName: string; avatar: number; round: number; getDeadline: () => number | undefined; compact?: boolean; full?: boolean }) {
  const [{ now, deadline }, setClock] = useState<{ now: number; deadline?: number }>(() => ({ now: Date.now() }));
  useEffect(() => {
    const timer = setInterval(() => setClock({ now: Date.now(), deadline: getDeadline() }), 100);
    return () => clearInterval(timer);
  }, [getDeadline]);
  const [progress] = useState(() => new Animated.Value(1));
  const seconds = deadline ? Math.min(BETWEEN_ROUNDS_DELAY_MS / 1000, Math.max(0, Math.ceil((deadline - now) / 1000))) : undefined;
  useEffect(() => {
    if (!deadline) { progress.setValue(1); return; }
    const remaining = Math.max(0, deadline - Date.now());
    progress.setValue(Math.min(1, remaining / BETWEEN_ROUNDS_DELAY_MS));
    const animation = Animated.timing(progress, { toValue: 0, duration: remaining, easing: Easing.linear, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [deadline, progress]);
  return <View accessibilityLabel={`Ronda ${round}. ${hostName} prepara la mesa.${seconds !== undefined ? ` Comienza en ${seconds} ${seconds === 1 ? 'segundo' : 'segundos'}.` : ''}`} style={[s.wrap, compact && s.compact, full && s.full]}>
    <View style={s.row}>
      <IllustratedAvatar variant={avatar} size={compact ? 26 : 32} />
      <View style={s.copy}><Text style={s.title}>Ronda {String(round).padStart(2, '0')}</Text><Text numberOfLines={1} style={s.host}>{hostName}</Text></View>
      <View style={s.time}><Text style={s.seconds}>{seconds !== undefined ? seconds : '—'}<Text style={s.unit}>{seconds !== undefined ? ' s' : ''}</Text></Text></View>
    </View>
    <View style={s.track}><Animated.View style={[s.fill, { transform: [{ scaleX: progress }] }]} /></View>
  </View>;
}
const s = StyleSheet.create({
  wrap: { flex: 1, minWidth: 0, minHeight: 67, backgroundColor: '#294D28', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, justifyContent: 'center' },
  compact: { flex: 0 },
  full: { borderRadius: 0, marginHorizontal: -22, marginBottom: -22, minHeight: 72 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  copy: { flex: 1, minWidth: 0 },
  title: { color: '#FFF0C3', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 14 },
  host: { color: '#D4E0C5', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 9, marginTop: 4 },
  time: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#173819' },
  seconds: { color: '#F4D784', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 17, fontVariant: ['tabular-nums'] },
  unit: { fontSize: 9 },
  track: { height: 3, borderRadius: 2, overflow: 'hidden', backgroundColor: '#49693F', marginTop: 8 },
  fill: { ...StyleSheet.absoluteFill, backgroundColor: '#E4C679', transformOrigin: 'left' },
});
