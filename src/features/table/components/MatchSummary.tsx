import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { LocalMatch } from '../../../game';
import { STARTING_BALANCE } from '../../../game/model';
import { IllustratedAvatar } from '../../../ui/IllustratedAvatar';
import { TableSurface } from './table/TableSurface';
import { formatChips } from '../utils/formatChips';

type Props = { match: LocalMatch; replay: () => void; menu: () => void };

export function MatchSummary({ match, replay, menu }: Props) {
  const insets = useSafeAreaInsets();
  const ranked = [...match.players].sort((a, b) => b.balance - a.balance);
  return <TableSurface>
    <ScrollView style={s.scroll} contentContainerStyle={s.content}>
      <View style={s.heading}>
        <Text style={s.closed}>MESA CERRADA</Text>
        <Text accessibilityRole="header" style={s.title}>Buena partida.</Text>
        <Text style={s.rounds}>{match.roundNumber} {match.roundNumber === 1 ? 'ronda jugada' : 'rondas jugadas'}</Text>
      </View>
      <View style={s.scoreHeading}><Text style={s.column}>JUGADOR</Text><Text style={s.column}>SALDO FINAL</Text></View>
      <View>
        {ranked.map((player, index) => {
          const net = player.balance - STARTING_BALANCE;
          return <View key={player.id} style={[s.row, player.kind === 'human' && s.humanRow]}>
            <Text style={[s.rank, index === 0 && s.first]}>{index + 1}</Text>
            <IllustratedAvatar variant={Math.max(0, match.players.findIndex(p => p.id === player.id))} size={32} />
            <Text numberOfLines={1} style={[s.name, player.kind === 'human' && s.first]}>{player.name}</Text>
            <View style={s.balance}><Text style={s.amount}>◆ {formatChips(player.balance)}</Text><Text accessibilityLabel={net === 0 ? 'Sin cambios en el saldo' : `${net < 0 ? 'Perdió' : 'Ganó'} ${formatChips(Math.abs(net))} ${Math.abs(net) === 1 ? 'ficha' : 'fichas'} en la partida`} style={[s.net, net < 0 && s.loss]}>{net === 0 ? 'Sin cambio' : `${net > 0 ? '+' : '−'}${formatChips(Math.abs(net))}`}</Text></View>
          </View>;
        })}
      </View>
      {match.pot > 0 && <Text style={s.pot}>Plato sin repartir: ◆ {formatChips(match.pot)}</Text>}
    </ScrollView>
    <View style={[s.footer, { paddingBottom: 18 + insets.bottom }]}>
      <Pressable accessibilityRole="button" onPress={menu} style={({ pressed }) => [s.primary, pressed && s.pressed]}><Text style={s.primaryText}>Volver al menú</Text><Text style={s.arrow}>↗</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={replay} style={({ pressed }) => [s.secondary, pressed && s.pressed]}><Text style={s.secondaryText}>Jugar otra partida</Text></Pressable>
      <Text style={s.note}>Historial disponible desde el menú.</Text>
    </View>
  </TableSurface>;
}
const s = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 30, paddingBottom: 18 },
  heading: { alignItems: 'center', gap: 10, marginBottom: 27 },
  closed: { color: '#E7CE95', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 9, letterSpacing: 1 },
  title: { color: '#FFF5D9', fontFamily: 'PlayfairDisplay_900Black', fontSize: 34, lineHeight: 42, letterSpacing: -0.8 },
  rounds: { color: '#D1DFCA', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, lineHeight: 20 },
  scoreHeading: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: 'rgba(235,203,130,0.32)' },
  column: { color: '#DDCE9F', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 9 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 61, gap: 10, borderBottomWidth: 1, borderColor: 'rgba(235,203,130,0.18)', paddingVertical: 9, paddingHorizontal: 5 },
  humanRow: { backgroundColor: 'rgba(244,211,107,0.08)' },
  rank: { width: 20, textAlign: 'center', color: '#C7D7BE', fontFamily: 'Oswald_700Bold', fontSize: 18 },
  first: { color: '#F4D36B' },
  name: { flex: 1, color: '#F1EEDC', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 },
  balance: { alignItems: 'flex-end', gap: 4 },
  amount: { color: '#FFF5D9', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 14, fontVariant: ['tabular-nums'] },
  net: { color: '#C6E5AE', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 10, fontVariant: ['tabular-nums'] },
  loss: { color: '#FFB6A4' },
  pot: { textAlign: 'center', color: '#E7CE95', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, lineHeight: 18, marginTop: 17 },
  footer: { paddingHorizontal: 24, paddingTop: 10, gap: 9 },
  primary: { minHeight: 52, borderRadius: 10, backgroundColor: '#F4D36B', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18 },
  primaryText: { color: '#193C22', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 14 },
  arrow: { color: '#193C22', fontSize: 24 },
  secondary: { minHeight: 46, borderRadius: 10, borderWidth: 1, borderColor: '#9AA979', alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: '#F5DB97', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 },
  note: { color: '#D1DFCA', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 9, lineHeight: 16, textAlign: 'center' },
  pressed: { opacity: 0.7 },
});
