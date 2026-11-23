/*
THESIS: PLATO feels like a private, tactile card room: social, composed, and instantly playable.
OWN-WORLD: Swiss poster typography and red signals meet warm paper, deep felt, walnut, brass, and character portraits.
STORY: Choose a table size, read the shared pot and your hand, then pass or bet. Bots move briskly; a win closes the round.
FIRST VIEWPORT: Compact round header, oval felt table with opponents and pot, the player's hand, then a quiet turn marker and thumb-ready action dock.
FORM: Portrait-first. Keep the casino table immersive, the card values legible, and “Tu turno” small. Skia draws the table; Reanimated animates card reveals and press feedback.
*/
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import type { LocalMatch, Player } from '../game';
import { useLocalMatch } from '../hooks/useLocalMatch';
import { CasinoTable } from './CasinoTable';
import { palette } from './theme';
import { BOT_NAMES } from '../game/match';
import { CloseMatchDialog } from './CloseMatchDialog';
import { LeaveTableDialog } from './LeaveTableDialog';
import { ActionHistory } from './ActionHistory';
import { TableIcon } from './TableIcon';
import { ImmersiveTable } from './ImmersiveTable';

function randomTableSize(previous?: number) {
  const choices = [2, 3, 4, 5, 6, 7, 8].filter(count => count !== previous);
  return choices[Math.floor(Math.random() * choices.length)];
}

function money(value: number): string {
  return value.toLocaleString('es-MX');
}

export default function PlatoGameScreen() {
  const { width, height } = useWindowDimensions();
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const { getNextRoundAt, watching, resumeWatching, joinQueued, requestJoin, leaveTable, queuedAction, queueNotice, cancelQueuedAction, match: committedMatch, presentation, finishPresentation, startMatch, pass, bet, nextRound, closeMatch } = useLocalMatch(confirmLeave || confirmClose);
  const match = presentation?.type === 'deal' ? presentation.next : committedMatch;
  const [tableSize, setTableSize] = useState(() => randomTableSize());
  const [showHistory, setShowHistory] = useState(false);
  const round = match?.round;

  const gameLabel = useMemo(() => {
    if (!match || match.status === 'closed') return 'MESA ABIERTA';
    return match.status === 'awaiting_host' ? 'EN ESPERA' : `LOCAL · ${match.players.length - 1} BOTS`;
  }, [match]);

  const startNewMatch = () => {
    setConfirmClose(false);
    setConfirmLeave(false);
    const count = match ? randomTableSize(tableSize) : tableSize;
    setTableSize(count);
    startMatch(count - 1);
  };

  const requestClose = () => setConfirmClose(true);
  const finishClose = () => {
    setConfirmClose(false);
    closeMatch();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.shell, { maxWidth: width > 760 ? 640 : 620 }]}>
        <Header
          historyAction={match ? () => setShowHistory(true) : undefined}
          label={gameLabel}
          roundNumber={match?.roundNumber}
          leaveAction={watching && match && match.status !== 'closed' ? () => setConfirmLeave(true) : undefined}
        />

        {!match ? (
          <SetupScreen
            tableSize={tableSize}
            setTableSize={setTableSize}
            start={startNewMatch}
            width={width}
            height={height}
          />
        ) : !watching ? (
          <View style={styles.awaitingScreen}><Text style={styles.awaitingTitle}>Saliste de la mesa.</Text><Text style={[styles.awaitingBody, { color: '#4F6046' }]}>{match.players.find(player => player.id === match.hostId)?.name} es el anfitrión. Conservas tus {money(match.players.find(player => player.id === 'human')!.balance)} fichas.</Text><AnimatedButton title="Volver a mirar" onPress={resumeWatching} variant="primary" standalone /><AnimatedButton title="Nueva partida" onPress={startNewMatch} variant="quiet" standalone /></View>
        ) : match.status === 'closed' ? (
          <MatchSummary match={match} replay={startNewMatch} />
        ) : match.status === 'awaiting_host' ? (
          <AwaitingHost match={match} close={requestClose} leave={() => setConfirmLeave(true)} join={requestJoin} />
        ) : round ? (
          <View style={{ flex: 1 }}>
            <ImmersiveTable key={match.roundNumber} match={match} queuedAction={queuedAction} queueNotice={queueNotice} cancelQueuedAction={cancelQueuedAction} presentation={presentation} completePresentation={finishPresentation} exit={() => setConfirmLeave(true)} join={requestJoin} joinQueued={joinQueued} getNextRoundAt={getNextRoundAt} pass={pass} bet={bet} next={nextRound} />

          </View>
        ) : null}
        {confirmLeave && match && <LeaveTableDialog match={match} cancel={() => setConfirmLeave(false)} busy={Boolean(presentation)} closeForEveryone={() => { setConfirmLeave(false); requestClose(); }} confirm={(hostId, stay) => { if (leaveTable(hostId, stay)) setConfirmLeave(false); }} />}
        {confirmClose && <CloseMatchDialog cancel={() => setConfirmClose(false)} confirm={finishClose} />}
        {showHistory && match && <ActionHistory match={match} close={() => setShowHistory(false)} />}
      </View>
    </SafeAreaView>
  );
}

function Header({ label, roundNumber, leaveAction, historyAction }: { label: string; roundNumber?: number; leaveAction?: () => void; historyAction?: () => void }) {
  const { width } = useWindowDimensions();
  const playing = roundNumber !== undefined;
  return <View style={[styles.header, playing && styles.gameHeader]}>
    <View style={styles.brandLockup}>
      <View style={[styles.brandMark, playing && { width: 18, height: 18 }]}><View style={styles.brandMarkSlash} /></View>
      <View><Text style={[styles.brand, playing && styles.gameBrand, playing && width < 360 && { fontSize: 20 } ]}>PLATO</Text>{!playing && <Text style={styles.roomLabel}>{label}</Text>}</View>
    </View>
    {playing && <View pointerEvents="none" style={styles.headerCenter}><View style={styles.headerRound}><Text style={styles.headerRoundLabel}>RONDA</Text><Text style={styles.headerRoundNumber}>{String(roundNumber).padStart(2, '0')}</Text></View></View>}
    <View style={styles.headerRight}>
      {historyAction && <Pressable accessibilityRole="button" accessibilityLabel="Ver historial de acciones" onPress={historyAction} style={({ pressed }) => [styles.headerIconButton, pressed && { opacity: 0.7 }]}><TableIcon name="history" />{width >= 375 && <Text style={styles.historyLabel}>Historial</Text>}</Pressable>}
      {leaveAction && <Pressable onPress={leaveAction} style={({ pressed }) => [styles.headerExit, pressed && { opacity: 0.7 }]} accessibilityRole="button" accessibilityLabel="Salir de la partida" accessibilityHint="Elige un nuevo anfitrión si corresponde y decide si quieres observar."><TableIcon name="exit" /></Pressable>}
    </View>
  </View>;
}

function SetupScreen({ tableSize, setTableSize, start, width, height }: { tableSize: number; setTableSize: (size: number) => void; start: () => void; width: number; height: number }) {
  const previewHeight = Math.max(260, Math.min(320, Math.round(height * 0.33)));
  const previewWidth = Math.min(width - 32, 600);
  return (
    <>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.setupContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(540)} style={styles.setupCopy}>
          <View style={styles.eyebrow}><View style={styles.eyebrowDot} /><Text style={styles.eyebrowText}>CASA DE JUEGO · PARTIDA LOCAL</Text></View>
          <Text style={styles.heroTitle}>La mesa{ '\n' }está lista.</Text>
          <Text style={styles.heroBody}>Una mano, un poco de suerte y un Plato que puede crecer ronda a ronda.</Text>
        </Animated.View>
        <View style={styles.previewWrap}>
          <CasinoTable
            players={previewPlayers(tableSize)}
            dealerId="preview-bot-1"
            activePlayerIds={previewPlayers(tableSize).map((player) => player.id)}
            pot={tableSize}
            width={Math.min(previewWidth, Math.max(280, 600))}
            height={previewHeight}
          />
        </View>
        <View style={styles.setupControls}>
          <View style={styles.selectorHeader}>
            <View>
              <Text style={styles.selectorTitle}>{tableSize - 1} bots en esta mesa</Text>
              <Text style={styles.selectorSubtitle}>Cantidad al azar para cada partida</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={() => setTableSize(randomTableSize(tableSize))} style={styles.roundBadge}><Text style={styles.roundBadgeText}>Otra mesa ↻</Text></Pressable>
          </View>
          <View style={styles.setupRule}>
            <Text style={styles.ruleMark}>↗</Text>
            <Text style={styles.ruleText}>Apuesta si la tercera carta cae entre tus dos cartas.</Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.setupFooter}>
        <AnimatedButton title="Abrir la mesa" onPress={start} variant="primary" />
        <Text style={styles.footnote}>Sin cuenta · Sin dinero real · El saldo se reinicia en cada partida</Text>
      </View>
    </>
  );
}

function previewPlayers(count: number): Player[] {
  const names = BOT_NAMES;
  return [
    { id: 'human', name: 'Tú', seat: 0, balance: 1_000, kind: 'human' },
    ...names.slice(0, count - 1).map((name, index) => ({ id: `preview-bot-${index + 1}`, name, seat: index + 1, balance: 1_000, kind: 'bot' as const })),
  ];
}

function AnimatedButton({ title, onPress, variant, disabled = false, compact = false, standalone = false }: { title: string; onPress: () => void; variant: 'primary' | 'quiet' | 'danger'; disabled?: boolean; compact?: boolean; standalone?: boolean }) {
  const buttonStyle = variant === 'primary' ? styles.buttonPrimary : variant === 'danger' ? styles.buttonDanger : styles.buttonQuiet;
  const labelStyle = variant === 'quiet' ? styles.buttonQuietText : styles.buttonPrimaryText;
  return (
    <View style={[styles.buttonShell, (compact || standalone) && styles.buttonShellCompact, standalone && { width: '100%', maxWidth: 320, minHeight: 48, flexShrink: 0 }]}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [styles.button, buttonStyle, disabled && styles.buttonDisabled, compact && styles.buttonCompact, pressed && !disabled && styles.buttonPressed]}
      >
        <Text numberOfLines={1} style={[labelStyle, disabled && styles.buttonDisabledText, compact && styles.buttonCompactText]}>{title}</Text>
        {variant === 'primary' && !disabled && <View style={styles.buttonArrow}><Text style={styles.buttonArrowText}>↗</Text></View>}
      </Pressable>
    </View>
  );
}

function AwaitingHost({ match, close, leave, join }: { match: LocalMatch; close: () => void; leave: () => void; join: () => void }) {
  return (
    <View style={styles.awaitingScreen}>
      <View style={styles.awaitingMark}><Text style={styles.awaitingMarkText}>Ⅱ</Text></View>
      <Text style={styles.awaitingTitle}>La mesa espera.</Text>
      <Text style={styles.awaitingBody}>Se necesitan dos jugadores con fichas para repartir. El Plato de {money(match.pot)} permanece en la mesa; no hay recargas durante una partida.</Text>
      {match.players.find(player => player.id === 'human')?.spectating && match.players.find(player => player.id === 'human')!.balance > 0 && <AnimatedButton title="Entrar a la ronda" onPress={join} variant="primary" standalone />}
      <AnimatedButton title="Salir de la mesa" onPress={leave} variant="quiet" standalone />
      {(match.hostId ?? 'human') === 'human' && <AnimatedButton title="Cerrar partida" onPress={close} variant="quiet" standalone />}
    </View>
  );
}

function MatchSummary({ match, replay }: { match: LocalMatch; replay: () => void }) {
  const leader = [...match.players].sort((a, b) => b.balance - a.balance)[0];
  return (
    <View style={styles.summaryScreen}>
      <Animated.View entering={FadeInUp.duration(480)} style={styles.summaryMark}><Text style={styles.summaryMarkText}>P</Text></Animated.View>
      <Text style={styles.summaryEyebrow}>MESA CERRADA · {match.roundNumber} RONDAS</Text>
      <Text style={styles.summaryTitle}>Buena partida.</Text>
      <Text style={styles.summaryBody}>{leader ? `${leader.name} termina con ${money(leader.balance)} fichas.` : 'Gracias por jugar.'}</Text>
      <View style={styles.summaryScoreboard}>
        {[...match.players].sort((a, b) => b.balance - a.balance).map((player, index) => (
          <View key={player.id} style={styles.scoreRow}>
            <Text style={styles.scoreRank}>{String(index + 1).padStart(2, '0')}</Text>
            <Text style={styles.scoreName}>{player.name}</Text>
            <Text style={styles.scoreBalance}>{money(player.balance)} <Text style={styles.scoreChip}>◆</Text></Text>
          </View>
        ))}
      </View>
      <View style={styles.summaryFooter}>
        <AnimatedButton title="Jugar otra vez" onPress={replay} variant="primary" />
        <Text style={styles.footnote}>Nuevo saldo inicial: 1,000 fichas por jugador</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  shell: { width: '100%', alignSelf: 'center', flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    height: 76,
    paddingHorizontal: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.darkLine,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 24, height: 24, backgroundColor: palette.red, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  brandMarkSlash: { height: 31, width: 5, backgroundColor: '#FFFFFF', transform: [{ rotate: '38deg' }] },
  brand: { color: palette.ink, fontFamily: 'PlayfairDisplay_900Black', fontSize: 36, lineHeight: 43, letterSpacing: -1 },
  roomLabel: { color: '#555E53', fontSize: 8, lineHeight: 11, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 1.25 },
  gameHeader: { paddingHorizontal: 14 },
  gameBrand: { fontSize: 24, lineHeight: 32, letterSpacing: -0.5 },
  headerCenter: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  headerRound: { minWidth: 58, alignItems: 'center', paddingVertical: 5 },
  headerRoundLabel: { color: '#627057', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 8, letterSpacing: 0.7 },
  headerRoundNumber: { color: '#23351C', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 20, lineHeight: 26, fontVariant: ['tabular-nums'] },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerIconButton: { minWidth: 44, height: 44, paddingHorizontal: 9, flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#E7EBDD' },
  historyLabel: { color: '#294124', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10 },
  headerExit: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#CDD3C4', borderRadius: 10 },
  roundBadge: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 6, backgroundColor: '#E5DDCB', borderWidth: 1, borderColor: '#BAB7A7' },
  roundBadgeText: { color: '#20251F', fontSize: 9, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 0.8 },
  closeButton: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: palette.line, alignItems: 'center', justifyContent: 'center' },
  closeButtonText: { color: palette.ink, fontSize: 23, lineHeight: 25, fontFamily: 'PlusJakartaSans_400Regular', marginTop: -2 },
  scroll: { flex: 1 },
  gameScrollContent: { paddingTop: 8, paddingBottom: 8, alignItems: 'center' },
  turnRibbon: { width: '100%', minHeight: 36, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  turnLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  turnDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#8E9B8E' },
  turnDotActive: { backgroundColor: palette.brassLight },
  turnText: { color: '#555E53', fontSize: 10, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 1.2 },
  turnTextActive: { color: palette.red },
  turnMeta: { color: '#555E53', fontSize: 9, fontFamily: 'PlusJakartaSans_700Bold', letterSpacing: 0.6 },
  tableWrap: { paddingTop: 4, paddingBottom: 0, width: '100%', alignItems: 'center' },
  handSection: { width: '100%', paddingHorizontal: 20, paddingTop: 7, alignItems: 'center' },
  handTitleRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  handTitle: { color: '#20251F', fontSize: 9, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 1.5 },
  handHelp: { color: '#555E53', fontSize: 8, fontFamily: 'PlusJakartaSans_700Bold', letterSpacing: 1.1 },
  handRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 13 },
  betweenMark: { width: 36, alignItems: 'center', gap: 3 },
  betweenLine: { width: 1, height: 17, backgroundColor: '#9C8B67' },
  betweenWord: { color: '#A82D27', fontSize: 7, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 0.7 },
  oddsRow: { width: '100%', height: 28, marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  oddsMeter: { width: 54, height: 4, borderRadius: 2, overflow: 'hidden', backgroundColor: '#D4CDBD' },
  oddsFill: { height: 4, borderRadius: 2, backgroundColor: palette.brassLight },
  oddsText: { color: '#20251F', fontSize: 10, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  oddsDivider: { width: 1, height: 13, backgroundColor: palette.line, marginHorizontal: 1 },
  oddsSubtext: { color: '#555E53', fontSize: 9, fontFamily: 'PlusJakartaSans_600SemiBold' },
  noHand: { width: '100%', paddingHorizontal: 22, paddingVertical: 24, alignItems: 'center' },
  noHandTitle: { color: palette.ink, fontSize: 18, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  noHandText: { fontFamily: 'PlusJakartaSans_400Regular', marginTop: 6, color: '#555E53', fontSize: 12, lineHeight: 18, textAlign: 'center', maxWidth: 330 },
  latestBet: { width: '100%', paddingHorizontal: 20, paddingTop: 9, flexDirection: 'row', alignItems: 'center', gap: 9 },
  latestIcon: { width: 27, height: 27, borderRadius: 14, borderColor: '#7D8B7D', borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  latestIconWin: { backgroundColor: '#315640', borderColor: '#8DB798' },
  latestIconText: { color: palette.ink, fontSize: 14, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  latestCopy: { flex: 1 },
  latestLabel: { color: '#555E53', fontSize: 7, lineHeight: 10, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 1.3 },
  latestText: { color: '#20251F', fontSize: 10, lineHeight: 15, fontFamily: 'PlusJakartaSans_600SemiBold' },
  betHistory: { width: '100%', paddingHorizontal: 20, paddingTop: 12 },
  betHistoryHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 6 },
  historyCount: { color: '#555E53', fontSize: 7, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 1 },
  betHistoryRow: { paddingVertical: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.darkLine },
  betHistoryTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  betHistoryName: { color: palette.ink, fontSize: 10, fontFamily: 'PlusJakartaSans_800ExtraBold', minWidth: 44 },
  betHistoryOutcome: { color: '#555E53', fontSize: 7, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 0.9, flex: 1 },
  betHistoryWon: { color: palette.success },
  betHistoryAmount: { color: '#A82D27', fontSize: 9, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  betHistoryCards: { color: '#343B34', fontSize: 10, lineHeight: 15, fontFamily: 'PlusJakartaSans_700Bold', fontVariant: ['tabular-nums'], letterSpacing: 0.2 },
  actionDock: { borderTopWidth: 1, borderTopColor: palette.darkLine, backgroundColor: '#EDE6D7', paddingTop: 10, paddingHorizontal: 18, paddingBottom: 10 },
  stakeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  stakeLabel: { color: '#20251F', fontSize: 9, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 1.35 },
  stakeLimit: { color: '#555E53', fontSize: 8, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 0.8, marginTop: 2 },
  stakeSelector: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  smallStep: { width: 34, height: 32, borderRadius: 9, borderWidth: 1, borderColor: '#AAA996', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5EFE4' },
  smallStepText: { color: palette.ink, fontSize: 18, lineHeight: 20, fontFamily: 'PlusJakartaSans_700Bold', marginTop: -1 },
  stepDisabled: { opacity: 0.38 },
  stepTextDisabled: { color: '#9BA69A' },
  stakeValue: { minWidth: 50, textAlign: 'center', color: palette.ink, fontSize: 20, lineHeight: 24, fontFamily: 'PlusJakartaSans_800ExtraBold', fontVariant: ['tabular-nums'] },
  actionHint: { fontFamily: 'PlusJakartaSans_400Regular', color: '#A82D27', fontSize: 9, lineHeight: 12, marginTop: -2, marginBottom: 6 },
  actionButtons: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  buttonShell: { flex: 1 },
  buttonShellCompact: { flex: 0 },
  button: { minHeight: 48, borderRadius: 6, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  buttonPressed: { opacity: 0.84, transform: [{ scale: 0.985 }] },
  buttonPrimary: { backgroundColor: palette.red },
  buttonDanger: { backgroundColor: '#73342D' },
  buttonQuiet: { borderWidth: 1, borderColor: '#343B34', backgroundColor: 'rgba(241,234,218,0.03)' },
  buttonDisabled: { backgroundColor: '#354139', borderColor: '#4C5A4F', opacity: 0.63 },
  buttonPrimaryText: { flex: 1, textAlign: 'center', color: '#FFF8E9', fontSize: 13, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 0.25 },
  buttonQuietText: { flex: 1, textAlign: 'center', color: '#20251F', fontSize: 13, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 0.25 },
  buttonDisabledText: { color: '#A7B0A7' },
  buttonArrow: { position: 'absolute', right: 13, top: 13 },
  buttonArrowText: { color: '#FFF2DA', fontSize: 14, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  buttonCompact: { minHeight: 38, paddingHorizontal: 14, minWidth: 90 },
  buttonCompactText: { fontFamily: 'PlusJakartaSans_400Regular', flex: 0, fontSize: 11 },
  waitDock: { minHeight: 91, paddingVertical: 15, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: palette.darkLine, backgroundColor: '#EDE6D7', justifyContent: 'center' },
  waitCopy: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  waitTextBlock: { flex: 1 },
  waitTitle: { color: palette.ink, fontSize: 13, lineHeight: 18, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  waitSubtext: { fontFamily: 'PlusJakartaSans_400Regular', color: '#555E53', fontSize: 10, lineHeight: 15, marginTop: 2 },
  waitBars: { flexDirection: 'row', gap: 4, paddingLeft: 27, paddingTop: 10 },
  waitBar: { flex: 1, height: 2, borderRadius: 1, backgroundColor: '#405144' },
  waitBarActive: { flex: 1.4, height: 2, borderRadius: 1, backgroundColor: palette.brass },
  resultDock: { paddingTop: 11, paddingHorizontal: 18, paddingBottom: 10, borderTopWidth: 1, borderTopColor: palette.darkLine, backgroundColor: '#EDE6D7' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
  resultCopy: { flex: 1 },
  resultEyebrow: { color: palette.red, fontSize: 8, lineHeight: 12, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 1.45 },
  resultTitle: { marginTop: 2, color: palette.ink, fontSize: 13, lineHeight: 18, fontFamily: 'PlayfairDisplay_700Bold', maxWidth: 430 },
  resultPot: { alignItems: 'flex-end' },
  resultPotLabel: { color: '#555E53', fontSize: 7, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 1.2 },
  resultPotValue: { fontVariant: ['tabular-nums'], color: palette.ink, fontSize: 17, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  resultButtons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  closeLink: { paddingHorizontal: 6, paddingVertical: 10 },
  closeLinkText: { color: '#555E53', fontSize: 10, fontFamily: 'PlusJakartaSans_700Bold' },
  confirmDock: { paddingVertical: 14, paddingHorizontal: 18, borderTopWidth: 1, borderTopColor: palette.darkLine, backgroundColor: '#EDE6D7' },
  confirmCopy: { marginBottom: 10 },
  confirmTitle: { color: palette.ink, fontSize: 14, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  confirmBody: { fontFamily: 'PlusJakartaSans_400Regular', color: '#555E53', fontSize: 10, marginTop: 3 },
  confirmButtons: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 9 },
  setupContent: { paddingTop: 18, paddingBottom: 18, alignItems: 'center' },
  setupCopy: { width: '100%', paddingHorizontal: 22, paddingTop: 9, paddingBottom: 12 },
  eyebrow: { flexDirection: 'row', alignItems: 'center' },
  eyebrowText: { color: '#555E53', fontSize: 8, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 1.3 },
  eyebrowDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.red, marginRight: 7 },
  heroTitle: { color: palette.ink, fontSize: 42, lineHeight: 44, letterSpacing: -1.6, fontFamily: 'PlayfairDisplay_900Black', marginTop: 15 },
  heroBody: { fontFamily: 'PlusJakartaSans_400Regular', maxWidth: 340, color: '#555E53', fontSize: 13, lineHeight: 20, marginTop: 8 },
  previewWrap: { width: '100%', alignItems: 'center', paddingHorizontal: 16, marginTop: 1 },
  setupControls: { width: '100%', paddingHorizontal: 20, paddingTop: 7 },
  selectorHeader: { minHeight: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: palette.darkLine, paddingVertical: 9 },
  selectorTitle: { color: palette.ink, fontSize: 14, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  selectorSubtitle: { fontFamily: 'PlusJakartaSans_400Regular', color: '#555E53', fontSize: 10, marginTop: 3 },
  countSelector: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  countValue: { color: palette.ink, width: 25, textAlign: 'center', fontSize: 23, fontFamily: 'PlusJakartaSans_800ExtraBold', fontVariant: ['tabular-nums'] },
  setupRule: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 13, paddingBottom: 4 },
  ruleMark: { color: palette.red, fontSize: 18, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  ruleText: { color: '#485149', fontSize: 10, lineHeight: 15, fontFamily: 'PlusJakartaSans_600SemiBold', flex: 1 },
  setupFooter: { borderTopWidth: 1, borderTopColor: palette.darkLine, paddingTop: 12, paddingHorizontal: 20, paddingBottom: 10, backgroundColor: '#EDE6D7' },
  footnote: { fontFamily: 'PlusJakartaSans_400Regular', color: '#555E53', fontSize: 8, lineHeight: 12, textAlign: 'center', marginTop: 8 },
  awaitingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, gap: 14 },
  awaitingMark: { width: 70, height: 70, borderRadius: 35, borderColor: palette.brass, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  awaitingMarkText: { color: palette.red, fontSize: 27, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  awaitingTitle: { color: palette.ink, fontSize: 30, fontFamily: 'PlayfairDisplay_900Black', letterSpacing: -0.9, textAlign: 'center' },
  awaitingBody: { fontFamily: 'PlusJakartaSans_400Regular', color: '#4F6046', fontSize: 13, lineHeight: 20, maxWidth: 360, textAlign: 'center', marginBottom: 8 },
  summaryScreen: { flex: 1, alignItems: 'center', paddingHorizontal: 22, paddingTop: 22 },
  summaryMark: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.red, transform: [{ rotate: '-4deg' }] },
  summaryMarkText: { color: palette.ink, fontSize: 32, lineHeight: 38, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: -3 },
  summaryEyebrow: { color: palette.red, fontSize: 8, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 1.5, marginTop: 18 },
  summaryTitle: { color: palette.ink, fontSize: 34, lineHeight: 38, fontFamily: 'PlayfairDisplay_900Black', letterSpacing: -1.1, marginTop: 7 },
  summaryBody: { fontFamily: 'PlusJakartaSans_400Regular', color: '#555E53', fontSize: 12, marginTop: 4 },
  summaryScoreboard: { width: '100%', marginTop: 24, borderTopWidth: 1, borderTopColor: palette.darkLine },
  scoreRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: palette.darkLine, gap: 12 },
  scoreRank: { width: 24, color: '#555E53', fontSize: 9, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  scoreName: { flex: 1, color: palette.ink, fontSize: 12, fontFamily: 'PlusJakartaSans_700Bold' },
  scoreBalance: { fontVariant: ['tabular-nums'], color: '#20251F', fontSize: 12, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  scoreChip: { fontFamily: 'PlusJakartaSans_400Regular', color: palette.red, fontSize: 8 },
  summaryFooter: { width: '100%', marginTop: 'auto', paddingBottom: 16 },
});
