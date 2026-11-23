import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { LocalMatch } from '../game';
import { PlayingCard } from './PlayingCard';
import { IllustratedAvatar } from './IllustratedAvatar';

export function ActionHistory({ match, close }: { match: LocalMatch; close: () => void }) {
  const [selected, setSelected] = useState<string>();
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const rounds = [...new Set([match.roundNumber, ...match.history.map(event => event.round)])].filter(Boolean).sort((a, b) => b - a);
  const actions = match.history.filter(event => !selected || event.playerId === selected).slice().reverse();
  return <Modal transparent animationType="slide" onRequestClose={close}>
    <View style={s.scrim}>
      <View style={s.sheet} accessibilityViewIsModal>
        <View style={s.heading}><View><Text style={s.title}>Historial de la mesa</Text><Text style={s.subtitle}>La partida continúa mientras consultas.</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Cerrar historial" onPress={close} style={s.close}><Text style={s.closeText}>×</Text></Pressable></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filters} contentContainerStyle={{ gap: 7 }}>
          {[{ id: undefined, name: 'Todos' }, ...match.players].map(player => <Pressable accessibilityRole="button" accessibilityState={{ selected: selected === player.id }} key={player.id ?? 'all'} onPress={() => setSelected(player.id)} style={[s.filter, selected === player.id && s.filterActive]}><Text style={[s.filterText, selected === player.id && s.filterTextActive]}>{player.name}</Text></Pressable>)}
        </ScrollView>
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {rounds.map(number => {
            const open = expanded[number] ?? number === match.roundNumber;
            const roundActions = actions.filter(action => action.round === number);
            return <View key={number} style={s.roundSection}>
              <Pressable accessibilityRole="button" accessibilityLabel={`Ronda ${number}`} accessibilityState={{ expanded: open }} onPress={() => setExpanded(current => ({ ...current, [number]: !open }))} style={s.roundToggle}>
                <View><Text style={s.roundTitle}>Ronda {String(number).padStart(2, '0')}</Text><Text style={s.roundSummary}>{number === match.roundNumber ? 'Actual · ' : ''}{roundActions.length} acciones</Text></View><Text style={s.chevron}>{open ? '−' : '+'}</Text>
              </Pressable>
              {open && <View>{roundActions.length === 0 && <Text style={s.empty}>Sin acciones de este jugador en esta ronda.</Text>}{roundActions.map(action => {
            const name = match.players.find(player => player.id === action.playerId)?.name;
            const description = action.type === 'ante' ? 'Aportó la ficha de ronda' : action.type === 'pass' ? action.reason === 'timeout' ? 'Pasó por tiempo agotado' : 'Pasó su turno' : `Apostó ${action.bet?.amount} · ${action.bet?.outcome === 'win' ? 'acertó' : 'no acertó'}`;
            return <View key={action.id} style={s.row}>
              <View style={s.rowCopy}><Text style={s.round}>#{action.id}</Text>
              <View style={s.rowHeading}><View style={s.identity}><IllustratedAvatar variant={Math.max(0, match.players.findIndex(p => p.id === action.playerId))} size={28} /><Text style={s.name}>{name}</Text></View><Text style={[s.delta, action.delta < 0 && s.loss]}>{action.delta === 0 ? '—' : `${action.delta > 0 ? '+' : '−'}${Math.abs(action.delta)}`}</Text></View>
              <Text style={s.description}>{description}</Text>
              {action.type === 'ante' && <View style={s.contribution}><Text style={s.coin}>◆</Text><Text style={s.contributionText}>+1 al Plato</Text></View>}
              <Text style={s.balances}>Saldo {action.balanceAfter.toLocaleString('es-MX')} · Plato {action.potAfter.toLocaleString('es-MX')}</Text>
              </View>
              {action.bet && <View style={s.cards}>
                <PlayingCard card={action.bet.hand.first} width={32} animate={false} /><View style={[s.drawn, action.bet.outcome === 'win' ? s.drawnWin : s.drawnLoss]}><PlayingCard card={action.bet.thirdCard} width={34} animate={false} /></View>
                <PlayingCard card={action.bet.hand.second} width={32} animate={false} />
              </View>}

            </View>;
          })}</View>}
            </View>;
          })}
        </ScrollView>
      </View>
    </View>
  </Modal>;
}
const s = StyleSheet.create({
  roundSection: { marginBottom: 10 },
  roundToggle: { minHeight: 64, padding: 14, borderRadius: 10, backgroundColor: '#E8E8D9', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  roundTitle: { color: '#20351B', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 16 },
  roundSummary: { color: '#526149', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 10, marginTop: 4 },
  chevron: { color: '#32492A', fontSize: 26, paddingHorizontal: 8 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  cards: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 3, flexShrink: 0 },
  rowCopy: { flex: 1, minWidth: 0 },
  arrow: { fontSize: 18, color: '#69755A' },
  drawn: { borderWidth: 2, padding: 2, borderRadius: 6 },
  drawnWin: { borderColor: '#508948', backgroundColor: '#DFEDD5' },
  drawnLoss: { borderColor: '#B75B49', backgroundColor: '#F1DED4' },
  outcome: { color: '#2C6223', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 9, marginLeft: 3 },
  passRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginVertical: 10 },
  passText: { marginLeft: 9, color: '#647058', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 10 },
  contribution: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 8 },
  coin: { color: '#907529', fontSize: 16 },
  contributionText: { color: '#675A32', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10 },
  scrim: { flex: 1, backgroundColor: 'rgba(9,24,8,0.55)', justifyContent: 'flex-end', alignItems: 'center' },
  sheet: { width: '100%', maxWidth: 640, height: '82%', backgroundColor: '#FAF7EE', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 23, color: '#172315' },
  subtitle: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, color: '#53604C', marginTop: 6 },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: '#E7EBDD' },
  closeText: { fontSize: 26, color: '#24311D' },
  filters: { marginVertical: 18, flexGrow: 0, minHeight: 38 },
  filter: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18, backgroundColor: '#E8EBDC' },
  filterActive: { backgroundColor: '#245319' },
  filterText: { color: '#43513A', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11 },
  filterTextActive: { color: '#FFFFFF' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, borderTopWidth: 1, borderColor: '#D9DDCE' },
  round: { color: '#58664F', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 9, marginBottom: 5 },
  rowHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { color: '#182714', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 12, flexShrink: 1 },
  delta: { color: '#2E6624', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 13 },
  loss: { color: '#A1392F' },
  description: { color: '#25351E', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12, marginTop: 4 },
  balances: { color: '#596551', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, marginTop: 5, fontVariant: ['tabular-nums'] },
  empty: { color: '#596551', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, paddingVertical: 30 },
});
