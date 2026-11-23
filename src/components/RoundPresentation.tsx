import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import type { TablePresentation } from '../hooks/useLocalMatch';
import { ShreddingHand } from './ShreddingHand';
import { CardBack, PlayingCard } from './PlayingCard';
import { dealTravelDuration, centralDeckWidth, tableCardWidth, deckPosition, opponentPosition, foregroundCardWidth, foregroundCardCenter } from './tableGeometry';

type Props = TablePresentation & { complete: () => void; width: number; height: number };

/** Choreography shares the board's deck and seat coordinates; it never opens a dialog. */
export function RoundPresentation({ type, next, actorId, complete, width, height }: Props) {
  const [travel] = useState(() => new Animated.Value(0));
  const [settle] = useState(() => new Animated.Value(0));
  const [flip] = useState(() => new Animated.Value(0));
  const [humanFlips] = useState(() => [new Animated.Value(0), new Animated.Value(0)]);
  const [humanFaceUp, setHumanFaceUp] = useState([false, false]);
  const humanCardWidth = foregroundCardWidth(width, height);
  const [shuffle] = useState(() => new Animated.Value(0));
  const [stage, setStage] = useState<'shuffle' | 'deal' | 'settle' | 'reveal' | 'deliver' | 'result'>(type === 'deal' ? 'shuffle' : 'reveal');
  const [revealed, setRevealed] = useState(false);
  const onComplete = useRef(complete);
  useEffect(() => { onComplete.current = complete; }, [complete]);
  const ids = next.round?.turnOrder ?? [];
  const hasHumanHand = ids.includes('human');
  const latest = next.round?.bets.at(-1);
  const actor = next.players.find(p => p.id === (actorId ?? latest?.playerId));
  const deckWidth = centralDeckWidth(width, height);
  const seatWidth = tableCardWidth(width, height, next.players.length);
  const opponents = next.players.filter(p => p.id !== 'human');
  const origin = deckPosition(width, height);
  const actorIndex = opponents.findIndex(p => p.id === actor?.id);
  const seat = opponentPosition(Math.max(0, actorIndex), width, height, next.players.length);
  const destination = actor?.id === 'human'
    ? foregroundCardCenter(width, height, 'draw', true)
    : { x: seat.x, y: seat.y + 6 + seatWidth * 0.16 + Math.round(seatWidth * 1.39) / 2 };
  const deliveredWidth = actor?.id === 'human' ? humanCardWidth : seatWidth;

  useEffect(() => {
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, ms: number) => timers.push(setTimeout(() => { if (alive) fn(); }, ms));
    const animate = (value: Animated.Value, toValue: number, duration: number) => Animated.timing(value, { toValue, duration, easing: Easing.inOut(Easing.cubic), useNativeDriver: true });
    AccessibilityInfo.isReduceMotionEnabled().then(reduced => {
      if (!alive) return;
      if (reduced) {
        setRevealed(true);
        setHumanFaceUp([true, true]);
        settle.setValue(1);
        setStage('result');
        travel.setValue(1);
        schedule(() => onComplete.current(), type === 'bet' ? 1200 : 300);
        return;
      }
      if (type === 'pass') {
        animate(travel, 1, 1600).start();
        schedule(() => onComplete.current(), 1850);
      } else if (type === 'deal') {
        Animated.sequence([animate(shuffle, 1, 260), animate(shuffle, -1, 320), animate(shuffle, 1, 320), animate(shuffle, 0, 300)]).start();
        schedule(() => {
          setStage('deal');
          animate(travel, 1, dealTravelDuration(ids.length)).start();
        }, 1200);
        const dealtAt = 1200 + dealTravelDuration(ids.length);
        schedule(() => {
          setStage('settle');
          Animated.timing(settle, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
        }, dealtAt + 100);
        if (hasHumanHand) humanFlips.forEach((value, index) => schedule(() => {
          if (index === 0) setStage('reveal');
          animate(value, 1, 350).start(() => {
            if (!alive) return;
            setHumanFaceUp(current => current.map((face, i) => i === index ? true : face));
            animate(value, 0, 350).start();
          });
        }, dealtAt + 800 + index * 300));
        schedule(() => onComplete.current(), dealtAt + (hasHumanHand ? 2100 : 900));
      } else {
        schedule(() => {
          animate(flip, 1, 360).start(() => {
            if (!alive) return;
            setRevealed(true);
            animate(flip, 0, 360).start();
          });
        }, 750);
        schedule(() => {
          setStage('deliver');
          animate(travel, 1, 1150).start();
        }, 1700);
        schedule(() => setStage('result'), 2950);
        schedule(() => onComplete.current(), 4600);
      }
    });
    return () => { alive = false; timers.forEach(clearTimeout); travel.stopAnimation(); settle.stopAnimation(); flip.stopAnimation(); shuffle.stopAnimation(); humanFlips.forEach(value => value.stopAnimation()); };
  }, [type, ids.length, hasHumanHand, travel, settle, flip, shuffle, humanFlips]);

  const message = type === 'pass' ? `${actor?.name} pasa` : type === 'deal' ? stage === 'shuffle' ? 'Mezclando el mazo' : stage === 'settle' ? 'Acomodando las cartas' : stage === 'reveal' ? 'Tus cartas' : 'Repartiendo dos cartas por jugador' : stage === 'result' ? `${actor?.name}: ${latest?.outcome === 'win' ? 'acierta' : 'no acierta'} · ${latest?.outcome === 'win' ? '+' : '−'}${latest?.amount} fichas` : `${actor?.name} apuesta ${latest?.amount} · ${revealed ? 'Entregando la carta' : 'Destapando la tercera carta'}`;
  return (
    <View pointerEvents="none" style={s.layer}>
      {type === 'pass' ? <ShreddingHand progress={travel} x={seat.x} y={seat.y} width={seatWidth} /> : type === 'deal' ? <>
        {stage === 'shuffle' && [0, 1, 2].map(i => <Animated.View key={i} style={{ position: 'absolute', left: origin.x - deckWidth / 2, top: origin.y - deckWidth * 0.695, transform: [
          { translateX: shuffle.interpolate({ inputRange: [-1, 0, 1], outputRange: [-30 * (i - 1), i * 2, 30 * (i - 1)] }) },
          { rotate: shuffle.interpolate({ inputRange: [-1, 0, 1], outputRange: [`${-12 * i}deg`, '0deg', `${12 * i}deg`] }) },
        ] }}><CardBack width={deckWidth} /></Animated.View>)}
        {stage !== 'shuffle' && ids.flatMap((id, index) => [0, 1].map(pass => {
          const isHuman = id === 'human';
          const target = isHuman ? foregroundCardCenter(width, height, pass ? 'second' : 'first') : opponentPosition(opponents.findIndex(p => p.id === id), width, height, next.players.length);
          const cardWidth = isHuman ? humanCardWidth : seatWidth;
          const humanHand = next.round?.hands.human;
          // Opponents settle into the same centers as the static seat row (5 px padding + 1 px border).
          const restingOffsetY = 6 + Math.round(seatWidth * 1.39) / 2 - 24;
          const dealtAngle = (pass ? 1 : -1) * (isHuman ? 13 : 7);
          const start = (pass * ids.length + index) / (ids.length * 2 + 2);
          const end = (pass * ids.length + index + 2) / (ids.length * 2 + 2);
          return <Animated.View key={`${id}-${pass}`} style={{ position: 'absolute', left: origin.x - cardWidth / 2, top: origin.y - cardWidth * 0.695, opacity: travel.interpolate({ inputRange: [start, start + 0.001, end], outputRange: [0, 1, 1], extrapolate: 'clamp' }), transform: [
            { translateX: travel.interpolate({ inputRange: [start, end], outputRange: [0, target.x - origin.x + (id !== 'human' ? (pass ? 1 : -1) * (seatWidth / 2 + 2) : 0)], extrapolate: 'clamp' }) },
            { translateY: Animated.add(travel.interpolate({ inputRange: [start, end], outputRange: [0, target.y - origin.y + (isHuman ? 0 : 24)], extrapolate: 'clamp' }), settle.interpolate({ inputRange: [0, 1], outputRange: [0, isHuman ? 0 : restingOffsetY] })) },
            { rotate: Animated.add(travel.interpolate({ inputRange: [start, end], outputRange: [0, dealtAngle], extrapolate: 'clamp' }), settle.interpolate({ inputRange: [0, 1], outputRange: [0, isHuman ? 0 : -dealtAngle] })).interpolate({ inputRange: [-13, 13], outputRange: ['-13deg', '13deg'] }) },
            { scale: travel.interpolate({ inputRange: [start, end], outputRange: [isHuman ? deckWidth / humanCardWidth : 1, 1], extrapolate: 'clamp' }) },
            { scaleX: isHuman ? humanFlips[pass].interpolate({ inputRange: [0, 1], outputRange: [1, 0.01] }) : 1 },
          ] }}>{isHuman && humanFaceUp[pass] && humanHand ? <PlayingCard card={pass ? humanHand.second : humanHand.first} width={cardWidth} animate={false} /> : <CardBack width={cardWidth} />}</Animated.View>;
        }))}
      </> : latest ? <>
        <Animated.View style={{ position: 'absolute', left: origin.x - deliveredWidth / 2, top: origin.y - Math.round(deliveredWidth * 1.39) / 2, transform: [
          { translateX: travel.interpolate({ inputRange: [0, 1], outputRange: [0, destination.x - origin.x] }) },
          { translateY: travel.interpolate({ inputRange: [0, 1], outputRange: [0, destination.y - origin.y] }) },
          { scale: travel.interpolate({ inputRange: [0, 1], outputRange: [deckWidth / deliveredWidth, 1] }) },
          { scaleX: flip.interpolate({ inputRange: [0, 1], outputRange: [1, 0.01] }) },
        ] }}>{revealed ? <PlayingCard card={latest.thirdCard} width={deliveredWidth} animate={false} outcome={stage === 'result' ? latest.outcome : undefined} /> : <CardBack width={deliveredWidth} />}</Animated.View>
      </> : null}
      <View style={[s.message, { top: Math.min(height * 0.59, height - 165) }]}><Text accessibilityLiveRegion="polite" style={s.messageText}>{message}</Text></View>
    </View>
  );
}
const s = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFill, zIndex: 8 },
  handRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  actor: { color: '#FFFFFF', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, marginTop: 6 },
  message: { position: 'absolute', alignSelf: 'center', maxWidth: '90%', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8, backgroundColor: '#103C09' },
  messageText: { color: '#FFF0C2', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11, textAlign: 'center' },
});
