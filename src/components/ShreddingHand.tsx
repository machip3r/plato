import { Animated, StyleSheet, View } from 'react-native';
import { CardBack } from './PlayingCard';

/** Twenty clipped paper ribbons stay local to the seat and fall with a staggered curl. */
export function ShreddingHand({ progress, x, y, width }: { progress: Animated.Value; x: number; y: number; width: number }) {
  const height = Math.round(width * 1.39);
  const ribbons = 10;
  return <View style={StyleSheet.absoluteFill} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
    {[0, 1].map(card => {
      const left = x - width - 2 + card * (width + 4);
      return <View key={card} style={{ position: 'absolute', left, top: y + 6, width, height }}>
        <Animated.View style={{ position: 'absolute', opacity: progress.interpolate({ inputRange: [0, 0.45, 0.9, 1], outputRange: [0, 0, 0.35, 0.35] }) }}><CardBack width={width} disabled /></Animated.View>
        {Array.from({ length: ribbons }, (_, index) => {
          const start = 0.06 + index * 0.018 + card * 0.07;
          const end = Math.min(0.99, start + 0.65);
          const ribbonWidth = width / ribbons;
          const direction = index % 2 ? 1 : -1;
          return <Animated.View key={index} style={{ position: 'absolute', left: index * ribbonWidth, top: 0, width: ribbonWidth, height, overflow: 'hidden',
            opacity: progress.interpolate({ inputRange: [0, start, end - 0.14, end], outputRange: [1, 1, 0.9, 0], extrapolate: 'clamp' }),
            transform: [
              { translateY: progress.interpolate({ inputRange: [start, end], outputRange: [0, height * (0.85 + index % 3 * 0.12)], extrapolate: 'clamp' }) },
              { translateX: progress.interpolate({ inputRange: [start, end], outputRange: [0, direction * width * 0.1], extrapolate: 'clamp' }) },
              { rotate: progress.interpolate({ inputRange: [start, end], outputRange: ['0deg', `${direction * (9 + index % 4 * 4)}deg`], extrapolate: 'clamp' }) },
              { scaleX: progress.interpolate({ inputRange: [start, end], outputRange: [1, 0.65], extrapolate: 'clamp' }) },
              { scaleY: progress.interpolate({ inputRange: [start, end], outputRange: [1, 0.35], extrapolate: 'clamp' }) },
            ],
          }}><View style={{ position: 'absolute', left: -index * ribbonWidth, top: 0 }}><CardBack width={width} /></View></Animated.View>;
        })}
      </View>;
    })}
  </View>;
}
