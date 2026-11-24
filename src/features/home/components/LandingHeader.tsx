import { type ComponentRef, type RefObject } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { HeaderGlass } from './HeaderGlass';
import { homeColors as c } from '../theme';

type Props = {
  scrollY: Animated.Value;
  blurTarget: RefObject<ComponentRef<typeof View> | null>;
  onHeightChange: (height: number) => void;
  showRules: () => void;
  play: () => void;
};

/** A stationary navigation layer; only its material changes with scroll. */
export function LandingHeader({ scrollY, blurTarget, onHeightChange, showRules, play }: Props) {
  const compact = useWindowDimensions().width < 540;
  const glassOpacity = scrollY.interpolate({ inputRange: [0, 48], outputRange: [0, 1], extrapolate: 'clamp' });
  const paperOpacity = scrollY.interpolate({ inputRange: [0, 48], outputRange: [1, 0], extrapolate: 'clamp' });
  return <View onLayout={event => onHeightChange(event.nativeEvent.layout.height)} style={[s.header, compact && s.headerCompact]}>
    <HeaderGlass blurTarget={blurTarget} />
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, s.paper, { opacity: paperOpacity }]} />
    <Animated.View pointerEvents="none" style={[s.glassEdge, { opacity: glassOpacity }]} />
    <View style={s.headerInner}>
      <View accessibilityLabel="PLATO" style={[s.brand, compact && { gap: 8 }]}><View style={[s.brandMark, compact && { width: 18, height: 22 }]}><View style={s.brandSlash} /></View><Text style={[s.brandText, compact && { fontSize: 28 }]}>PLATO</Text></View>
      <View style={[s.nav, compact && { gap: 6 }]}>
        {!compact && <Pressable accessibilityRole="button" onPress={showRules} style={({ pressed }) => [s.navButton, pressed && s.pressed]}><Text style={s.navText}>Cómo se juega</Text></Pressable>}
        <Pressable accessibilityRole="button" accessibilityLabel="Jugar con bots" onPress={play} style={({ pressed }) => [s.navPlay, compact && { paddingHorizontal: 14 }, pressed && s.pressed]}><Text style={s.navPlayText}>Jugar ↗</Text></Pressable>
      </View>
    </View>
  </View>;
}
const s = StyleSheet.create({
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingHorizontal: 40 },
  headerCompact: { paddingHorizontal: 20 },
  paper: { backgroundColor: c.paper },
  glassEdge: { ...StyleSheet.absoluteFill, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(18,61,42,0.16)' },
  headerInner: { width: '100%', maxWidth: 1180, alignSelf: 'center', minHeight: 88, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 22, height: 26, backgroundColor: '#C33A31', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  brandSlash: { height: 38, width: 5, backgroundColor: c.paper, transform: [{ rotate: '38deg' }] },
  brandText: { fontFamily: 'PlayfairDisplay_900Black', fontSize: 32, color: c.green, letterSpacing: -0.9 },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navButton: { minHeight: 44, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  navText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11, color: c.green },
  navPlay: { minHeight: 44, paddingHorizontal: 20, backgroundColor: c.green, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  navPlayText: { color: c.paper, fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 12 },
  pressed: { opacity: 0.7 },
});
