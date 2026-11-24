import { Pressable, StyleSheet, Text, View } from 'react-native';
import { IllustratedAvatar } from '../../../../ui/IllustratedAvatar';
import type { LocalMatch } from '../../../../game';

/** Tap-target guide card explaining a player's current standing. */
export function PlayerGuideCard({ match, playerId, onClose, style }: { match: LocalMatch; playerId: string; onClose: () => void; style?: object }) {
  const player = match.players.find(p => p.id === playerId);
  if (!player) return null;
  const round = match.round;
  const wager = round?.bets.find(b => b.playerId === playerId);
  const didPass = Boolean(round?.actedPlayerIds.includes(playerId) && !wager);
  const order = round?.turnOrder.includes(playerId) ? round.turnOrder.indexOf(playerId) + 1 : 0;
  const waiting = Boolean(round && order > 0 && round.currentTurnIndex < round.turnOrder.indexOf(playerId));
  const state = wager ? `Apostó ${wager.amount} ${wager.amount === 1 ? 'ficha' : 'fichas'}` : didPass ? 'Pasó su turno' : waiting ? 'Esperando su turno' : round ? 'Decidiendo…' : 'Fuera de la ronda';
  return <Pressable accessibilityRole="button" accessibilityLabel={`Cerrar guía de ${player.name}`} onPress={onClose} style={[s.card, style]}>
    <View style={s.identity}>
      <IllustratedAvatar variant={Math.max(0, match.players.findIndex(p => p.id === playerId))} size={34} />
      <View style={s.copy}>
        <Text style={s.name}>{player.name}</Text>
        <Text style={s.role}>{player.kind === 'human' ? 'Jugador humano' : 'Bot agresivo · entra temprano y arriesga'}</Text>
      </View>
    </View>
    <Text style={s.line}>Saldo <Text style={s.gold}>{player.balance.toLocaleString('es-MX')}</Text> fichas</Text>
    {order > 0 && <Text style={s.line}>Turno nº {order} · {state}</Text>}
    {match.hostId === playerId && <Text style={s.line}>Anfitrión de la mesa</Text>}
    {round?.dealerId === playerId && <Text style={s.line}>Reparte esta ronda</Text>}
    <Text style={s.hint}>Toca para cerrar</Text>
  </Pressable>;
}
const s = StyleSheet.create({
  card: { backgroundColor: 'rgba(18,57,27,0.94)', borderWidth: 1.5, borderColor: 'rgba(221,193,126,0.55)', borderRadius: 16, padding: 16, alignItems: 'center', gap: 5, shadowColor: '#061704', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 12, elevation: 7 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 },
  copy: { alignItems: 'flex-start', flexShrink: 1 },
  name: { color: '#FFF4CE', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 17 },
  role: { color: '#E3CE94', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, marginTop: 1 },
  line: { color: '#F0EBD7', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 13, lineHeight: 18 },
  gold: { color: '#F2CB6B', fontFamily: 'PlusJakartaSans_800ExtraBold' },
  hint: { color: '#9DB29A', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 9, marginTop: 4 },
});
