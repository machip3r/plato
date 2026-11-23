import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View, type TextStyle, type StyleProp } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

/** Animate the balance itself and a signed receipt; interrupted counts continue from their current value. */
export function AnimatedCounter({ value, initialValue = value, style, label, delayMs = 0, contributionSteps = 0, stepGapMs = 400, receiptAbove = false }: { value: number; initialValue?: number; style?: StyleProp<TextStyle>; label: string; delayMs?: number; contributionSteps?: number; stepGapMs?: number; receiptAbove?: boolean }) {
  const reduced = useReducedMotion();
  const [count] = useState(() => new Animated.Value(initialValue));
  const [motion] = useState(() => new Animated.Value(0));
  const [shown, setShown] = useState(initialValue);
  const [delta, setDelta] = useState(0);
  const previous = useRef(initialValue);
  const first = useRef(true);
  const initialSettings = useRef({ delayMs, contributionSteps, stepGapMs });
  useEffect(() => {
    const from = previous.current;
    const difference = value - from;
    const initial = first.current;
    first.current = false;
    const delay = initial && !reduced ? initialSettings.current.delayMs : 0;
    previous.current = value;
    const subscription = count.addListener(({ value: current }) => setShown(Math.round(current)));
    const update = setTimeout(() => {
      setDelta(difference);
      motion.setValue(0);
      Animated.parallel([
        initial && initialSettings.current.contributionSteps > 0 && !reduced
          ? Animated.sequence(Array.from({ length: initialSettings.current.contributionSteps }, (_, index) => Animated.sequence([
              Animated.timing(count, { toValue: from + index + 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
              Animated.delay(Math.max(0, initialSettings.current.stepGapMs - 220)),
            ])))
          : Animated.timing(count, { toValue: value, duration: reduced ? 0 : initial && difference === -1 ? 450 : 1250, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
        Animated.timing(motion, { toValue: 1, duration: reduced ? 0 : 4600, useNativeDriver: true }),
      ]).start();
    }, delay);
    const clear = setTimeout(() => setDelta(0), delay + 4800);
    return () => { clearTimeout(update); clearTimeout(clear); count.removeListener(subscription); count.stopAnimation(); motion.stopAnimation(); };
  }, [value, count, motion, reduced]);
  return <View style={s.wrap} accessibilityLabel={`${label}: ${value.toLocaleString('es-MX')} fichas`}>
    <Text style={style}>{shown.toLocaleString('es-MX')}</Text>
    {delta !== 0 && <Animated.Text pointerEvents="none" style={[s.delta, receiptAbove && s.deltaAbove, delta > 0 ? s.gain : s.loss, { opacity: reduced ? 1 : motion.interpolate({ inputRange: [0, 0.12, 0.72, 1], outputRange: [0, 1, 1, 0] }), transform: [{ translateY: reduced ? 0 : motion.interpolate({ inputRange: [0, 1], outputRange: [6, -34] }) }] }]}>{delta > 0 ? '+' : '−'}{Math.abs(delta)}</Animated.Text>}
  </View>;
}
const s = StyleSheet.create({
  wrap: { position: 'relative', alignItems: 'center' },
  delta: { position: 'absolute', left: '100%', top: 0, marginLeft: 7, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 6, fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18, minWidth: 40, textAlign: 'center', zIndex: 15 },
  deltaAbove: { top: -56, left: '50%', marginLeft: -56, minWidth: 112, fontSize: 24, paddingVertical: 8 },
  gain: { color: '#DCFFBD', backgroundColor: '#164A14' },
  loss: { color: '#FFD7C8', backgroundColor: '#682E25' },
});
