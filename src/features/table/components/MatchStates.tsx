import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import type { LocalMatch } from '../../../game';
import { palette } from '../../../ui/theme';
import { TableButton } from './TableButton';
import { formatChips } from '../utils/formatChips';

export function AwaitingHost({ match, close, leave, join }: { match: LocalMatch; close: () => void; leave: () => void; join: () => void }) {
  return (
    <View style={styles.awaitingScreen}>
      <View style={styles.awaitingMark}><Text style={styles.awaitingMarkText}>Ⅱ</Text></View>
      <Text style={styles.awaitingTitle}>La mesa espera.</Text>
      <Text style={styles.awaitingBody}>Se necesitan dos jugadores con fichas para repartir. El Plato de {formatChips(match.pot)} permanece en la mesa; no hay recargas durante una partida.</Text>
      {match.players.find(player => player.id === 'human')?.spectating && match.players.find(player => player.id === 'human')!.balance > 0 && <TableButton title="Entrar a la ronda" onPress={join} variant="primary" standalone />}
      <TableButton title="Salir de la mesa" onPress={leave} variant="quiet" standalone />
      {(match.hostId ?? 'human') === 'human' && <TableButton title="Cerrar partida" onPress={close} variant="quiet" standalone />}
    </View>
  );
}

export function MatchSummary({ match, replay }: { match: LocalMatch; replay: () => void }) {
  const insets = useSafeAreaInsets();
  const leader = [...match.players].sort((a, b) => b.balance - a.balance)[0];
  return (
    <View style={styles.summaryScreen}>
      <Animated.View entering={FadeInUp.duration(480)}><View style={styles.summaryMark}><Text style={styles.summaryMarkText}>P</Text></View></Animated.View>
      <Text style={styles.summaryEyebrow}>MESA CERRADA · {match.roundNumber} RONDAS</Text>
      <Text style={styles.summaryTitle}>Buena partida.</Text>
      <Text style={styles.summaryBody}>{leader ? `${leader.name} termina con ${formatChips(leader.balance)} fichas.` : 'Gracias por jugar.'}</Text>
      <View style={styles.summaryScoreboard}>
        {[...match.players].sort((a, b) => b.balance - a.balance).map((player, index) => (
          <View key={player.id} style={styles.scoreRow}>
            <Text style={styles.scoreRank}>{String(index + 1).padStart(2, '0')}</Text>
            <Text style={styles.scoreName}>{player.name}</Text>
            <Text style={styles.scoreBalance}>{formatChips(player.balance)} <Text style={styles.scoreChip}>◆</Text></Text>
          </View>
        ))}
      </View>
      <View style={[styles.summaryFooter, { paddingBottom: 16 + insets.bottom }]}>
        <TableButton title="Jugar otra vez" onPress={replay} variant="primary" />
        <Text style={styles.footnote}>Nuevo saldo inicial: 1,000 fichas por jugador</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
