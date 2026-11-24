import type { ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';

/** Shared felt and stitching for match menus and the final scoreboard. */
export function TableSurface({ children }: { children: ReactNode }) {
  return <View style={s.surface}>
    <Image source={require('../../../../../assets/textures/felt.png')} resizeMode="repeat" style={[StyleSheet.absoluteFill, s.texture]} />
    <View pointerEvents="none" style={s.stitch} />
    {children}
  </View>;
}
const s = StyleSheet.create({
  surface: { flex: 1, margin: 10, borderRadius: 28, overflow: 'hidden', backgroundColor: '#1C4E31' },
  texture: { width: '100%', height: '100%', opacity: 0.38 },
  stitch: { ...StyleSheet.absoluteFill, margin: 12, borderWidth: 1, borderColor: 'rgba(235,203,130,0.45)', borderStyle: 'dashed', borderRadius: 19 },
});
