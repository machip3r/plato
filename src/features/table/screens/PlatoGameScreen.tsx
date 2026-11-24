import { palette } from '../../../ui/theme';
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
import { TableSetup } from '../components/TableSetup';
import { TableButton } from '../components/TableButton';
import { AwaitingHost, MatchSummary } from '../components/MatchStates';
import { randomTableSize } from '../utils/tableSetup';
import { formatChips } from '../utils/formatChips';

export default function PlatoGameScreen() {
  const { width, height } = useWindowDimensions();
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const { getNextRoundAt, watching, resumeWatching, joinQueued, requestJoin, leaveTable, queuedAction, queueNotice, cancelQueuedAction, match: committedMatch, presentation, finishPresentation, startMatch, pass, bet, nextRound, closeMatch } = useLocalMatch(confirmLeave || confirmClose);
  const match = presentation?.type === 'deal' ? presentation.next : committedMatch;
  const [tableSize, setTableSize] = useState(() => randomTableSize());
  const [showHistory, setShowHistory] = useState(false);
  const preferences = useTablePreferences();
  const [showSettings, setShowSettings] = useState(false);
  const [guide, setGuide] = useState<'first' | 'help'>();
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
      <StatusBar barStyle={match ? 'light-content' : 'dark-content'} />
      <View style={[styles.shell, { maxWidth: width > 760 ? 640 : 620 }]}>
        <TableHeader
          historyAction={match ? () => setShowHistory(true) : undefined}
          label={gameLabel}
          roundNumber={match?.roundNumber}
          settingsAction={() => setShowSettings(true)}
          leaveAction={watching && match && match.status !== 'closed' ? () => setConfirmLeave(true) : undefined}
        />

        {!match ? (
          <TableSetup
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
          <MatchSummary match={match} replay={startNewMatch} />
        ) : match.status === 'awaiting_host' ? (
          <AwaitingHost match={match} close={requestClose} leave={() => setConfirmLeave(true)} join={requestJoin} />
        ) : round ? (
          <View style={{ flex: 1 }}>
            <ImmersiveTable key={match.roundNumber} match={match} queuedAction={queuedAction} queueNotice={queueNotice} cancelQueuedAction={cancelQueuedAction} presentation={presentation} completePresentation={finishPresentation} join={requestJoin} joinQueued={joinQueued} getNextRoundAt={getNextRoundAt} pass={pass} bet={bet} next={nextRound} />

          </View>
        ) : null}
        {confirmLeave && match && <LeaveTableDialog match={match} cancel={() => setConfirmLeave(false)} busy={Boolean(presentation)} closeForEveryone={() => { setConfirmLeave(false); requestClose(); }} confirm={(hostId, stay) => { if (leaveTable(hostId, stay)) setConfirmLeave(false); }} />}
        {confirmClose && <CloseMatchDialog cancel={() => setConfirmClose(false)} confirm={finishClose} />}
        {showHistory && match && <ActionHistory match={match} close={() => setShowHistory(false)} />}
        {showSettings && <TableSettings close={() => setShowSettings(false)} showGuide={() => { setShowSettings(false); setGuide('help'); }} />}
        {guide && <FirstRoundGuide firstTime={guide === 'first'} close={finishGuide} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  shell: { width: '100%', alignSelf: 'center', flex: 1, backgroundColor: '#FFFFFF' },
  awaitingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, gap: 14 },
  awaitingTitle: { color: palette.ink, fontSize: 30, fontFamily: 'PlayfairDisplay_900Black', letterSpacing: -0.9, textAlign: 'center' },
  awaitingBody: { fontFamily: 'PlusJakartaSans_400Regular', color: '#4F6046', fontSize: 13, lineHeight: 20, maxWidth: 360, textAlign: 'center', marginBottom: 8 },
});
