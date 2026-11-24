import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { PlayingCard, CardBack } from '../../table/components/cards/PlayingCard';
import { IllustratedAvatar } from '../../../ui/IllustratedAvatar';
import type { Card } from '../../../game';
import { homeColors as c } from '../theme';

/** An explicitly illustrative hand, using the game's own card faces and portraits. */
export function TablePreview() {
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(440);
  const [drawn, setDrawn] = useState<Card>();
  const [revealed, setRevealed] = useState(false);
  const [dealing, setDealing] = useState(true);
  const [drawFlight] = useState(() => new Animated.Value(0));
  const [drawFlip] = useState(() => new Animated.Value(1));
  const [deal] = useState(() => new Animated.Value(reduced ? 1 : 0));
  const flipTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cardWidth = Math.max(66, Math.min(107, width * 0.215));
  const won = drawn && drawn.value > 3 && drawn.value < 11;

  useEffect(() => {
    const animation = Animated.timing(deal, { toValue: 1, duration: reduced ? 0 : 1250, delay: reduced ? 0 : 240, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    animation.start(({ finished }) => { if (finished) setDealing(false); });
    return () => { animation.stop(); clearTimeout(flipTimer.current); drawFlight.stopAnimation(); drawFlip.stopAnimation(); };
  }, [deal, drawFlight, drawFlip, reduced]);

  const reveal = () => {
    if (dealing) return;
    if (drawn) { setDrawn(undefined); setRevealed(false); drawFlight.setValue(0); drawFlip.setValue(1); return; }
    setDealing(true);
    setDrawn({ value: (Math.floor(Math.random() * 13) + 1) as Card['value'], suit: 'hearts' });
    setRevealed(false);
    drawFlight.setValue(0);
    Animated.timing(drawFlight, { toValue: 1, duration: reduced ? 0 : 850, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }).start();
    flipTimer.current = setTimeout(() => {
      Animated.timing(drawFlip, { toValue: 0.01, duration: reduced ? 0 : 180, useNativeDriver: true }).start(({ finished }) => {
        if (!finished) return;
        setRevealed(true);
        Animated.timing(drawFlip, { toValue: 1, duration: reduced ? 0 : 220, useNativeDriver: true }).start(({ finished: opened }) => { if (opened) setDealing(false); });
      });
    }, reduced ? 0 : 850);
  };

  return <View style={s.wrap} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
    <View style={s.caption}><Text style={s.captionText}>ASÍ SE VE UNA BUENA MESA</Text><Text style={s.example}>Demostración</Text></View>
    <View style={s.table}>
      <Image source={require('../../../../assets/textures/felt.png')} resizeMode="repeat" style={[StyleSheet.absoluteFill, s.texture]} />
      <View pointerEvents="none" style={s.stitch} />
      <View style={[s.seat, { left: '17%' }]}><IllustratedAvatar variant={1} size={35} /><Text style={s.player}>OskyBot</Text><View style={s.miniHand}><CardBack width={28} /><CardBack width={28} /></View></View>
      <View style={[s.seat, { right: '17%' }]}><IllustratedAvatar variant={3} size={35} /><Text style={s.player}>MallocBot</Text><View style={s.miniHand}><CardBack width={28} /><CardBack width={28} /></View></View>
      <View style={s.pot}><Text style={s.potLabel}>PLATO</Text><Text style={s.potValue}>◆ 120</Text></View>
      <View style={s.deck}><View style={s.deckUnder} /><CardBack width={50} /></View>
      <Text pointerEvents="none" style={s.watermark}>PLATO</Text>
      <View style={s.hand}>
        <Animated.View style={{ transform: [{ translateX: deal.interpolate({ inputRange: [0, 1], outputRange: [cardWidth * 0.5, 0] }) }, { translateY: deal.interpolate({ inputRange: [0, 1], outputRange: [-130, 0] }) }, { rotate: deal.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-12deg'] }) }], opacity: deal }}><PlayingCard card={{ value: 3, suit: 'clubs' }} width={cardWidth} animate={false} /></Animated.View>
        <Animated.View style={{ marginLeft: 12, transform: [{ translateX: deal.interpolate({ inputRange: [0, 1], outputRange: [-cardWidth * 0.5, 0] }) }, { translateY: deal.interpolate({ inputRange: [0, 1], outputRange: [-130, 0] }) }, { rotate: deal.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '12deg'] }) }], opacity: deal }}><PlayingCard card={{ value: 11, suit: 'diamonds' }} width={cardWidth} animate={false} /></Animated.View>
        {drawn && <Animated.View style={[s.third, { left: cardWidth * 0.5 + 6, transform: [{ translateY: drawFlight.interpolate({ inputRange: [0, 1], outputRange: [-145, 14] }) }, { scale: drawFlight.interpolate({ inputRange: [0, 1], outputRange: [0.48, 1] }) }, { scaleX: drawFlip }] }]}>{revealed ? <PlayingCard card={drawn} width={cardWidth} animate={false} outcome={won ? 'win' : 'loss'} /> : <CardBack width={cardWidth} />}</Animated.View>}
      </View>
      <View style={s.you}><Text style={s.youText}>TU MANO</Text></View>
    </View>
    <View style={s.demoFooter}>
      <View style={s.demoCopy} accessibilityLiveRegion="polite"><Text style={s.demoTitle}>{!revealed ? '¿Qué carta viene?' : won ? '¡Cayó entre las dos!' : 'Esta vez quedó fuera.'}</Text><Text style={s.demoNote}>{!revealed ? 'Ganas si cae entre 3 y J.' : won ? 'Así se gana una apuesta.' : 'Igualar un extremo tampoco cuenta.'}</Text></View>
      <Pressable disabled={dealing} accessibilityRole="button" accessibilityLabel={drawn ? 'Reiniciar la mano de ejemplo' : 'Destapar la tercera carta de ejemplo'} onPress={reveal} style={({ pressed }) => [s.reveal, dealing && s.disabled, pressed && s.pressed]}><Text style={s.revealText}>{dealing ? 'Repartiendo…' : drawn ? 'Reiniciar ↻' : 'Destapar ↗'}</Text></Pressable>
    </View>
  </View>;
}
const s = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 520, alignSelf: 'center' },
  caption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 15, paddingHorizontal: 8 },
  captionText: { color: c.lime, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 9, letterSpacing: 1 },
  example: { color: '#D8E2CF', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10 },
  table: { height: 355, borderRadius: 165, backgroundColor: c.felt, borderWidth: 7, borderColor: '#09291C', overflow: 'hidden', shadowColor: '#061B12', shadowOffset: { width: 0, height: 18 }, shadowRadius: 22, shadowOpacity: 0.22 },
  texture: { width: '100%', height: '100%', opacity: 0.45 },
  stitch: { ...StyleSheet.absoluteFill, margin: 13, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(244,211,107,0.48)', borderRadius: 146 },
  seat: { position: 'absolute', top: 22, alignItems: 'center', gap: 5 },
  player: { color: c.paper, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 9 },
  miniHand: { flexDirection: 'row', gap: 3 },
  pot: { position: 'absolute', top: 44, alignSelf: 'center', alignItems: 'center' },
  potLabel: { color: '#E6DBA6', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 8, letterSpacing: 2 },
  potValue: { color: c.yellow, fontFamily: 'Oswald_700Bold', fontSize: 28, lineHeight: 35 },
  deck: { position: 'absolute', top: 113, alignSelf: 'center', transform: [{ rotate: '-6deg' }] },
  deckUnder: { position: 'absolute', width: 50, height: 69, borderRadius: 6, backgroundColor: '#F6EBCF', top: 4, left: 3 },
  watermark: { position: 'absolute', top: 174, alignSelf: 'center', color: 'rgba(237,214,143,0.20)', fontFamily: 'PlayfairDisplay_900Black', fontSize: 49, letterSpacing: 5 },
  hand: { position: 'absolute', alignSelf: 'center', flexDirection: 'row', bottom: 31 },
  third: { position: 'absolute', top: 0 },
  you: { position: 'absolute', bottom: 10, alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 4, backgroundColor: c.deepGreen, borderRadius: 4 },
  youText: { color: c.yellow, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 8, letterSpacing: 1 },
  demoFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 22, paddingHorizontal: 10 },
  demoCopy: { flex: 1, gap: 5 },
  demoTitle: { color: c.paper, fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 14 },
  demoNote: { color: '#C4D6BE', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 11, lineHeight: 17 },
  reveal: { minHeight: 44, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 7, borderWidth: 1, borderColor: '#91B186' },
  revealText: { color: c.lime, fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 },
  disabled: { opacity: 0.5 }, pressed: { opacity: 0.7 },
});
