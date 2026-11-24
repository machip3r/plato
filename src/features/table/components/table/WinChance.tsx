import { useEffect, useState } from 'react';
import { Canvas, Circle, Path } from '@shopify/react-native-skia';
import { StyleSheet, Text, View } from 'react-native';
import { HUMAN_TURN_TIMEOUT_MS } from '../../../../game/timing';

/** Compact chance ring for the HUD row: warm colors for low chances, red at zero. */
export function ChanceMeter({ chance, size }: { chance: number; size: number }) {
  const color = chance === 0 ? '#FFA69A' : chance < 30 ? '#FFC095' : chance < 55 ? '#F4D784' : '#B5ED98';
  const c = size / 2;
  const r = size * 0.4;
  const angle = -Math.PI / 2 + (chance / 100) * Math.PI * 2;
  const arc = `M ${c} ${c - r} A ${r} ${r} 0 ${chance > 50 ? 1 : 0} 1 ${c + Math.cos(angle) * r} ${c + Math.sin(angle) * r}`;
  return <View pointerEvents="none" accessibilityRole="progressbar" accessibilityLabel={`${chance}% de ganar`} accessibilityValue={{ min: 0, max: 100, now: chance }} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <Canvas style={StyleSheet.absoluteFill}>
      <Circle cx={c} cy={c} r={r} color={color} opacity={0.22} style="stroke" strokeWidth={3} />
      {chance > 0 && <Path path={arc} color={color} style="stroke" strokeWidth={3} strokeCap="round" />}
    </Canvas>
    <Text allowFontScaling={false} style={{ color, fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: Math.round(size * 0.28), fontVariant: ['tabular-nums'] }}>{chance}%</Text>
  </View>;
}

/** Turn-order ring that becomes the turn countdown while the human is acting. */
export function TurnTimeMeter({ order, active, size }: { order: number; active: boolean; size: number }) {
  const [seconds, setSeconds] = useState(HUMAN_TURN_TIMEOUT_MS / 1000);
  useEffect(() => {
    if (!active) return;
    const deadline = Date.now() + HUMAN_TURN_TIMEOUT_MS;
    const tick = () => setSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 200);
    return () => clearInterval(timer);
  }, [active]);
  const remaining = active ? seconds / (HUMAN_TURN_TIMEOUT_MS / 1000) : 0;
  const color = !active ? '#D4DEBF' : seconds <= 5 ? '#F08C77' : '#F4D784';
  const c = size / 2;
  const r = size * 0.4;
  const angle = -Math.PI / 2 + remaining * Math.PI * 2;
  return <View pointerEvents="none" accessibilityLabel={active ? `Te quedan ${seconds} segundos` : order > 0 ? `Tu turno en esta ronda: ${order}` : 'No participas en esta ronda'} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <Canvas style={StyleSheet.absoluteFill}>
      <Circle cx={c} cy={c} r={r} color={color} opacity={0.25} style="stroke" strokeWidth={3} />
      {active && remaining >= 0.999 && <Circle cx={c} cy={c} r={r} color={color} style="stroke" strokeWidth={3} />}
      {active && remaining > 0.001 && remaining < 0.999 && <Path path={`M ${c} ${c - r} A ${r} ${r} 0 ${remaining > 0.5 ? 1 : 0} 1 ${c + Math.cos(angle) * r} ${c + Math.sin(angle) * r}`} color={color} style="stroke" strokeWidth={3} strokeCap="round" />}
    </Canvas>
    <Text allowFontScaling={false} style={{ color, fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: Math.round(size * 0.3), fontVariant: ['tabular-nums'] }}>{active ? `${seconds}s` : order || '—'}</Text>
  </View>;
}
