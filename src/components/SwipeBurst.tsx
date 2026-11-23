import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

export function SwipeBurst({ type, width, height, complete }: { type: 'bet' | 'pass'; width: number; height: number; complete: () => void }) {
  const [progress] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const animation = Animated.timing(progress, { toValue: 1, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    animation.start(({ finished }) => { if (finished) complete(); });
    return () => animation.stop();
  }, [progress, complete]);
  const direction = type === 'bet' ? -1 : 1;
  return <View pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={s.layer}>
    {Array.from({ length: 8 }, (_, index) => <Animated.Text key={index} style={{ position: 'absolute', left: width / 2 - 15, top: height - 206 + index % 3 * 7, fontSize: index % 3 === 0 ? 22 : 17,
      opacity: progress.interpolate({ inputRange: [0, 0.08, 0.6, 1], outputRange: [0, 1, 0.9, 0] }),
      transform: [
        { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [direction * 12, direction * (36 + index * 16)] }) },
        { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, -(54 + index % 4 * 25)] }) },
        { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${direction * (index % 2 ? 18 : -22)}deg`] }) },
        { scale: progress.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0.6, 1, 0.7] }) },
      ],
    }}>{type === 'bet' ? index % 2 ? '🪙' : '💸' : index % 2 ? '🥲' : '😔'}</Animated.Text>)}
  </View>;
}
const s = StyleSheet.create({ layer: { ...StyleSheet.absoluteFill, zIndex: 9 } });
