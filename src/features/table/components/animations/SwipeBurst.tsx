import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

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

/** One-shot copy burst: a centered pill with emoji drifting around it. */
function WordBurst({ width, height, complete, title, sub, emojis, titleColor, pillBorder }: { width: number; height: number; complete?: () => void; title: string; sub: string; emojis: string[]; titleColor: string; pillBorder: string }) {
  const [progress] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const animation = Animated.timing(progress, { toValue: 1, duration: 3200, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    animation.start(({ finished }) => { if (finished) complete?.(); });
    return () => animation.stop();
  }, [progress, complete]);
  return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={s.layer}>
    <Animated.View style={[pityStyles.pityCopy, { top: height * 0.52, borderColor: pillBorder, opacity: progress.interpolate({ inputRange: [0, 0.12, 0.78, 1], outputRange: [0, 1, 1, 0] }), transform: [{ scale: progress.interpolate({ inputRange: [0, 0.12, 0.85, 1], outputRange: [0.7, 1.06, 1.02, 1.14] }) }] }]}>
      <Text allowFontScaling={false} style={[pityStyles.pityTitle, { color: titleColor }]}>{title}</Text>
      <Text allowFontScaling={false} style={pityStyles.pityBody}>{sub}</Text>
    </Animated.View>
    {Array.from({ length: 7 }, (_, index) => <Animated.Text key={index} style={{ position: 'absolute', left: width / 2 + (index - 3) * 40, top: height * 0.55, fontSize: index % 2 ? 24 : 28, opacity: progress.interpolate({ inputRange: [0, 0.1, 0.62, 1], outputRange: [0, 1, 0.9, 0] }), transform: [
      { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, (index - 3) * 20] }) },
      { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [10, -(52 + index % 3 * 24)] }) },
      { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${index % 2 ? 14 : -16}deg`] }) },
    ] }}>{emojis[index % emojis.length]}</Animated.Text>)}
  </View>;
}

/** One-shot lament when a likely win slips away. */
export function PityBurst({ width, height, complete }: { width: number; height: number; complete?: () => void }) {
  return <WordBurst width={width} height={height} complete={complete} title="Ni modo" sub="Tenías muchas probabilidades…" emojis={['😩', '😖']} titleColor="#FFB6A4" pillBorder="rgba(242,203,107,0.45)" />;
}

/** One-shot celebration when the human takes the Plato. */
export function WinBurst({ width, height, complete }: { width: number; height: number; complete?: () => void }) {
  return <WordBurst width={width} height={height} complete={complete} title="¡Enhorabuena!" sub="El Plato es tuyo" emojis={['🎉', '🥳', '🪙']} titleColor="#F2CB6B" pillBorder="rgba(220,255,189,0.6)" />;
}
const pityStyles = StyleSheet.create({
  pityCopy: { position: 'absolute', alignSelf: 'center', alignItems: 'center', backgroundColor: 'rgba(18,57,27,0.95)', borderRadius: 18, paddingHorizontal: 24, paddingVertical: 14, borderWidth: 2, shadowColor: '#061704', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 14, elevation: 8 },
  pityTitle: { color: '#FFB6A4', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 27, lineHeight: 32, textShadowColor: 'rgba(6,23,4,0.7)', textShadowRadius: 8, textShadowOffset: { width: 0, height: 2 } },
  pityBody: { color: '#E9D9AC', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, marginTop: 4 },
});
