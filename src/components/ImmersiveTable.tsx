import { Canvas, Group, Text as SkiaText, useFont } from '@shopify/react-native-skia';
import { useReducedMotion } from 'react-native-reanimated';
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { Animated, Easing, Image, PanResponder, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BlurTargetView, BlurView } from 'expo-blur';
import type { TablePresentation, QueuedAction } from '../hooks/useLocalMatch';
import { currentTurnPlayer, winProbability, maxBetAmount, type Card, type LocalMatch } from '../game';
import { SwipeBurst } from './SwipeBurst';
import { RoundWaitBar } from './RoundWaitBar';
import { WinChance, TurnOrder } from './WinChance';
import { CardFan } from './CardFan';
import { RoundPresentation } from './RoundPresentation';
import { dealArrivalMs, dealArrivalGap, centralDeckWidth, tableCardWidth, deckPosition, opponentPosition, foregroundCardWidth, foregroundHandOffset } from './tableGeometry';
import { AnimatedCounter } from './AnimatedCounter';
import { HUMAN_TURN_TIMEOUT_MS } from '../game/timing';
import { fontAssets } from './fonts';
import { CardBack } from './PlayingCard';

type Props = { match: LocalMatch; queuedAction?: QueuedAction; queueNotice: string; cancelQueuedAction: () => void; presentation?: TablePresentation; completePresentation: () => void; pass: () => void; bet: (amount: number) => void; next: () => void; exit: () => void; join: () => void; joinQueued: boolean; getNextRoundAt: () => number | undefined };

/** User's Figma prototype: one continuous portrait table and a foreground hand. */
export function ImmersiveTable({ match, queuedAction, queueNotice, cancelQueuedAction, presentation, completePresentation, pass, bet, next, exit, join, joinQueued, getNextRoundAt }: Props) {
  const blurTarget = useRef<ComponentRef<typeof BlurTargetView>>(null);
  const busy = Boolean(presentation);
  const dealing = presentation?.type === 'deal';
  const reducedMotion = useReducedMotion();
  const [size, setSize] = useState({ width: 390, height: 700 });
  const [betting, setBetting] = useState(false);
  const [amount, setAmount] = useState('1');
  const [burst, setBurst] = useState<{ id: number; type: 'bet' | 'pass' }>();
  const clearBurst = useCallback(() => setBurst(undefined), []);
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
  const hudWidth = Math.min(204, size.width - 216);
  const hostAvatar = Math.max(0, match.players.findIndex(player => player.id === (match.hostId ?? 'human')));
  const hostName = match.players.find(player => player.id === (match.hostId ?? 'human'))?.name ?? 'El anfitrión';
  const hand = spectating ? undefined : round.hands.human;
  const passed = !spectating && round.actedPlayerIds.includes('human') && !round.bets.some(b => b.playerId === 'human');
  const turn = actor?.id === 'human' && !busy;
  const ended = round.status !== 'in_progress';
  const maximum = maxBetAmount(human, round.pot);
  const numeric = Number(amount);
  const valid = /^\d+$/.test(amount) && numeric >= 1 && numeric <= maximum;
  const canPrepare = human.balance > 0 && !ended && !dealing && Boolean(hand) && round.turnOrder.slice(round.currentTurnIndex).includes('human') && !(busy && actor?.id === 'human');
  const blocked = !canPrepare || maximum < 1;
  const chance = hand ? Math.round(winProbability(hand) * 100) : 0;
  const opponents = match.players.filter(p => p.id !== 'human');
  const cardWidth = foregroundCardWidth(size.width, size.height);
  const handHeight = cardWidth * 1.39;
  const latest = round.bets.at(-1);
  const humanBet = round.bets.find(item => item.playerId === 'human');
  const seatWidth = tableCardWidth(size.width, size.height, match.players.length);
  const deckWidth = centralDeckWidth(size.width, size.height);
  const actingId = presentation?.actorId ?? (presentation?.type === 'bet' ? presentation.next.round?.bets.at(-1)?.playerId : undefined);

  const humanReceiving = presentation?.type === 'bet' && actingId === 'human';
  const raisedHand = humanReceiving || Boolean(humanBet);

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
    Animated.timing(shrink, { toValue: passed ? 1 : 0, duration: reducedMotion ? 0 : 420, useNativeDriver: true }).start();
  }, [passed, shrink, reducedMotion]);

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
    if (betting) {
      if (dx <= 0) return false;
      setBetting(false);
    } else {
      if (!canPrepare || (dx < 0 && blocked)) return false;
      if (dx > 0) pass();
      else setBetting(true);
    }
    animateSwipe(dx > 0 ? 1 : -1);
    if (!reducedMotion) setBurst(current => ({ id: (current?.id ?? 0) + 1, type: dx > 0 ? 'pass' : 'bet' }));
    return true;
  }, [betting, canPrepare, blocked, pass, animateSwipe, reducedMotion]);
  const swipe = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, gesture) => (betting || canPrepare) && gesture.numberActiveTouches === 1 && Math.abs(gesture.dx) > 18 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.6 && (!betting || gesture.dx > 0),
    onPanResponderMove: (_, gesture) => swipeOffset.setValue(Math.max(-64, Math.min(64, gesture.dx * 0.4))),
    onPanResponderRelease: (_, gesture) => { if (!finishSwipe(gesture.dx, gesture.dy, gesture.vx)) animateSwipe(); },
    onPanResponderTerminate: () => animateSwipe(),
    onPanResponderTerminationRequest: () => true,
  }), [betting, canPrepare, finishSwipe, animateSwipe, swipeOffset]);

  const changeAmount = (delta: number) => setAmount(current => String(Math.max(1, Math.min(maximum, (Number(current) || 1) + delta))));
  const changeQuickAmount = (step: number) => setAmount(current => {
    const value = /^\d+$/.test(current) ? Number(current) : 0;
    return String(Math.max(1, Math.min(maximum, value === 1 ? step : value + step)));
  });
  return (
    <View {...(Platform.OS === 'web' ? {} : swipe.panHandlers)}
      onPointerDown={Platform.OS === 'web' ? event => { pointerStart.current = betting || canPrepare ? { x: event.nativeEvent.pageX, y: event.nativeEvent.pageY, time: Date.now() } : null; } : undefined}
      onPointerMove={Platform.OS === 'web' ? event => {
        const start = pointerStart.current;
        if (!start) return;
        const dx = event.nativeEvent.pageX - start.x;
        const dy = event.nativeEvent.pageY - start.y;
        if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.6 && (!betting || dx > 0)) swipeOffset.setValue(Math.max(-64, Math.min(64, dx * 0.4)));
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
      style={[s.scene, { borderRadius: tableRadius }, Platform.OS === 'web' && { userSelect: 'none' }]} onLayout={event => setSize(event.nativeEvent.layout)}>
      <BlurTargetView ref={blurTarget} style={StyleSheet.absoluteFill}>
      <View pointerEvents="none" style={[s.felt, { borderRadius: tableRadius }]}>
        <Image source={require('../../assets/textures/felt.png')} resizeMode="repeat" style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} />
        <View style={[s.feltStitch, { borderRadius: Math.max(14, tableRadius - 28) }]} />
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
          const visibleHand = wager?.hand ?? (showingBet ? round.hands[player.id] : undefined);
          return (
            <View key={player.id} style={[s.opponent, { left: x - (seatWidth * 2 + 16) / 2, top: y, width: seatWidth * 2 + 16 }, active && s.opponentActive]}>
              <Text style={s.orderBadge}>{round.turnOrder.includes(player.id) ? round.turnOrder.indexOf(player.id) + 1 : '—'}</Text>
              {active && <Text style={s.activeBadge}>{busy ? presentation?.type === 'bet' ? 'APUESTA' : 'PASA' : 'TURNO'}</Text>}
              <View style={[s.opponentCards, (dealing || passingNow) && { opacity: 0 }, didPass && { opacity: 0.35 }]}>
                {visibleHand ? <RevealedPair key={player.id} first={visibleHand.first} second={visibleHand.second} third={wager?.thirdCard} outcome={wager?.outcome} width={seatWidth} reducedMotion={reducedMotion} /> : <><CardBack width={seatWidth} disabled={didPass} /><CardBack width={seatWidth} disabled={didPass} /></>}
              </View>
              <Text numberOfLines={1} style={s.playerName}>{player.name}</Text>
              {round.dealerId === player.id && <Text style={s.dealerLabel}>Repartidor</Text>}
              {match.hostId === player.id && <Text style={s.dealerLabel}>Anfitrión</Text>}
              <AnimatedCounter label={`Saldo de ${player.name}`} value={player.balance} delayMs={dealArrivalMs(round.turnOrder.length, round.turnOrder.indexOf(player.id))} initialValue={player.balance + (dealing && round.hands[player.id] ? 1 : 0)} style={s.balance} />
              {(didPass || wager) && <Text style={s.seatAction}>{didPass ? 'Pasó' : `Apostó ${wager?.amount}`}</Text>}
            </View>
          );
        })}
      </View>
      <View style={[s.pot, { top: size.height * 0.27 }]}>
        <Text style={s.potCaption}>PLATO</Text>
        <AnimatedCounter label="Plato" delayMs={dealArrivalMs(round.turnOrder.length, 0)} stepGapMs={dealArrivalGap(round.turnOrder.length)} contributionSteps={dealing ? round.turnOrder.length : 0} value={round.pot} initialValue={round.pot - (dealing ? Object.keys(round.hands).length : 0)} style={s.potNumber} />
        {(dealing || ended) && <Text style={s.turn}>{dealing ? 'Preparando la ronda' : 'Ronda terminada'}</Text>}
      </View>
      {hand && !dealing && <Animated.View pointerEvents="none" style={[s.hand, { bottom: 10, height: handHeight, transform: [
        { translateX: swipeOffset },
        { rotate: swipeOffset.interpolate({ inputRange: [-90, 0, 90], outputRange: ['-6deg', '0deg', '6deg'], extrapolate: 'clamp' }) },
        { translateY: Animated.add(shrink.interpolate({ inputRange: [0, 1], outputRange: [foregroundHandOffset(cardWidth), -25] }), handLift.interpolate({ inputRange: [0, 1], outputRange: [0, foregroundHandOffset(cardWidth, true) - foregroundHandOffset(cardWidth)] })) },
        { scale: shrink.interpolate({ inputRange: [0, 1], outputRange: [1, 0.62] }) },
      ] }]}>
        <CardFan first={hand.first} second={hand.second} third={humanBet?.thirdCard} outcome={humanBet?.outcome} width={cardWidth} disabled={passed} flat={passed} highlighted={turn} />
      </Animated.View>}
      <View pointerEvents="none" accessibilityLabel="Mazo central" style={[s.centralDeck, { left: deckPosition(size.width, size.height).x - deckWidth / 2, top: deckPosition(size.width, size.height).y - deckWidth * 0.695 }]}>
        <View style={[s.deckUnder, { width: deckWidth, height: deckWidth * 1.39 }]} /><CardBack width={deckWidth} />
      </View>
      {hand && canPrepare && <WinChance chance={chance} bottom={handHeight * 0.77 + 28} />}
      {turn && !ended ? <TurnClock key={`${match.roundNumber}-${round.currentTurnIndex}`} bottom={handHeight * 0.77 + 40} width={hudWidth} /> : !dealing && !ended && <View style={[s.turnIndicator, { bottom: handHeight * 0.77 + 40, width: hudWidth }]}><Text style={s.turnIndicatorText}>{humanReceiving ? 'Tu apuesta' : `${actor?.name ?? 'La mesa'}${busy ? presentation?.type === 'pass' ? ' pasa' : ' apuesta' : ' juega'}`}</Text></View>}
      {!spectating && !dealing && <TurnOrder order={round.turnOrder.indexOf('human') + 1} active={turn} bottom={handHeight * 0.77 + 28} />}
      </BlurTargetView>
      {betting && canPrepare && !ended && <BlurView blurTarget={blurTarget} blurMethod="dimezisBlurViewSdk31Plus" intensity={75} tint="dark" style={[s.wager, { top: Math.max(40, size.height * 0.23), maxHeight: size.height - 135 }]} accessibilityViewIsModal onAccessibilityEscape={() => setBetting(false)}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.wagerContent} showsVerticalScrollIndicator={false}>
        <View style={s.wagerHeading}><Text style={s.wagerTitle}>Tu apuesta</Text><Text style={s.wagerLimit}>Límite {maximum}</Text></View>
        <View style={s.amountRow}>
          <BetStep label="Reducir apuesta" symbol="−" disabled={numeric <= 1} change={() => changeAmount(-1)} />
          <View style={s.amountWrap}><TextInput accessibilityLabel="Cantidad de fichas" keyboardType="number-pad" value={amount} onChangeText={setAmount} onPointerDown={Platform.OS === 'web' ? event => event.stopPropagation() : undefined} style={[s.amount, Platform.OS === 'web' && { userSelect: 'text' }]} selectTextOnFocus /><Text style={s.amountUnit}>FICHAS</Text></View>
          <BetStep label="Aumentar apuesta" symbol="+" disabled={numeric >= maximum} change={() => changeAmount(1)} />
        </View>
        <View style={s.quickRow}>{[10, 50].map(step => <Pressable key={step} accessibilityRole="button" disabled={numeric >= maximum} onPress={() => changeQuickAmount(step)} style={s.quick}><Text style={s.quickText}>+{step}</Text></Pressable>)}
          <Pressable accessibilityRole="button" accessibilityLabel={`Apostar el Plato completo: ${maximum} fichas`} onPress={() => setAmount(String(maximum))} style={[s.plato, numeric === maximum && s.platoSelected]}><Text style={s.platoText}>¡PLATO!</Text><Text style={s.platoSmall}>{maximum} · máximo</Text></Pressable>
        </View>
        {!turn && <Text style={s.prepareHint}>Se ejecutará cuando llegue tu turno.</Text>}
        {!valid && <Text style={s.error}>Introduce un entero entre 1 y {maximum}.</Text>}
        <View style={s.wagerActions}>
          <Control text="Cancelar" label="Cancelar apuesta" onPress={() => setBetting(false)} wide />
          <Control text={valid ? `Apostar ${numeric}` : 'Apostar'} disabled={!valid || blocked} onPress={() => { setBetting(false); bet(numeric); }} accent wide />
        </View>
        </ScrollView>
      </BlurView>}
      {presentation && <RoundPresentation key={`${presentation.type}-${presentation.actorId}-${presentation.next.roundNumber}-${presentation.next.round?.bets.length}`} type={presentation.type} next={presentation.next} actorId={presentation.actorId} complete={completePresentation} width={size.width} height={size.height} />}
      {burst && <SwipeBurst key={burst.id} type={burst.type} width={size.width} height={size.height} complete={clearBurst} />}
      <View pointerEvents="none" style={[s.yourBalance, { bottom: ended ? (isHost ? 154 : spectating ? 242 : 164) : spectating ? 156 : passed ? 100 : 164 }]}>
        <Text style={s.balanceCaption}>{spectating ? 'TU SALDO · ESPECTADOR' : 'TU SALDO'}</Text>
        <View style={s.balanceAmount}><Text style={s.balanceCoin}>◆</Text><AnimatedCounter receiptAbove label="Tu saldo" delayMs={dealArrivalMs(round.turnOrder.length, round.turnOrder.indexOf('human'))} value={human.balance} initialValue={human.balance + (dealing && hand ? 1 : 0)} style={s.yourBalanceText} /><Text style={s.balanceUnit}>fichas</Text></View>
      </View>
      <Animated.View pointerEvents={dealing ? 'none' : 'auto'} style={[s.dock, ended && s.resultDock, { opacity: dockEntrance, transform: [{ translateY: dockEntrance.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] } ]}>
        {dealing ? null : ended ? <>
          <Text style={s.result}>{round.winnerId ? round.winnerId === 'human' ? 'Ganaste la apuesta' : `${match.players.find(p => p.id === round.winnerId)?.name} ganó la apuesta` : passed ? 'Pasaste · ronda cerrada' : 'Ronda cerrada'}{latest ? ` · ${latest.amount} ${latest.amount === 1 ? 'ficha' : 'fichas'}` : ''}</Text>
          <View style={s.roundFooter}>
            <Pressable accessibilityRole="button" onPress={exit} disabled={busy} style={s.exitRound}><Text style={s.exitRoundText}>Salir</Text></Pressable>
            {spectating ? <Pressable accessibilityRole="button" disabled={human.balance < 1} onPress={join} style={[s.nextRound, s.footerPrimary, joinQueued && { opacity: 0.85 }, human.balance < 1 && s.disabled]}><Text style={s.nextRoundText}>{joinQueued ? 'Cancelar entrada' : 'Entrar a la ronda'}</Text></Pressable> : isHost ? <Pressable accessibilityRole="button" accessibilityLabel="Siguiente ronda" disabled={busy} onPress={next} style={({ pressed }) => [s.nextRound, s.footerPrimary, busy && s.disabled, pressed && s.pressed]}><Text style={s.nextRoundText}>Siguiente ronda</Text><Text style={s.nextRoundArrow}>↗</Text></Pressable> : <RoundWaitBar hostName={hostName} avatar={hostAvatar} round={match.roundNumber + 1} getDeadline={getNextRoundAt} />}
          </View>
          {!isHost && spectating && <RoundWaitBar hostName={hostName} avatar={hostAvatar} round={match.roundNumber + 1} getDeadline={getNextRoundAt} compact />}
          {joinQueued && <Text style={s.autoRound}>Entrarás antes del próximo reparto.</Text>}
        </> : betting && canPrepare ? null : spectating ? <View style={s.spectatorDock}><Text style={s.spectatorTitle}>Estás viendo la mesa</Text><Text style={s.spectatorNote}>{human.balance < 1 ? 'Sin fichas para entrar. Conservas acceso al historial.' : 'Entrarás antes del próximo reparto, sin interrumpir esta ronda.'}</Text><Control text={joinQueued ? 'Cancelar entrada' : 'Entrar a la próxima ronda'} disabled={human.balance < 1} onPress={join} accent muted={joinQueued} /></View> : humanReceiving ? null : humanBet ? <View style={s.status}><Text style={s.statusText}>{humanBet.outcome === 'win' ? 'Ganaste' : 'Perdiste'} {humanBet.amount} {humanBet.amount === 1 ? 'ficha' : 'fichas'}</Text><Text style={s.statusSub}>La mesa sigue jugando</Text></View> : passed ? <View style={s.status}><Text style={s.statusText}>Pasaste</Text><Text style={s.statusSub}>La mesa sigue jugando</Text></View> : human.balance <= 0 ? <View style={s.status}><Text style={s.statusText}>Sin fichas</Text><Text style={s.statusSub}>{hand ? 'Tu turno se pasa automáticamente.' : 'No participas en esta ronda.'}</Text></View> : <>
          {!hand && !busy && <Text style={s.hint}>Sin ficha para aportar: esta ronda te salta.</Text>}
          <View style={s.roundActions}>
            <RoundAction text={queuedAction?.type === 'pass' ? 'Cancelar pase' : 'Pasar'} symbol="→" muted={queuedAction?.type === 'pass'} disabled={!canPrepare} onPress={queuedAction?.type === 'pass' ? cancelQueuedAction : pass} />
            <RoundAction text={queuedAction?.type === 'bet' ? `Cancelar apuesta de ${queuedAction.amount}` : 'Apostar'} symbol="↗" accent muted={queuedAction?.type === 'bet'} pulse={chance > 0 && canPrepare && !busy && !queuedAction} disabled={blocked} onPress={queuedAction?.type === 'bet' ? cancelQueuedAction : () => setBetting(true)} />
          </View>
          {queueNotice !== '' && <Text style={s.hint}>{queueNotice}</Text>}
        </>}
      </Animated.View>
      <View pointerEvents="none" style={[s.tableRail, { borderRadius: tableRadius }]} />
    </View>
  );
}
function TableWordmark({ width, top }: { width: number; top: number }) {
  const font = useFont(fontAssets.PlayfairDisplay_700Bold, width * 0.20);
  return <View pointerEvents="none" style={[s.monogram, { top }]}><Canvas style={{ width, height: width * 0.48 }}>
    {font && 'PLATO'.split('').map((letter, index) => {
      const angle = (index - 2) * 0.19;
      const x = width / 2 + Math.sin(angle) * width * 0.95;
      const y = width * 0.99 - Math.cos(angle) * width * 0.78;
      const glyphWidth = font.measureText(letter).width;
      return <Group key={index} origin={{ x, y }} transform={[{ rotate: angle }]}><SkiaText text={letter} x={x - glyphWidth / 2} y={y} font={font} style="stroke" strokeWidth={0.85} color="rgba(238,204,125,0.38)" /></Group>;
    })}
  </Canvas></View>;
}
function RoundAction({ text, symbol, onPress, disabled = false, accent = false, muted = false, pulse = false }: { text: string; symbol: string; onPress: () => void; disabled?: boolean; accent?: boolean; muted?: boolean; pulse?: boolean }) {
  const reduced = useReducedMotion();
  const [breath] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (!pulse || reduced) { breath.setValue(1); return; }
    const animation = Animated.loop(Animated.sequence([
      Animated.delay(1200), Animated.timing(breath, { toValue: 1.045, duration: 750, useNativeDriver: true }),
      Animated.timing(breath, { toValue: 1, duration: 850, useNativeDriver: true }),
    ]));
    animation.start();
    return () => { animation.stop(); breath.stopAnimation(); };
  }, [pulse, reduced, breath]);
  return <Animated.View style={{ transform: [{ scale: breath }] }}><Pressable accessibilityRole="button" accessibilityLabel={text} disabled={disabled} onPress={onPress} style={({ pressed }) => [s.roundAction, accent && s.accent, muted && { opacity: 0.85 }, disabled && s.disabled, pressed && s.pressed]}><Text style={s.roundSymbol}>{symbol}</Text><Text style={s.roundLabel}>{text}</Text></Pressable></Animated.View>;
}
function BetStep({ label, symbol, change, disabled }: { label: string; symbol: string; change: () => void; disabled: boolean }) {
  const interval = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const repeated = useRef(false);
  const currentChange = useRef(change);
  useEffect(() => { currentChange.current = change; }, [change]);
  useEffect(() => () => clearInterval(interval.current), []);
  useEffect(() => { if (disabled) clearInterval(interval.current); }, [disabled]);
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityHint="Mantén pulsado para cambiar más rápido" disabled={disabled}
    onPressIn={() => { repeated.current = false; }}
    onLongPress={() => { repeated.current = true; interval.current = setInterval(() => currentChange.current(), 100); }}
    onPressOut={() => clearInterval(interval.current)}
    onPress={() => { if (!repeated.current) change(); }}
    style={({ pressed }) => [s.stepButton, disabled && s.disabled, pressed && s.pressed]}><Text style={s.stepSymbol}>{symbol}</Text></Pressable>;
}
function RevealedPair({ first, second, third, outcome, width, reducedMotion }: { first: Card; second: Card; third?: Card; outcome?: 'win' | 'loss'; width: number; reducedMotion: boolean }) {
  const [flip] = useState(() => new Animated.Value(1));
  const [open, setOpen] = useState(reducedMotion);
  useEffect(() => {
    if (reducedMotion) return;
    let alive = true;
    Animated.timing(flip, { toValue: 0.01, duration: 190, useNativeDriver: true }).start(() => {
      if (!alive) return;
      setOpen(true);
      Animated.timing(flip, { toValue: 1, duration: 240, useNativeDriver: true }).start();
    });
    return () => { alive = false; flip.stopAnimation(); };
  }, [flip, reducedMotion]);
  return <Animated.View style={{ flexDirection: 'row', gap: 4, transform: [{ scaleX: flip }] }}>
    {open ? <CardFan first={first} second={second} third={third} outcome={outcome} width={width} /> : <><CardBack width={width} /><CardBack width={width} /></>}
  </Animated.View>;
}
function TurnClock({ bottom, width }: { bottom: number; width: number }) {
  const [seconds, setSeconds] = useState(HUMAN_TURN_TIMEOUT_MS / 1000);
  useEffect(() => {
    const deadline = Date.now() + HUMAN_TURN_TIMEOUT_MS;
    const timer = setInterval(() => setSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1000))), 200);
    return () => clearInterval(timer);
  }, []);
  return <View style={[s.clock, { bottom, width }]}>
    <Text accessibilityLabel={`Te quedan ${seconds} segundos`} style={[s.clockText, seconds <= 5 && { color: '#FFB6A4' }]}>{seconds} s</Text>
    <View style={s.clockTrack}><View style={[s.clockFill, { width: `${seconds / (HUMAN_TURN_TIMEOUT_MS / 1000) * 100}%` }, seconds <= 5 && { backgroundColor: '#F08C77' }]} /></View>
  </View>;
}
function Control({ text, label, onPress, disabled = false, wide = false, accent = false, muted = false }: { text: string; label?: string; onPress: () => void; disabled?: boolean; wide?: boolean; accent?: boolean; muted?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label ?? text} disabled={disabled} onPress={onPress} style={({ pressed }) => [s.control, wide && s.wide, accent && s.accent, muted && { opacity: 0.85 }, disabled && s.disabled, pressed && s.pressed]}><Text style={[s.controlText, accent && s.accentText]}>{text}</Text></Pressable>;
}
const s = StyleSheet.create({
  orderBadge: { position: 'absolute', top: -10, left: -8, width: 23, height: 23, borderRadius: 12, color: '#23351B', backgroundColor: '#E1E9CF', borderWidth: 1, borderColor: '#718366', textAlign: 'center', lineHeight: 21, fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 11, zIndex: 3 },
  dealerLabel: { color: '#F1D28D', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 8, marginTop: 2 },
  roundActions: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', paddingTop: 4 },
  roundAction: { width: 126, height: 126, borderRadius: 63, backgroundColor: '#E8E9DC', borderWidth: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 12 },
  roundSymbol: { color: '#293B20', fontSize: 28, lineHeight: 32 },
  roundLabel: { color: '#1D2D17', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 14, lineHeight: 18, textAlign: 'center' },
  wagerContent: { padding: 24 },
  wagerActions: { flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-between', gap: 12, marginTop: 20 },
  prepareHint: { color: '#E4EADA', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, textAlign: 'center', marginTop: 12 },
  history: { position: 'absolute', top: '23%', bottom: 140, left: 20, right: 20, backgroundColor: '#F8F5EC', padding: 16, borderRadius: 10, zIndex: 4 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  historyTitle: { color: '#172315', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 },
  historyClose: { color: '#4A5C41', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12 },
  historyRow: { paddingVertical: 12, borderTopWidth: 1, borderColor: '#D4D9CA' },
  historyCards: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  resultDock: { backgroundColor: '#123710', borderTopWidth: 1, borderColor: '#D8B96B', paddingTop: 18, paddingBottom: 22 },
  nextRound: { minHeight: 66, paddingHorizontal: 22, backgroundColor: '#F2CB6B', borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  nextRoundText: { color: '#223014', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18 },
  nextRoundArrow: { color: '#223014', fontSize: 30 },
  lastCardLabel: { color: '#E6EDD8', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 8, marginTop: 4 },
  centralDeck: { position: 'absolute', transform: [{ rotate: '-5deg' }] },
  deckUnder: { position: 'absolute', left: 3, top: 4, width: 46, height: 64, borderRadius: 4, backgroundColor: '#F3E9D2', borderWidth: 1, borderColor: '#BDB49E' },
  clock: { position: 'absolute', alignSelf: 'center', minHeight: 40, justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, backgroundColor: '#12391B', zIndex: 2 },
  turnIndicator: { position: 'absolute', alignSelf: 'center', minHeight: 40, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, backgroundColor: '#12391B', alignItems: 'center', justifyContent: 'center' },
  turnIndicatorText: { color: '#FFF0C1', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, textAlign: 'center' },
  clockText: { color: '#FFFFFF', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14, textAlign: 'center', fontVariant: ['tabular-nums'] },
  clockTrack: { height: 3, backgroundColor: '#43633A', marginTop: 4, borderRadius: 2, overflow: 'hidden' },
  clockFill: { height: 3, backgroundColor: '#F2CB6B' },
  scene: { flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#FFFFFF', minHeight: 490, marginTop: 6, marginBottom: 8 },
  tableRail: { ...StyleSheet.absoluteFill, zIndex: 11, borderWidth: 7, borderColor: '#254B1B' },
  felt: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#195B08', borderWidth: 7, borderColor: '#254B1B', padding: 10, overflow: 'hidden' },
  feltStitch: { position: 'absolute', top: 21, left: 21, right: 21, bottom: 21, borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(236,211,148,0.45)' },
  monogram: { position: 'absolute', alignSelf: 'center' },
  opponents: { ...StyleSheet.absoluteFill },
  opponent: { position: 'absolute', width: 78, alignItems: 'center', paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
  activeBadge: { position: 'absolute', top: -14, alignSelf: 'center', color: '#20320E', backgroundColor: '#FFE39A', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3, fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 8, letterSpacing: 0.5, zIndex: 2 },
  opponentActive: { borderColor: '#FFE39A', borderWidth: 2, backgroundColor: '#315D18', shadowColor: '#061704', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 7, elevation: 4 },
  opponentCards: { flexDirection: 'row', gap: 4, marginBottom: 5 },
  playerName: { color: '#FFFFFF', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10 },
  queue: { padding: 8, marginTop: 7, backgroundColor: '#173F10', borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  queueText: { flex: 1, color: '#F5DF9B', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 10 },
  cancelQueue: { color: '#FFFFFF', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, paddingVertical: 8 },
  seatAction: { color: '#E8D59B', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 8, marginTop: 2 },
  balance: { color: '#D4E6CE', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 9, marginTop: 2, fontVariant: ['tabular-nums'] },
  pot: { position: 'absolute', alignSelf: 'center', alignItems: 'center' },
  potCaption: { color: '#CFE2C7', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 9, letterSpacing: 2 },
  potNumber: { color: '#FFFFFF', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 34, lineHeight: 44, fontVariant: ['tabular-nums'] },
  turn: { color: '#F1DE9D', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, marginTop: 5 },
  hand: { position: 'absolute', alignSelf: 'center', flexDirection: 'row', justifyContent: 'center' },
  dock: { position: 'absolute', zIndex: 9, bottom: 0, left: 0, right: 0, paddingHorizontal: 22, paddingBottom: 18, paddingTop: 8 },
  actions: { flexDirection: 'row', gap: 16 },
  control: { minHeight: 50, minWidth: 48, paddingHorizontal: 16, backgroundColor: '#EAE8E2', alignItems: 'center', justifyContent: 'center', borderRadius: 3 },
  wide: { flex: 1 },
  controlText: { color: '#101610', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 14 },
  accent: { backgroundColor: '#F2CB6B' },
  accentText: { color: '#1E290E' },
  disabled: { opacity: 0.65 },
  pressed: { transform: [{ scale: 0.97 }] },
  yourBalanceText: { color: '#FFF7DC', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 25, lineHeight: 32, fontVariant: ['tabular-nums'] },
  yourBalance: { position: 'absolute', zIndex: 10, alignSelf: 'center', alignItems: 'center', backgroundColor: '#12391B', borderWidth: 1, borderColor: '#DDC17E', borderRadius: 12, minWidth: 188, paddingHorizontal: 18, paddingVertical: 9 },
  balanceCaption: { color: '#E3CE94', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 9, letterSpacing: 0.8 },
  balanceAmount: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  balanceCoin: { color: '#F2CB6B', fontSize: 20 },
  balanceUnit: { color: '#E3D9B7', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 10, marginTop: 6 },
  roundFooter: { flexDirection: 'row', alignItems: 'stretch', gap: 12, marginTop: 10 },
  footerPrimary: { flex: 1, marginTop: 0, paddingHorizontal: 14 },
  exitRound: { width: 76, minHeight: 66, borderWidth: 1, borderColor: '#A4AE87', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  exitRoundText: { color: '#F0EBD7', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 14 },
  autoRound: { color: '#E5D8AC', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 10, textAlign: 'center', marginTop: 10 },
  spectatorDock: { backgroundColor: '#12391B', borderRadius: 12, padding: 14, gap: 8 },
  spectatorTitle: { color: '#FFF4CE', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 15, textAlign: 'center' },
  spectatorNote: { color: '#E5D8AC', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, textAlign: 'center', lineHeight: 15 },

  wager: { position: 'absolute', alignSelf: 'center', width: '92%', maxWidth: 460, backgroundColor: 'rgba(18,45,22,0.48)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(245,255,235,0.5)', overflow: 'hidden', zIndex: 12 },
  wagerTitle: { color: '#FFFFFF', fontFamily: 'PlusJakartaSans_700Bold', textAlign: 'center', fontSize: 27, marginBottom: 8 },
  wagerHeading: { alignItems: 'center', marginBottom: 14 },
  wagerLimit: { color: '#D7E1C8', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 10, textAlign: 'center' },
  amountWrap: { flex: 1, alignItems: 'center' },
  amountUnit: { color: '#C7D7B8', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 7, letterSpacing: 1 },
  stepButton: { width: 60, height: 60, borderRadius: 30, borderWidth: 1, borderColor: '#789064', alignItems: 'center', justifyContent: 'center', backgroundColor: '#244F19' },
  stepSymbol: { color: '#FFF3CF', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 25 },
  quickRow: { flexDirection: 'row', alignItems: 'stretch', gap: 7, marginTop: 20 },
  quick: { minHeight: 50, justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#244F19' },
  quickText: { color: '#E4ECCF', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11 },
  platoSelected: { borderWidth: 2, borderColor: '#FFF4CE' },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  amount: { flex: 1, color: '#FFFFFF', textAlign: 'center', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 44, paddingVertical: 8, paddingHorizontal: 4, width: '100%', fontVariant: ['tabular-nums'] },
  plato: { flex: 1, backgroundColor: '#F2CB6B', alignItems: 'center', paddingVertical: 7, borderRadius: 8, minHeight: 50, justifyContent: 'center' },
  platoText: { color: '#182515', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 14 },
  platoSmall: { color: '#45502C', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 8, marginTop: 3 },
  error: { color: '#FFF3C2', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, textAlign: 'center', marginTop: 5 },
  status: { backgroundColor: '#EAE8E2', width: '100%', alignSelf: 'stretch', alignItems: 'center', padding: 12 },
  statusText: { color: '#151D13', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18 },
  statusSub: { color: '#535D4F', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, marginTop: 4 },
  result: { color: '#FFFFFF', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, textAlign: 'center', marginBottom: 5 },
  revealed: { color: '#DBE8D5', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, textAlign: 'center', marginBottom: 10 },
  hint: { color: '#FFFFFF', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 10, textAlign: 'center', marginTop: 6 },
});
