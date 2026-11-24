import { useReducedMotion } from 'react-native-reanimated';
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { Animated, Easing, Image, PanResponder, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurTargetView } from 'expo-blur';
import type { TablePresentation, QueuedAction } from '../../types';
import { currentTurnPlayer, winProbability, maxBetAmount, type LocalMatch } from '../../../../game';
import { SwipeBurst, PityBurst, WinBurst } from '../animations/SwipeBurst';
import { RoundWaitBar } from './RoundWaitBar';
import { ChanceMeter, TurnTimeMeter } from './WinChance';
import { CardFan } from '../cards/CardFan';
import { RoundPresentation } from '../animations/RoundPresentation';
import { playCardCue } from '../../services/cardSounds';
import { PlayerGuideCard } from '../help/PlayerGuide';
import { dealArrivalMs, dealArrivalGap, centralDeckWidth, tableCardWidth, deckPosition, opponentPosition, foregroundCardWidth, foregroundHandBottom, foregroundHandOffset } from './tableGeometry';
import { AnimatedCounter } from '../AnimatedCounter';
import { CardBack } from '../cards/PlayingCard';
import { TableWordmark } from './TableWordmark';
import { BetStep, Control, PreparedCard, CtaButton } from './TableControls';
import { HudGuide } from '../help/HudGuide';
import { RevealedPair } from '../cards/RevealedPair';

type Props = { match: LocalMatch; queuedAction?: QueuedAction; queueNotice: string; cancelQueuedAction: () => void; presentation?: TablePresentation; completePresentation: () => void; pass: () => void; bet: (amount: number) => void; next: () => void; join: () => void; joinQueued: boolean; getNextRoundAt: () => number | undefined };

export function ImmersiveTable({ match, queuedAction, queueNotice, cancelQueuedAction, presentation, completePresentation, pass, bet, next, join, joinQueued, getNextRoundAt }: Props) {
  const blurTarget = useRef<ComponentRef<typeof BlurTargetView>>(null);
  const busy = Boolean(presentation);
  const dealing = presentation?.type === 'deal';
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const [size, setSize] = useState({ width: 390, height: 700 });
  const [amount, setAmount] = useState('1');
  const [hudGuide, setHudGuide] = useState<'chance' | 'balance' | 'turn'>();
  const [seatGuide, setSeatGuide] = useState<string>();
  const [burst, setBurst] = useState<{ id: number; type: 'bet' | 'pass' }>();
  const clearBurst = useCallback(() => setBurst(undefined), []);
  const [reactionFinished, setReactionFinished] = useState(false);
  const completeReaction = useCallback(() => setReactionFinished(true), []);
  const pointerStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const [swipeOffset] = useState(() => new Animated.Value(0));
  const [handLift] = useState(() => new Animated.Value(0));
  const [dockEntrance] = useState(() => new Animated.Value(dealing ? 0 : 1));
  const [shrink] = useState(() => new Animated.Value(0));
  const round = match.round!;
  const actor = currentTurnPlayer(match);
  const human = match.players.find(p => p.id === 'human')!;
  const spectating = Boolean(human.spectating);
  const isHost = (match.hostId ?? 'human') === 'human';
  const tableRadius = Math.min(76, size.width * 0.14);
  // The single HUD row scales with the viewport so it fits every screen.
  const hudScale = Math.max(0.8, Math.min(1, size.width / 390));
  const meterSize = Math.round(42 * hudScale);
  const hudBalanceSize = Math.round(25 * hudScale);
  const hudReceiptSize = Math.round(20 * hudScale);
  const hudRowWidth = Math.min(300, Math.max(212, size.width - 96));
  const hostAvatar = Math.max(0, match.players.findIndex(player => player.id === (match.hostId ?? 'human')));
  const hostName = match.players.find(player => player.id === (match.hostId ?? 'human'))?.name ?? 'El anfitrión';
  const hand = spectating ? undefined : round.hands.human;
  const passed = !spectating && round.actedPlayerIds.includes('human') && !round.bets.some(b => b.playerId === 'human');
  const preparedPass = queuedAction?.type === 'pass';
  const folded = passed || preparedPass;
  const turn = actor?.id === 'human' && !busy;
  const ended = round.status !== 'in_progress';
  const roundWonByOther = round.status === 'won' && round.winnerId !== undefined && round.winnerId !== 'human';
  const maximum = maxBetAmount(human, round.pot);
  const numeric = Number(amount);
  const canPrepare = human.balance > 0 && !ended && !dealing && Boolean(hand) && round.turnOrder.slice(round.currentTurnIndex).includes('human') && !(busy && actor?.id === 'human');
  const blocked = !canPrepare || maximum < 1;
  const chance = hand ? Math.round(winProbability(hand) * 100) : 0;
  const pity = roundWonByOther && !spectating && hand && !reducedMotion && chance >= 60 ? round.winnerId : undefined;
  const cheer = round.status === 'won' && round.winnerId === 'human' && !spectating ? 'win' : undefined;
  const opponents = match.players.filter(p => p.id !== 'human');
  const massReveal = round.status === 'won' && opponents.some(p => !round.bets.some(b => b.playerId === p.id));
  const cardWidth = foregroundCardWidth(size.width, size.height);
  const handHeight = cardWidth * 1.39;
  const latest = round.bets.at(-1);
  const humanBet = round.bets.find(item => item.playerId === 'human');
  const seatWidth = tableCardWidth(size.width, size.height, match.players.length);
  const deckWidth = centralDeckWidth(size.width, size.height);
  // The HUD row rides well above the hand so its meters never sit on the card corners.
  const actingId = presentation?.actorId ?? (presentation?.type === 'bet' ? presentation.next.round?.bets.at(-1)?.playerId : undefined);
  // The Plato badge shrinks with the table so it never covers the upper seats' cards.
  const potScale = match.players.length <= 3 ? 1 : match.players.length <= 5 ? 0.8 : 0.62;

  const humanReceiving = presentation?.type === 'bet' && actingId === 'human';
  const raisedHand = humanReceiving || Boolean(humanBet);
  // The HUD row rides well above the hand so its meters never sit on the card corners;
  // it climbs a little further while the three-card wager hand is up.
  const hudBottom = handHeight * 0.77 + 72 + (raisedHand ? 30 : 0);
  // Reserve room above the balance, and show the round recap after the reaction fades.
  const reactionTop = Math.max(16, Math.min(size.height * 0.52, size.height - hudBottom - (meterSize + 10) - 104));
  const reactionVisible = Boolean((pity || cheer) && !reducedMotion && !reactionFinished);

  useEffect(() => {
    const animation = Animated.timing(handLift, { toValue: raisedHand ? 1 : 0, delay: reducedMotion ? 0 : raisedHand ? 400 : 0, duration: reducedMotion ? 0 : 1050, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [raisedHand, handLift, reducedMotion]);
  useEffect(() => {
    const animation = Animated.timing(dockEntrance, { toValue: dealing ? 0 : 1, duration: reducedMotion || dealing ? 0 : 600, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [dealing, dockEntrance, reducedMotion]);

  useEffect(() => {
    Animated.timing(shrink, { toValue: folded ? 1 : 0, duration: reducedMotion ? 0 : 420, useNativeDriver: true }).start();
  }, [folded, shrink, reducedMotion]);

  // One shared reveal take for the whole winning unmask; skips when every seat was already face up.
  useEffect(() => {
    if (!massReveal) return;
    playCardCue('reveal', 0.5);
  }, [massReveal]);

  // The human pass never opens a presentation; its own reveal take lands as the hand settles.
  useEffect(() => {
    if (!passed) return;
    playCardCue('reveal', 0.55);
  }, [passed]);

  const animateSwipe = useCallback((direction?: -1 | 1) => {
    swipeOffset.stopAnimation();
    if (reducedMotion) { swipeOffset.setValue(0); return; }
    const settle = Animated.timing(swipeOffset, { toValue: 0, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    if (direction) Animated.sequence([Animated.timing(swipeOffset, { toValue: direction * 76, duration: 160, easing: Easing.out(Easing.cubic), useNativeDriver: true }), settle]).start();
    else settle.start();
  }, [swipeOffset, reducedMotion]);
  useEffect(() => () => swipeOffset.stopAnimation(), [swipeOffset]);
  const finishSwipe = useCallback((dx: number, dy: number, velocity: number) => {
    const committed = Math.abs(dx) >= 72 || (Math.abs(dx) >= 36 && Math.abs(velocity) >= 0.6);
    if (!committed || Math.abs(dx) <= Math.abs(dy) * 1.6) return false;
    if (!canPrepare) return false;
    if (dx > 0) pass();
    else {
      if (!preparedPass) return false;
      cancelQueuedAction();
    }
    animateSwipe(dx > 0 ? 1 : -1);
    if (!reducedMotion) setBurst(current => ({ id: (current?.id ?? 0) + 1, type: 'pass' }));
    return true;
  }, [canPrepare, preparedPass, pass, cancelQueuedAction, animateSwipe, reducedMotion]);
  const swipe = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, gesture) => canPrepare && gesture.numberActiveTouches === 1 && Math.abs(gesture.dx) > 18 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.6,
    onPanResponderMove: (_, gesture) => swipeOffset.setValue(Math.max(-64, Math.min(64, gesture.dx * 0.4))),
    onPanResponderRelease: (_, gesture) => { if (!finishSwipe(gesture.dx, gesture.dy, gesture.vx)) animateSwipe(); },
    onPanResponderTerminate: () => animateSwipe(),
    onPanResponderTerminationRequest: () => true,
  }), [canPrepare, finishSwipe, animateSwipe, swipeOffset]);

  const changeAmount = (delta: number) => setAmount(current => String(Math.max(1, Math.min(maximum, (Number(current) || 1) + delta))));
  const changeQuickAmount = (step: number) => setAmount(current => {
    const value = /^\d+$/.test(current) ? Number(current) : 0;
    return String(Math.max(1, Math.min(maximum, value === 1 ? step : value + step)));
  });
  return (
    <View {...(Platform.OS === 'web' ? {} : swipe.panHandlers)}
      onPointerDown={Platform.OS === 'web' ? event => { pointerStart.current = canPrepare ? { x: event.nativeEvent.pageX, y: event.nativeEvent.pageY, time: Date.now() } : null; } : undefined}
      onPointerMove={Platform.OS === 'web' ? event => {
        const start = pointerStart.current;
        if (!start) return;
        const dx = event.nativeEvent.pageX - start.x;
        const dy = event.nativeEvent.pageY - start.y;
        if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.6) swipeOffset.setValue(Math.max(-64, Math.min(64, dx * 0.4)));
      } : undefined}
      onPointerUp={Platform.OS === 'web' ? event => {
        const start = pointerStart.current;
        pointerStart.current = null;
        if (!start) return;
        const dx = event.nativeEvent.pageX - start.x;
        if (!finishSwipe(dx, event.nativeEvent.pageY - start.y, dx / Math.max(1, Date.now() - start.time))) animateSwipe();
      } : undefined}
      onPointerLeave={Platform.OS === 'web' ? () => { if (pointerStart.current) { pointerStart.current = null; animateSwipe(); } } : undefined}
      onPointerCancel={Platform.OS === 'web' ? () => { pointerStart.current = null; animateSwipe(); } : undefined}
      style={[s.scene, Platform.OS === 'web' && { userSelect: 'none' }]} onLayout={event => setSize(event.nativeEvent.layout)}>
      <BlurTargetView ref={blurTarget} style={StyleSheet.absoluteFill}>
      <View pointerEvents="none" style={s.felt}>
        <Image source={require('../../../../../assets/textures/felt.png')} resizeMode="repeat" style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} />
        <View style={[s.feltStitch, { borderRadius: Math.max(10, tableRadius - 17) }]} />
      </View>
      <TableWordmark width={Math.min(size.width * 0.65, 320)} top={size.height * 0.50} />
      <View style={s.opponents}>
        {opponents.map((player, i) => {
          const { x, y } = opponentPosition(i, size.width, size.height, match.players.length);
          const active = actor?.id === player.id && !dealing && !ended;
          const wager = round.bets.find(b => b.playerId === player.id);
          const showingBet = presentation?.type === 'bet' && actingId === player.id;
          const didPass = round.actedPlayerIds.includes(player.id) && !wager;
          const passingNow = presentation?.type === 'pass' && actingId === player.id;
          const revealAll = round.status === 'won';
          const visibleHand = wager?.hand ?? (showingBet || revealAll ? round.hands[player.id] : undefined);
          return (
            <Pressable key={player.id} accessibilityRole="button" accessibilityLabel={`Ver información de ${player.name}`} onPress={() => setSeatGuide(player.id)} style={({ pressed }) => [s.opponent, { left: x - (seatWidth * 2 + 16) / 2, top: y, width: seatWidth * 2 + 16 }, active && s.opponentActive, pressed && s.pressed]}>
              <Text style={s.orderBadge}>{round.turnOrder.includes(player.id) ? round.turnOrder.indexOf(player.id) + 1 : '—'}</Text>
              {active && <Text style={s.activeBadge}>{busy ? presentation?.type === 'bet' ? 'APUESTA' : 'PASA' : 'TURNO'}</Text>}
              <View style={[s.opponentCards, (dealing || passingNow) && { opacity: 0 }, didPass && !revealAll && { opacity: 0.35 }]}>
                {visibleHand ? <RevealedPair key={player.id} first={visibleHand.first} second={visibleHand.second} third={wager?.thirdCard} outcome={wager?.outcome} width={seatWidth} reducedMotion={reducedMotion} /> : <><CardBack width={seatWidth} disabled={didPass} /><CardBack width={seatWidth} disabled={didPass} /></>}
              </View>
              <Text numberOfLines={1} style={s.playerName}>{player.name}</Text>
              {round.dealerId === player.id && <Text style={s.dealerLabel}>Repartidor</Text>}
              {match.hostId === player.id && <Text style={s.dealerLabel}>Anfitrión</Text>}
              <AnimatedCounter receiptSize={12} label={`Saldo de ${player.name}`} value={player.balance} delayMs={dealArrivalMs(round.turnOrder.length, round.turnOrder.indexOf(player.id))} initialValue={player.balance + (dealing && round.hands[player.id] ? 1 : 0)} style={s.balance} />
              {(didPass || wager) && <Text style={s.seatAction}>{didPass ? 'Pasó' : `Apostó ${wager?.amount}`}</Text>}
            </Pressable>
          );
        })}
      </View>
      {hand && !dealing && <Animated.View pointerEvents="none" style={[s.hand, { bottom: foregroundHandBottom, height: handHeight, transform: [
        { translateX: swipeOffset },
        { rotate: swipeOffset.interpolate({ inputRange: [-90, 0, 90], outputRange: ['-6deg', '0deg', '6deg'], extrapolate: 'clamp' }) },
        { translateY: Animated.add(shrink.interpolate({ inputRange: [0, 1], outputRange: [foregroundHandOffset(cardWidth), -25] }), handLift.interpolate({ inputRange: [0, 1], outputRange: [0, foregroundHandOffset(cardWidth, true) - foregroundHandOffset(cardWidth)] })) },
        { scale: shrink.interpolate({ inputRange: [0, 1], outputRange: [1, 0.62] }) },
      ] }]}>
        <CardFan first={hand.first} second={hand.second} third={humanBet?.thirdCard} outcome={humanBet?.outcome} width={cardWidth} disabled={folded} flat={folded} highlighted={turn} />
      </Animated.View>}
      <View pointerEvents="none" accessibilityLabel="Mazo central" style={[s.centralDeck, { left: deckPosition(size.width, size.height).x - deckWidth / 2, top: deckPosition(size.width, size.height).y - deckWidth * 0.695 }]}>
        <View style={[s.deckShadow, { width: deckWidth * 1.3, height: deckWidth * 0.28, bottom: -deckWidth * 0.09, left: deckWidth / 2 - deckWidth * 0.65 }]} />
        <View style={[s.deckUnder, { width: deckWidth, height: deckWidth * 1.39, transform: [{ rotate: '8deg' }, { translateX: deckWidth * 0.09 }] }]} />
        <View style={[s.deckUnder, { width: deckWidth, height: deckWidth * 1.39, transform: [{ rotate: '-10deg' }, { translateX: -deckWidth * 0.07 }] }]} />
        <CardBack width={deckWidth} />
      </View>
      {!dealing && <View style={[s.hudRow, { bottom: hudBottom, width: hudRowWidth, borderRadius: meterSize / 2 + 5 }]}>
        {hand && canPrepare ? <Pressable accessibilityRole="button" accessibilityLabel="Guía: probabilidad de ganar" onPress={() => setHudGuide('chance')} style={[s.hudSlot, { width: meterSize, height: meterSize }]}><ChanceMeter chance={chance} size={meterSize} /></Pressable> : <View style={[s.hudSlot, { width: meterSize, height: meterSize }]} />}
        <Pressable accessibilityRole="button" accessibilityLabel="Guía: tu saldo" onPress={() => setHudGuide('balance')} style={s.hudBalance}>
          <Text allowFontScaling={false} style={[s.hudCoin, { fontSize: Math.round(19 * hudScale) }]}>◆</Text>
          <AnimatedCounter receiptSize={hudReceiptSize} label="Tu saldo" value={human.balance} initialValue={human.balance + (dealing && hand ? 1 : 0)} style={[s.hudBalanceText, { fontSize: hudBalanceSize, lineHeight: Math.round(hudBalanceSize * 1.3) }]} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Guía: turno y tiempo" onPress={() => setHudGuide('turn')}>
          <TurnTimeMeter key={`${match.roundNumber}-${round.currentTurnIndex}`} order={round.turnOrder.indexOf('human') + 1} active={turn && !ended} size={meterSize} />
        </Pressable>
      </View>}
      </BlurTargetView>
      {presentation && <RoundPresentation key={`${presentation.type}-${presentation.actorId}-${presentation.next.roundNumber}-${presentation.next.round?.bets.length}`} type={presentation.type} next={presentation.next} actorId={presentation.actorId} complete={completePresentation} width={size.width} height={size.height} />}
      {burst && <SwipeBurst key={burst.id} type={burst.type} width={size.width} height={size.height} complete={clearBurst} />}
      {pity && !reducedMotion && <PityBurst key={`pity-${pity}`} width={size.width} height={size.height} top={reactionTop} complete={completeReaction} />}
      {cheer && !reducedMotion && <WinBurst key="cheer" width={size.width} height={size.height} top={reactionTop} complete={completeReaction} />}
      {hudGuide && <HudGuide guide={hudGuide} onClose={() => setHudGuide(undefined)} style={{ position: 'absolute', alignSelf: 'center', zIndex: 12, bottom: hudBottom + 58, width: Math.min(320, hudRowWidth + 56) }} />}
      {seatGuide && <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { zIndex: 12 }]}><PlayerGuideCard match={match} playerId={seatGuide} onClose={() => setSeatGuide(undefined)} style={{ position: 'absolute', alignSelf: 'center', bottom: size.height * 0.52, width: 272 }} /></View>}
      <View pointerEvents="none" style={[s.pot, { bottom: size.height - (deckPosition(size.width, size.height).y - deckWidth * 0.695) - Math.round(deckWidth * 1.39 * 0.28), transform: [{ scale: potScale }], transformOrigin: 'bottom' }]}>
        {(dealing || ended) && <Text style={s.turn}>{dealing ? 'Preparando la ronda' : 'Ronda terminada'}</Text>}
        <View style={s.potBadge}>
          <Text style={s.potCaption}>PLATO</Text>
          <View style={s.potRow}>
            <Text allowFontScaling={false} style={s.potCoin}>◆</Text>
            <AnimatedCounter receiptSize={16} label="Plato" delayMs={dealArrivalMs(round.turnOrder.length, 0)} stepGapMs={dealArrivalGap(round.turnOrder.length)} contributionSteps={dealing ? round.turnOrder.length : 0} value={round.pot} initialValue={round.pot - (dealing ? Object.keys(round.hands).length : 0)} style={s.potNumber} />
          </View>
        </View>
      </View>
      {ended && !reactionVisible && <View pointerEvents="none" accessibilityLiveRegion="polite" style={[s.floatResult, { bottom: hudBottom + 60 }]}><Text style={s.floatResultText}>{`${round.winnerId ? round.winnerId === 'human' ? 'Ganaste la apuesta' : `${match.players.find(p => p.id === round.winnerId)?.name} ganó la apuesta` : passed ? 'Pasaste · ronda cerrada' : 'Ronda cerrada'}${latest ? ` · ${latest.amount} ${latest.amount === 1 ? 'ficha' : 'fichas'}` : ''}`}</Text></View>}
      {ended && <View style={[s.floatActions, { bottom: insets.bottom + 18, width: hudRowWidth }]}>
        {spectating ? <CtaButton label={joinQueued ? 'Cancelar entrada' : 'Entrar a la ronda'} arrow={false} disabled={human.balance < 1} height={meterSize + 10} onPress={join} /> : isHost ? <CtaButton label="Siguiente ronda" disabled={busy} height={meterSize + 10} onPress={next} /> : <RoundWaitBar hostName={hostName} avatar={hostAvatar} round={match.roundNumber + 1} getDeadline={getNextRoundAt} />}
      </View>}
      {ended && spectating && <View pointerEvents="none" style={[s.floatWait, { bottom: insets.bottom + 95 }]}><RoundWaitBar hostName={hostName} avatar={hostAvatar} round={match.roundNumber + 1} getDeadline={getNextRoundAt} compact /></View>}
      {!ended && <Animated.View pointerEvents={dealing ? 'none' : 'auto'} style={[s.dock, { paddingBottom: 6 + insets.bottom }, { opacity: dockEntrance, transform: [{ translateY: dockEntrance.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] } ]}>
        {dealing ? null : spectating ? <View style={s.spectatorDock}><Text style={s.spectatorTitle}>Estás viendo la mesa</Text><Text style={s.spectatorNote}>{human.balance < 1 ? 'Sin fichas para entrar. Conservas acceso al historial.' : 'Entrarás antes del próximo reparto, sin interrumpir esta ronda.'}</Text><Control text={joinQueued ? 'Cancelar entrada' : 'Entrar a la próxima ronda'} disabled={human.balance < 1} onPress={join} accent muted={joinQueued} /></View> : humanReceiving ? null : humanBet ? <PreparedCard title={<>{humanBet.outcome === 'win' ? 'Ganaste' : 'Perdiste'} <Text style={humanBet.outcome === 'win' ? s.prepareGold : s.prepareLoss}>{humanBet.amount}</Text> {humanBet.amount === 1 ? 'ficha' : 'fichas'}</>} sub="La mesa sigue jugando" /> : preparedPass ? <PreparedCard title="Vas a pasar" sub="Se ejecutará al llegar tu turno." cancelLabel="Cancelar pase" onCancel={cancelQueuedAction} /> : queuedAction?.type === 'bet' ? <PreparedCard title={<>Vas a apostar <Text style={s.prepareGold}>{queuedAction.amount}</Text> {queuedAction.amount === 1 ? 'ficha' : 'fichas'}</>} sub="Se ejecutará al llegar tu turno." cancelLabel="Cancelar apuesta" onCancel={cancelQueuedAction} /> : passed ? <PreparedCard title="Pasaste" sub="La mesa sigue jugando" /> : human.balance <= 0 ? <View style={s.status}><Text style={s.statusText}>Sin fichas</Text><Text style={s.statusSub}>{hand ? 'Tu turno se pasa automáticamente.' : 'No participas en esta ronda.'}</Text></View> : <View style={s.betBar}>
          <View style={s.betAmountRow}>
            <Text allowFontScaling={false} style={s.betAmount}>{numeric}</Text>
            <Text style={s.betAmountUnit}>FICHAS</Text>
          </View>
          <View style={s.betRow}>
            <BetStep label="Reducir apuesta" symbol="−" disabled={numeric <= 1} change={() => changeAmount(-1)} />
            <BetStep label="Reducir 50" symbol="−50" disabled={numeric <= 1} change={() => changeQuickAmount(-50)} />
            <BetStep label="Reducir 10" symbol="−10" disabled={numeric <= 1} change={() => changeQuickAmount(-10)} />
            <BetStep label="Aumentar 10" symbol="+10" disabled={numeric >= maximum} change={() => changeQuickAmount(10)} />
            <BetStep label="Aumentar 50" symbol="+50" disabled={numeric >= maximum} change={() => changeQuickAmount(50)} />
            <BetStep label="Aumentar apuesta" symbol="+" disabled={numeric >= maximum} change={() => changeAmount(1)} />
          </View>
          <View style={s.betRow}>
            <Pressable accessibilityRole="button" accessibilityLabel="Pasar" disabled={!canPrepare} onPress={pass} style={({ pressed }) => [s.betAction, s.betActionSecondary, !canPrepare && s.disabled, pressed && s.pressed]}><Text style={s.betActionSecondaryText}>Pasar</Text></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={`Apostar ${numeric} fichas`} disabled={blocked} onPress={() => bet(numeric)} style={({ pressed }) => [s.betAction, s.betActionPrimary, blocked && s.disabled, pressed && s.pressed]}><Text style={s.betActionPrimaryText}>Apostar {numeric}</Text><Text style={s.betActionArrow}>↗</Text></Pressable>
          </View>
          {!turn && <Text style={s.prepareHint}>Se ejecutará al llegar tu turno.</Text>}
          {queueNotice !== '' && <Text style={s.hint}>{queueNotice}</Text>}
        </View>}
      </Animated.View>}
      <View pointerEvents="none" style={s.tableRail} />
    </View>
  );
}

const s = StyleSheet.create({
  orderBadge: { position: 'absolute', top: -10, left: -8, width: 23, height: 23, borderRadius: 12, color: '#23351B', backgroundColor: '#E1E9CF', borderWidth: 1, borderColor: '#718366', textAlign: 'center', lineHeight: 21, fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 11, zIndex: 3 },
  dealerLabel: { color: '#F1D28D', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 8, marginTop: 2 },
  betBar: { backgroundColor: 'rgba(18,57,27,0.78)', borderWidth: 1.5, borderColor: 'rgba(221,193,126,0.5)', borderRadius: 18, padding: 6, gap: 5 },
  betAmountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  betRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  betAmount: { color: '#FFF7DC', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 26, lineHeight: 30, fontVariant: ['tabular-nums'] },
  betAmountUnit: { color: '#E3CE94', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 7, letterSpacing: 1.2 },
  betAction: { flex: 1, minHeight: 42, borderRadius: 21, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  betActionSecondary: { backgroundColor: 'rgba(20,54,13,0.88)', borderWidth: 1.5, borderColor: 'rgba(236,211,148,0.55)' },
  betActionSecondaryText: { color: '#F0EBD7', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 13 },
  betActionPrimary: { backgroundColor: '#F2CB6B', borderWidth: 2, borderColor: '#FFF4CE' },
  betActionPrimaryText: { color: '#223014', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 14 },
  betActionArrow: { color: '#223014', fontSize: 18 },
  prepareHint: { color: '#E4EADA', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, textAlign: 'center', marginTop: 8 },
  centralDeck: { position: 'absolute', transform: [{ rotate: '-5deg' }] },
  deckUnder: { position: 'absolute', left: 0, top: 1, borderRadius: 4, backgroundColor: '#F3E9D2', borderWidth: 1, borderColor: '#BDB49E' },
  deckShadow: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(6,23,4,0.42)' },
  hudRow: { position: 'absolute', alignSelf: 'center', zIndex: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, backgroundColor: 'rgba(18,57,27,0.86)', borderWidth: 1.5, borderColor: '#DDC17E', paddingHorizontal: 12, paddingVertical: 5, shadowColor: '#061704', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  hudSlot: { alignItems: 'center', justifyContent: 'center' },
  hudBalance: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  hudCoin: { color: '#F2CB6B', lineHeight: 22 },
  hudBalanceText: { color: '#FFF7DC', fontFamily: 'PlusJakartaSans_800ExtraBold', fontVariant: ['tabular-nums'] },
  scene: { flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#FFFFFF', minHeight: 490 },
  tableRail: { ...StyleSheet.absoluteFill, zIndex: 11, borderWidth: 7, borderColor: '#254B1B' },
  felt: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#195B08', borderWidth: 7, borderColor: '#254B1B', padding: 10, overflow: 'hidden' },
  feltStitch: { position: 'absolute', top: 10, left: 10, right: 10, bottom: 10, borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(236,211,148,0.45)' },
  opponents: { ...StyleSheet.absoluteFill },
  opponent: { position: 'absolute', width: 78, alignItems: 'center', paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
  activeBadge: { position: 'absolute', top: -14, alignSelf: 'center', color: '#20320E', backgroundColor: '#FFE39A', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3, fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 8, letterSpacing: 0.5, zIndex: 2 },
  opponentActive: { borderColor: '#FFE39A', borderWidth: 2, backgroundColor: '#315D18', shadowColor: '#061704', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 7, elevation: 4 },
  opponentCards: { flexDirection: 'row', gap: 4, marginBottom: 5 },
  playerName: { color: '#FFFFFF', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10 },
  seatAction: { color: '#E8D59B', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 8, marginTop: 2 },
  balance: { color: '#D4E6CE', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 9, marginTop: 2, fontVariant: ['tabular-nums'] },
  pot: { position: 'absolute', alignSelf: 'center', alignItems: 'center', zIndex: 9 },
  potBadge: { alignItems: 'center', backgroundColor: 'rgba(18,57,27,0.94)', borderWidth: 1.5, borderColor: '#DDC17E', borderRadius: 16, paddingHorizontal: 22, paddingVertical: 9, shadowColor: '#061704', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  potCaption: { color: '#E3CE94', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 9, letterSpacing: 2.6 },
  potRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 1 },
  potCoin: { color: '#F2CB6B', fontSize: 19, lineHeight: 23 },
  potNumber: { color: '#FFF7DC', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 38, lineHeight: 46, fontVariant: ['tabular-nums'] },
  turn: { color: '#F1DE9D', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, marginBottom: 4 },
  hand: { position: 'absolute', alignSelf: 'center', flexDirection: 'row', justifyContent: 'center' },
  dock: { position: 'absolute', zIndex: 9, bottom: 0, left: 0, right: 0, paddingHorizontal: 22, paddingBottom: 8, paddingTop: 8 },
  floatActions: { position: 'absolute', alignSelf: 'center', zIndex: 9 },
  prepareGold: { color: '#F2CB6B' },
  prepareLoss: { color: '#FFB6A4' },
  floatResult: { position: 'absolute', alignSelf: 'center', zIndex: 10, backgroundColor: 'rgba(18,57,27,0.94)', borderWidth: 1, borderColor: '#DDC17E', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 7, maxWidth: '86%' },
  floatResultText: { color: '#FFF0C2', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11, textAlign: 'center' },
  floatWait: { position: 'absolute', alignSelf: 'center', zIndex: 9 },
  disabled: { opacity: 0.65 },
  pressed: { transform: [{ scale: 0.97 }] },
  spectatorDock: { backgroundColor: '#12391B', borderRadius: 12, padding: 14, gap: 8 },
  spectatorTitle: { color: '#FFF4CE', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 15, textAlign: 'center' },
  spectatorNote: { color: '#E5D8AC', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, textAlign: 'center', lineHeight: 15 },
  status: { backgroundColor: '#EAE8E2', width: '100%', alignSelf: 'stretch', alignItems: 'center', padding: 12 },
  statusText: { color: '#151D13', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18 },
  statusSub: { color: '#535D4F', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, marginTop: 4 },
  hint: { color: '#FFFFFF', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 10, textAlign: 'center', marginTop: 6 },
});
