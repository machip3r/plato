import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import type { BetOutcome, Card } from '../../../../game';
import { PlayingCard } from './PlayingCard';

/** A retained, three-card flourish: the draw sits between the original pair. */
export function CardFan({ first, second, third, outcome, width, disabled = false, highlighted = false, flat = false }: { first: Card; second: Card; third?: Card; outcome?: BetOutcome; width: number; disabled?: boolean; highlighted?: boolean; flat?: boolean }) {
  const reduced = useReducedMotion();
  const [flatten] = useState(() => new Animated.Value(flat ? 1 : 0));
  const [spread] = useState(() => new Animated.Value(third && width < 80 ? 1 : 0));
  const spreadTarget = third && width < 80 ? 1 : 0;
  useEffect(() => {
    const animation = Animated.timing(spread, { toValue: spreadTarget, duration: reduced ? 0 : 420, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [spreadTarget, spread, reduced]);
  useEffect(() => {
    const animation = Animated.timing(flatten, { toValue: flat ? 1 : 0, duration: reduced ? 0 : 420, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [flat, flatten, reduced]);
  // Small seats ease the draw in by sliding the pair apart instead of jumping;
  // a flattened pair eases apart so the passed cards do not touch.
  const pairSpread = width < 80 ? Math.round(width * 0.28) : 0;
  const flatX = flatten.interpolate({ inputRange: [0, 1], outputRange: [0, Math.round(width * 0.14)] });
  return <View style={{ width: width * 2 + 10, height: width * 1.55 }}>
    <Animated.View style={[s.card, { left: 4, top: width * 0.07, transform: [{ translateX: Animated.add(Animated.multiply(spread, -pairSpread), Animated.multiply(flatX, -1)) }, { rotate: flatten.interpolate({ inputRange: [0, 1], outputRange: ['-13deg', '0deg'] }) }] }]}><PlayingCard card={first} width={width} animate={false} disabled={disabled} highlighted={highlighted} /></Animated.View>
    <Animated.View style={[s.card, { right: 4, top: width * 0.07, transform: [{ translateX: Animated.add(Animated.multiply(spread, pairSpread), flatX) }, { rotate: flatten.interpolate({ inputRange: [0, 1], outputRange: ['13deg', '0deg'] }) }] }]}><PlayingCard card={second} width={width} animate={false} disabled={disabled} highlighted={highlighted} /></Animated.View>
    {third && <View style={[s.card, { left: width / 2 + 5, top: width * 0.16, zIndex: 2 }]}><PlayingCard card={third} width={width} animate={false} outcome={outcome} /></View>}
  </View>;
}
const s = StyleSheet.create({ card: { position: 'absolute' } });
