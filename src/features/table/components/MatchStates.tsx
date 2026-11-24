import { StyleSheet, Text, View } from 'react-native';
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

const styles = StyleSheet.create({
  awaitingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, gap: 14 },
  awaitingMark: { width: 70, height: 70, borderRadius: 35, borderColor: palette.brass, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  awaitingMarkText: { color: palette.red, fontSize: 27, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  awaitingTitle: { color: palette.ink, fontSize: 30, fontFamily: 'PlayfairDisplay_900Black', letterSpacing: -0.9, textAlign: 'center' },
  awaitingBody: { fontFamily: 'PlusJakartaSans_400Regular', color: '#4F6046', fontSize: 13, lineHeight: 20, maxWidth: 360, textAlign: 'center', marginBottom: 8 },
});
