import { Text, View, StyleSheet } from 'react-native';
import Animated, { FadeInUp, useReducedMotion } from 'react-native-reanimated';
import type { BetOutcome, Card } from '../game';
import { palette } from './theme';

const SUITS: Record<Card['suit'], string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

function rankLabel(value: Card['value']): string {
  if (value === 1) return 'A';
  if (value === 11) return 'J';
  if (value === 12) return 'Q';
  if (value === 13) return 'K';
  return String(value);
}

export function PlayingCard({ card, delay = 0, width = 96, animate = true, highlighted = false, disabled = false, outcome }: { disabled?: boolean; outcome?: BetOutcome; highlighted?: boolean; card: Card; delay?: number; width?: number; animate?: boolean }) {
  const reducedMotion = useReducedMotion();
  const color = card.suit === 'hearts' || card.suit === 'diamonds' ? palette.red : palette.ink;
  const surface = disabled ? '#D4D5D0' : outcome === 'win' ? '#E1F2D9' : outcome === 'loss' ? '#F6DED8' : palette.card;
  const edge = disabled ? '#91978B' : outcome === 'win' ? '#61A64B' : outcome === 'loss' ? '#C95040' : undefined;
  const height = Math.round(width * 1.39);

  return (
    <Animated.View
      entering={reducedMotion || !animate ? undefined : FadeInUp.delay(delay).duration(420)}
      style={[styles.card, { width, height }, highlighted && { borderColor: '#E7B950', borderWidth: 3 }, width < 80 && { padding: outcome ? 2 : 3, borderRadius: Math.max(4, width * 0.1), borderColor: '#ADA99C', shadowOffset: { width: 0, height: 2 }, shadowRadius: 3 }, { backgroundColor: surface }, edge && { borderColor: edge, borderWidth: outcome ? 3 : 1 }, disabled && { opacity: 0.68 }]}
      accessibilityLabel={`${rankLabel(card.value)}, ${card.value}, ${card.suit}`}
    >
      {width < 80 ? <View style={styles.compactFace}>
        <Text allowFontScaling={false} style={{ fontFamily: 'Oswald_700Bold', color, fontSize: Math.round(width * 0.48), lineHeight: Math.round(width * 0.58), textAlign: 'center' }}>{rankLabel(card.value)}</Text>
        <Text allowFontScaling={false} style={{ color, fontSize: Math.round(width * 0.42), lineHeight: Math.round(width * 0.46), textAlign: 'center' }}>{SUITS[card.suit]}</Text>
      </View> : <>
      <View style={styles.corner}>
        <Text style={[styles.rank, { color, fontSize: width < 80 ? 14 : Math.max(21, width * 0.17), lineHeight: width < 80 ? 19 : Math.max(28, width * 0.22) }]}>{rankLabel(card.value)}</Text>
        <Text style={[styles.cornerSuit, { color, fontSize: width < 80 ? 9 : Math.max(14, width * 0.09), lineHeight: width < 80 ? 10 : Math.max(15, width * 0.10) }]}>{SUITS[card.suit]}</Text>
      </View>
      <View style={styles.centerMark}>
        <Text style={[styles.bigSuit, { color, fontSize: width < 80 ? 25 : Math.max(39, width * 0.28), lineHeight: width < 80 ? 27 : Math.max(44, width * 0.31) }]}>{SUITS[card.suit]}</Text>
        <Text style={[styles.value, { color }]}>{card.value}</Text>
      </View>
      <View style={[styles.bottomCorner, width < 80 && { display: 'none' }]}> 
        <Text style={[styles.rank, { color, fontSize: width < 80 ? 14 : Math.max(21, width * 0.17), lineHeight: width < 80 ? 19 : Math.max(28, width * 0.22) }]}>{rankLabel(card.value)}</Text>
        <Text style={[styles.cornerSuit, { color, fontSize: width < 80 ? 9 : Math.max(14, width * 0.09), lineHeight: width < 80 ? 10 : Math.max(15, width * 0.10) }]}>{SUITS[card.suit]}</Text>
      </View>
      {card.value >= 11 && <View style={styles.indexMark}>
        <Text style={styles.indexText}>{card.value}</Text>
      </View>}
      </>}
    </Animated.View>
  );
}

export function CardBack({ width = 96, disabled = false }: { width?: number; disabled?: boolean }) {
  const height = Math.round(width * 1.39);
  return (
    <View style={[styles.cardBack, { width, height }, { padding: Math.max(3, width * 0.075), borderRadius: Math.min(13, width * 0.13), overflow: 'hidden' }, disabled && { backgroundColor: '#8E9589', borderColor: '#C7CDC1', opacity: 0.6 }]} accessibilityLabel="Carta boca abajo">
      <View style={styles.backFrame}>
        {width >= 80 && <View style={styles.backDiamond} />}
        <Text style={[styles.backMark, { fontSize: width * 0.42, lineHeight: width * 0.54, letterSpacing: 0 }]}>P</Text>
        {width >= 80 && <View style={styles.backDiamond} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  compactFace: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: palette.card,
    borderRadius: 13,
    borderColor: palette.cardEdge,
    borderWidth: 1,
    padding: 10,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 7,
    overflow: 'hidden',
  },
  corner: { alignItems: 'flex-start' },
  rank: { fontSize: 21, lineHeight: 22, fontFamily: 'Oswald_700Bold', letterSpacing: 0 },
  cornerSuit: { fontSize: 14, lineHeight: 15, marginTop: -1 },
  centerMark: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  bigSuit: { fontSize: 39, lineHeight: 44 },
  value: { marginTop: -3, fontSize: 10, fontFamily: 'Oswald_700Bold', opacity: 0.72 },
  bottomCorner: { alignItems: 'flex-end' },
  indexMark: {
    position: 'absolute',
    right: 8,
    top: 8,
    borderWidth: 1,
    borderColor: 'rgba(18,26,23,0.14)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  indexText: { color: '#756B5C', fontSize: 18, lineHeight: 24, fontFamily: 'Oswald_700Bold', letterSpacing: 0.5 },
  cardBack: {
    borderRadius: 13,
    backgroundColor: palette.redDeep,
    padding: 7,
    borderColor: palette.brass,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 7,
  },
  backFrame: {
    borderWidth: 1,
    borderColor: 'rgba(248,243,233,0.64)',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  backDiamond: { width: 17, height: 17, borderWidth: 2, borderColor: palette.paper, transform: [{ rotate: '45deg' }] },
  backMark: { color: palette.paper, fontSize: 31, fontFamily: 'PlayfairDisplay_900Black', letterSpacing: -2 },
});
