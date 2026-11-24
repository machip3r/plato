import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View, type TextStyle, type StyleProp } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

/** Animate the balance itself and a signed receipt; interrupted counts continue from their current value. */
export function AnimatedCounter({ value, initialValue = value, style, label, delayMs = 0, contributionSteps = 0, stepGapMs = 400, receiptSize = 16 }: { value: number; initialValue?: number; style?: StyleProp<TextStyle>; label: string; delayMs?: number; contributionSteps?: number; stepGapMs?: number; receiptSize?: number }) {
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
          : Animated.timing(count, { toValue: value, duration: reduced ? 0 : initial && difference === -1 ? 280 : 650, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
        Animated.timing(motion, { toValue: 1, duration: reduced ? 0 : 2400, useNativeDriver: true }),
      ]).start();
    }, delay);
    const clear = setTimeout(() => setDelta(0), delay + 2600);
    return () => { clearTimeout(update); clearTimeout(clear); count.removeListener(subscription); count.stopAnimation(); motion.stopAnimation(); };
  }, [value, count, motion, reduced]);
  return <View style={s.wrap} accessibilityLabel={`${label}: ${value.toLocaleString('es-MX')} fichas`}>
    <Text style={style}>{shown.toLocaleString('es-MX')}</Text>
    {delta !== 0 && <Animated.Text allowFontScaling={false} pointerEvents="none" style={[s.receipt, delta > 0 ? s.gain : s.loss, {
      top: -receiptSize * 2.7,
      width: receiptSize * 5,
      fontSize: receiptSize,
      paddingHorizontal: receiptSize * 0.55,
      paddingVertical: receiptSize * 0.3,
      borderRadius: receiptSize * 0.36,
      opacity: reduced ? 1 : motion.interpolate({ inputRange: [0, 0.12, 0.72, 1], outputRange: [0, 1, 1, 0] }),
      transform: [{ translateY: reduced ? 0 : motion.interpolate({ inputRange: [0, 1], outputRange: [receiptSize * 0.35, -receiptSize * 1.9] }) }],
    }]}>{delta > 0 ? '+' : '−'}{Math.abs(delta)}</Animated.Text>}
  </View>;
}
const s = StyleSheet.create({
  // The receipt carries an explicit width: Yoga clamps absolutely positioned children
  // to the parent's width when it has to measure them, and the counter's own width
  // shrinks with its digits ("1" mid-tween), which split "−6" into two lines. A fixed
  // box overflows freely and never wraps.
  wrap: { position: 'relative', alignItems: 'center' },
  receipt: { position: 'absolute', alignSelf: 'center', fontFamily: 'PlusJakartaSans_800ExtraBold', textAlign: 'center', zIndex: 15 },
  gain: { color: '#DCFFBD', backgroundColor: '#164A14' },
  loss: { color: '#FFD7C8', backgroundColor: '#682E25' },
});
