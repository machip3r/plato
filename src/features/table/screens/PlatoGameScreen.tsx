import { palette } from '../../../ui/theme';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalMatch } from '../hooks/useLocalMatch';
import { CloseMatchDialog } from '../components/dialogs/CloseMatchDialog';
import { LeaveTableDialog } from '../components/dialogs/LeaveTableDialog';
import { ActionHistory } from '../components/ActionHistory';
import { ImmersiveTable } from '../components/table/ImmersiveTable';
import { FirstRoundGuide, TableSettings } from '../components/help/TableHelp';
import { useTablePreferences } from '../hooks/useTablePreferences';
import { updateTablePreferences } from '../preferences/tablePreferences';
import { TableHeader } from '../components/TableHeader';
import { TableMenu } from '../components/TableMenu';
import { TableButton } from '../components/TableButton';
import { AwaitingHost } from '../components/MatchStates';
import { MatchSummary } from '../components/MatchSummary';
import { randomTableSize } from '../utils/tableSetup';
import { formatChips } from '../utils/formatChips';

export default function PlatoGameScreen() {
  const { width, height } = useWindowDimensions();
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmHome, setConfirmHome] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { getNextRoundAt, watching, resumeWatching, joinQueued, requestJoin, leaveTable, queuedAction, queueNotice, cancelQueuedAction, match: committedMatch, presentation, finishPresentation, startMatch, pass, bet, nextRound, closeMatch } = useLocalMatch(confirmLeave || confirmClose || confirmHome);
  const match = presentation?.type === 'deal' ? presentation.next : committedMatch;
  const [tableSize, setTableSize] = useState(() => randomTableSize());
  const [showHistory, setShowHistory] = useState(false);
  const preferences = useTablePreferences();
  const [showSettings, setShowSettings] = useState(false);
  const [guide, setGuide] = useState<'first' | 'help'>();
  const round = match?.round;
  const atMenu = !match || (match.status === 'closed' && showMenu);
  const requestHome = () => {
    if (match) setConfirmHome(true);
    else router.replace('/');
  };
  const returnToMenu = () => { setTableSize(randomTableSize(tableSize)); setShowMenu(true); };

  const gameLabel = useMemo(() => {
    if (!match || match.status === 'closed') return 'CON BOTS';
    return match.status === 'awaiting_host' ? 'EN ESPERA' : `LOCAL · ${match.players.length - 1} BOTS`;
  }, [match]);

  const startNewMatch = () => {
    setConfirmClose(false);
    setConfirmLeave(false);
    const count = !atMenu && match ? randomTableSize(tableSize) : tableSize;
    setShowMenu(false);
    setTableSize(count);
    startMatch(count - 1);
  };

  const requestClose = () => setConfirmClose(true);
  const requestStart = () => {
    if (!preferences.ready) return;
    if (!preferences.guideSeen) setGuide('first');
    else startNewMatch();
  };
  const finishGuide = () => {
    const startAfterGuide = guide === 'first';
    updateTablePreferences({ guideSeen: true });
    setGuide(undefined);
    if (startAfterGuide) startNewMatch();
  };
  const finishClose = () => {
    setConfirmClose(false);
    closeMatch();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.shell, { maxWidth: width > 760 ? 640 : 620 }, (atMenu || (watching && match?.status === 'closed')) && styles.menuShell]}>
        <TableHeader immersive
          homeAction={requestHome}
          historyAction={match ? () => setShowHistory(true) : undefined}
          label={gameLabel}
          roundNumber={atMenu ? undefined : match?.roundNumber}
          settingsAction={() => setShowSettings(true)}
          leaveAction={watching && match && match.status !== 'closed' ? () => setConfirmLeave(true) : undefined}
        />

        {atMenu ? (
          <TableMenu
            tableSize={tableSize}
            setTableSize={setTableSize}
            start={requestStart}
            ready={preferences.ready}
            width={width}
            height={height}
          />
        ) : !watching ? (
          <View style={styles.awaitingScreen}><Text style={styles.awaitingTitle}>Saliste de la mesa.</Text><Text style={[styles.awaitingBody, { color: '#4F6046' }]}>{match.players.find(player => player.id === match.hostId)?.name} es el anfitrión. Conservas tus {formatChips(match.players.find(player => player.id === 'human')!.balance)} fichas.</Text><TableButton title="Volver a mirar" onPress={resumeWatching} variant="primary" standalone /><TableButton title="Nueva partida" onPress={startNewMatch} variant="quiet" standalone /></View>
        ) : match.status === 'closed' ? (
          <MatchSummary match={match} replay={startNewMatch} menu={returnToMenu} />
        ) : match.status === 'awaiting_host' ? (
          <AwaitingHost match={match} close={requestClose} leave={() => setConfirmLeave(true)} join={requestJoin} />
        ) : round ? (
          <View style={{ flex: 1 }}>
            <ImmersiveTable key={match.roundNumber} match={match} queuedAction={queuedAction} queueNotice={queueNotice} cancelQueuedAction={cancelQueuedAction} presentation={presentation} completePresentation={finishPresentation} join={requestJoin} joinQueued={joinQueued} getNextRoundAt={getNextRoundAt} pass={pass} bet={bet} next={nextRound} />

          </View>
        ) : null}
        {confirmLeave && match && <LeaveTableDialog match={match} cancel={() => setConfirmLeave(false)} busy={Boolean(presentation)} closeForEveryone={() => { setConfirmLeave(false); requestClose(); }} confirm={(hostId, stay) => { if (leaveTable(hostId, stay)) setConfirmLeave(false); }} />}
        {confirmHome && <CloseMatchDialog title="¿Volver al inicio?" description={match?.status === 'closed' ? 'Al volver al inicio se descartará el historial de esta partida local. No podrás recuperarlo.' : 'Se cerrará esta partida local. Su progreso y su historial se perderán y no podrás reanudarla.'} cancelLabel={match?.status === 'closed' ? 'Quedarme aquí' : 'Seguir jugando'} confirmLabel="Volver al inicio" cancel={() => setConfirmHome(false)} confirm={() => router.replace('/')} />}
        {confirmClose && <CloseMatchDialog cancel={() => setConfirmClose(false)} confirm={finishClose} />}
        {showHistory && match && <ActionHistory match={match} close={() => setShowHistory(false)} />}
        {showSettings && <TableSettings close={() => setShowSettings(false)} showGuide={() => { setShowSettings(false); setGuide('help'); }} />}
        {guide && <FirstRoundGuide firstTime={guide === 'first'} close={finishGuide} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#12391B' },
  shell: { width: '100%', alignSelf: 'center', flex: 1, backgroundColor: '#FFFFFF' },
  menuShell: { backgroundColor: '#12391B' },
  awaitingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, gap: 14 },
  awaitingTitle: { color: palette.ink, fontSize: 30, fontFamily: 'PlayfairDisplay_900Black', letterSpacing: -0.9, textAlign: 'center' },
  awaitingBody: { fontFamily: 'PlusJakartaSans_400Regular', color: '#4F6046', fontSize: 13, lineHeight: 20, maxWidth: 360, textAlign: 'center', marginBottom: 8 },
});
