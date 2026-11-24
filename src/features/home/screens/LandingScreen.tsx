/*
 * PLATO's lobby: a real hand leads into a clear choice of table.
 * Keep the game's Playfair / Oswald / Jakarta typography and felt, paper,
 * card-red and chip-yellow materials. Motion explains dealing, never urgency.
 */
import { useRef, useState, type ComponentRef } from 'react';
import { Animated, Pressable, ScrollView, StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { BlurTargetView } from 'expo-blur';
import { LandingHeader } from '../components/LandingHeader';
import { useReducedMotion } from 'react-native-reanimated';
import { TablePreview } from '../components/TablePreview';
import { PlayModes } from '../components/PlayModes';
import { HowToPlay } from '../components/HowToPlay';
import { homeColors as c } from '../theme';

export default function LandingScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const compact = width < 540;
  const reduced = useReducedMotion();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const blurTarget = useRef<ComponentRef<typeof View>>(null);
  const [scrollY] = useState(() => new Animated.Value(0));
  const [headerHeight, setHeaderHeight] = useState(88);
  const content = useRef<ComponentRef<typeof View>>(null);
  const modes = useRef<ComponentRef<typeof View>>(null);
  const rules = useRef<ComponentRef<typeof View>>(null);
  const play = () => router.push('./play');
  const jump = (section: 'modes' | 'rules') => {
    const target = section === 'modes' ? modes.current : rules.current;
    if (target && content.current) {
      target.measureLayout(content.current, (_, y) => scroll.current?.scrollTo({ y: Math.max(0, y - headerHeight), animated: !reduced }));
    }
  };

  return <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
    <Stack.Screen options={{ title: 'PLATO · Una carta más' }} />
    <StatusBar barStyle="dark-content" />
    <View style={s.body}>
    <BlurTargetView ref={blurTarget} style={s.scroll}>
    <Animated.ScrollView ref={scroll} style={s.scroll} contentContainerStyle={s.scrollContent} scrollEventThrottle={16} onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}>
      <View ref={content} collapsable={false}>
      <View style={{ height: headerHeight }} />

      <View style={[s.hero, compact && s.heroCompact]}>
        <View style={[s.heroInner, wide && s.heroWide]}>
          <View style={[s.heroCopy, wide && s.heroCopyWide]}>
            <View style={s.kicker}><View style={s.kickerDot} /><Text style={s.kickerText}>CARTAS SOBRE LA MESA</Text></View>
            <Text accessibilityRole="header" style={[s.heroTitle, !wide && s.heroTitleSmall, compact && s.heroTitleCompact, width < 360 && s.heroTitleNarrow]}>Una carta más.{ '\n' }<Text style={s.yellow}>Y cambia todo.</Text></Text>
            <Text style={s.heroBody}>Dos cartas en la mano. Un Plato en el centro. Apuesta a que la tercera cae entre las tuyas… o deja que pase el turno.</Text>
            <View style={s.heroActions}><Pressable accessibilityRole="button" onPress={play} style={({ pressed }) => [s.primary, pressed && s.primaryPressed]}><Text style={s.primaryText}>Jugar con bots</Text><Text style={s.primaryArrow}>↗</Text></Pressable><Pressable accessibilityRole="button" onPress={() => jump('modes')} style={({ pressed }) => [s.secondary, pressed && s.pressed]}><Text style={s.secondaryText}>Elegir mesa ↓</Text></Pressable></View>
            <Text style={s.heroNote}>Sin cuenta para jugar con bots. Sin dinero real.</Text>
            <View style={s.heroFacts}><Text style={s.fact}>2–8 jugadores</Text><Text style={s.factDot}>◆</Text><Text style={s.fact}>Una mesa, muchas vueltas</Text></View>
          </View>
          <View style={[s.preview, wide && s.previewWide]}><TablePreview /></View>
        </View>
      </View>

      <View ref={modes} collapsable={false} style={[s.modes, compact && s.sectionCompact]}><PlayModes play={play} /></View>
      <View ref={rules} collapsable={false} style={[s.rules, compact && s.sectionCompact]}><HowToPlay /></View>
      <View style={[s.final, compact && s.sectionCompact]}><View style={[s.finalInner, !wide && s.finalStack]}><View><Text accessibilityRole="header" style={s.finalTitle}>Te guardamos un asiento.</Text><Text style={s.finalBody}>Empieza una partida con bots y conoce la mesa.</Text></View><Pressable accessibilityRole="button" onPress={play} style={({ pressed }) => [s.primary, pressed && s.primaryPressed]}><Text style={s.primaryText}>Vamos a jugar</Text><Text style={s.primaryArrow}>↗</Text></Pressable></View></View>
      <View style={[s.footer, compact && s.footerCompact]}><View style={s.footerInner}><Text style={s.footerBrand}>PLATO</Text><Text style={s.footerText}>Cartas americanas. Fichas virtuales. Buena compañía.</Text><Pressable accessibilityRole="button" onPress={() => jump('rules')} style={({ pressed }) => [s.navButton, pressed && s.pressed]}><Text style={s.footerLink}>Cómo se juega ↑</Text></Pressable></View></View>
      </View>
    </Animated.ScrollView>
    </BlurTargetView>
    <LandingHeader scrollY={scrollY} blurTarget={blurTarget} onHeightChange={setHeaderHeight} showRules={() => jump('rules')} play={play} />
    </View>
  </SafeAreaView>;
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.paper },
  scroll: { flex: 1 }, scrollContent: { flexGrow: 1 },
  body: { flex: 1 },
  navButton: { minHeight: 44, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  hero: { backgroundColor: c.green, paddingHorizontal: 40, paddingTop: 70, paddingBottom: 68 },
  heroCompact: { paddingHorizontal: 24, paddingTop: 42, paddingBottom: 42 },
  heroInner: { maxWidth: 1180, alignSelf: 'center', width: '100%', gap: 44 },
  heroWide: { flexDirection: 'row', alignItems: 'center', gap: 44 },
  heroCopy: { minWidth: 0 },
  heroCopyWide: { flex: 1 },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 25 },
  kickerDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: c.coral },
  kickerText: { color: c.lime, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 9, letterSpacing: 1.2 },
  heroTitle: { color: c.paper, fontFamily: 'PlayfairDisplay_900Black', fontSize: 67, lineHeight: 73, letterSpacing: -2.0 },
  heroTitleSmall: { fontSize: 62, lineHeight: 69 },
  heroTitleCompact: { fontSize: 46, lineHeight: 53, letterSpacing: -1.4 },
  heroTitleNarrow: { fontSize: 38, lineHeight: 45, letterSpacing: -1.1 },
  yellow: { color: c.yellow },
  heroBody: { color: '#D0DFCA', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, lineHeight: 25, maxWidth: 405, marginTop: 25 },
  heroActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14, marginTop: 30 },
  primary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 30, minHeight: 54, paddingHorizontal: 23, borderRadius: 8, backgroundColor: c.yellow },
  primaryText: { color: c.ink, fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 13 },
  primaryArrow: { fontSize: 25, color: c.ink },
  primaryPressed: { backgroundColor: '#E9C455', transform: [{ translateY: 2 }] },
  secondary: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 8 },
  secondaryText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: c.paper },
  heroNote: { marginTop: 16, color: '#C4D6BE', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, lineHeight: 17 },
  heroFacts: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, paddingTop: 30, marginTop: 26, borderTopWidth: 1, borderColor: 'rgba(215,237,155,0.20)' },
  fact: { color: '#D0DFCA', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 10 }, factDot: { color: c.coral, fontSize: 10 },
  preview: { width: '100%' }, previewWide: { flex: 1 },
  modes: { backgroundColor: c.lime, paddingHorizontal: 40, paddingVertical: 64 },
  rules: { backgroundColor: c.paper, paddingHorizontal: 40, paddingVertical: 76 },
  sectionCompact: { paddingHorizontal: 24, paddingVertical: 44 },
  final: { backgroundColor: c.green, paddingHorizontal: 40, paddingVertical: 44 },
  finalInner: { maxWidth: 1120, alignSelf: 'center', width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 24 },
  finalStack: { flexDirection: 'column', alignItems: 'flex-start' },
  finalTitle: { color: c.paper, fontFamily: 'PlayfairDisplay_700Bold', fontSize: 29, lineHeight: 36 },
  finalBody: { color: '#C4D6BE', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, lineHeight: 20, marginTop: 9 },
  footer: { paddingHorizontal: 40, paddingVertical: 24, backgroundColor: c.paper }, footerCompact: { paddingHorizontal: 24 },
  footerInner: { maxWidth: 1180, alignSelf: 'center', width: '100%', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  footerBrand: { fontFamily: 'PlayfairDisplay_900Black', fontSize: 22, color: c.green },
  footerText: { color: '#49614C', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, lineHeight: 17, maxWidth: 250 },
  footerLink: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: c.green },
  pressed: { opacity: 0.7 },
});
