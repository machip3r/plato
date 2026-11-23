import { Canvas, Circle, Path } from '@shopify/react-native-skia';
import { StyleSheet, Text, View } from 'react-native';

export function WinChance({ chance, bottom }: { chance: number; bottom: number }) {
  const color = chance === 0 ? '#FFA69A' : chance < 30 ? '#FFC095' : chance < 55 ? '#F4D784' : '#B5ED98';
  const angle = -Math.PI / 2 + chance / 100 * Math.PI * 2;
  const arc = `M32 7 A25 25 0 ${chance > 50 ? 1 : 0} 1 ${32 + Math.cos(angle) * 25} ${32 + Math.sin(angle) * 25}`;
  return <View pointerEvents="none" accessibilityRole="progressbar" accessibilityLabel={`${chance}% de ganar`} accessibilityValue={{ min: 0, max: 100, now: chance }} style={[s.wrap, { bottom }]}>
    <Canvas style={StyleSheet.absoluteFill}><Circle cx={32} cy={32} r={30} color="#12391B" /><Circle cx={32} cy={32} r={25} color={color} opacity={0.22} style="stroke" strokeWidth={4} />{chance > 0 && <Path path={arc} color={color} style="stroke" strokeWidth={4} strokeCap="round" />}</Canvas>
    <Text allowFontScaling={false} style={[s.text, { color }]}>{chance}%</Text>
  </View>;
}
const s = StyleSheet.create({
  wrap: { position: 'absolute', left: 34, width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 14, fontVariant: ['tabular-nums'] },
});

/** A seat-order badge, distinct from the live turn countdown. */
export function TurnOrder({ order, active, bottom }: { order: number; active: boolean; bottom: number }) {
  const color = active ? '#F4D784' : '#D4DEBF';
  return <View pointerEvents="none" accessibilityLabel={order > 0 ? `Tu turno en esta ronda: ${order}${active ? ', jugando ahora' : ''}` : 'No participas en esta ronda'} style={[s.wrap, { left: 'auto', right: 34, bottom }]}>
    <Canvas style={StyleSheet.absoluteFill}><Circle cx={32} cy={32} r={30} color="#12391B" /><Circle cx={32} cy={32} r={25} color={color} opacity={active ? 1 : 0.48} style="stroke" strokeWidth={4} /></Canvas>
    <Text allowFontScaling={false} style={{ color, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 7, letterSpacing: 0.5 }}>TURNO</Text>
    <Text allowFontScaling={false} style={{ color, fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 20, lineHeight: 26 }}>{order || '—'}</Text>
  </View>;
}
