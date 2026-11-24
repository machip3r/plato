import { useRef, useState, type ComponentRef } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { LocalMatch } from '../../../../game';

export function LeaveTableDialog({ match, cancel, confirm, busy = false, closeForEveryone }: { match: LocalMatch; cancel: () => void; confirm: (hostId: string, stay: boolean) => void; busy?: boolean; closeForEveryone?: () => void }) {
  const candidates = match.players.filter(player => player.id !== 'human' && !player.spectating);
  const isHost = (match.hostId ?? 'human') === 'human';
  const [hostId, setHostId] = useState(isHost ? candidates[0]?.id : match.hostId);
  const [stay, setStay] = useState(true);
  const safeAction = useRef<ComponentRef<typeof View>>(null);
  return <Modal transparent animationType="fade" onRequestClose={cancel} onShow={() => safeAction.current?.focus()}>
    <View style={s.scrim}>
      <Pressable style={StyleSheet.absoluteFill} onPress={cancel} accessibilityRole="button" accessibilityLabel="Seguir en la mesa" />
      <View style={s.dialog} accessibilityViewIsModal onAccessibilityEscape={cancel}>
        <ScrollView contentContainerStyle={s.content}>
          <Text accessibilityRole="header" style={s.title}>Salir de la mesa</Text>
          <Text style={s.body}>{match.round?.status === 'in_progress' ? 'Tu turno pendiente se pasará. La ficha de esta ronda ya está aportada; no pagarás las siguientes. Conservas el resto de tu saldo.' : 'Dejas de recibir cartas y de aportar fichas. Conservas tu saldo y podrás volver en una próxima ronda.'}</Text>
          {isHost && <><Text style={s.label}>Nuevo anfitrión</Text><View style={s.choices}>{candidates.map(player => <Pressable key={player.id} accessibilityRole="radio" accessibilityState={{ checked: hostId === player.id }} onPress={() => setHostId(player.id)} style={[s.choice, hostId === player.id && s.selected]}><Text style={s.choiceText}>{player.name}</Text><Text style={s.choiceText}>{hostId === player.id ? '●' : '○'}</Text></Pressable>)}</View></>}
          <Text style={s.label}>Después de salir</Text>
          {[{ value: true, label: 'Quedarme como espectador' }, { value: false, label: 'Salir de la pantalla de juego' }].map(option => <Pressable key={String(option.value)} accessibilityRole="radio" accessibilityState={{ checked: stay === option.value }} onPress={() => setStay(option.value)} style={[s.choice, stay === option.value && s.selected]}><Text style={s.choiceText}>{option.label}</Text><Text style={s.choiceText}>{stay === option.value ? '●' : '○'}</Text></Pressable>)}
          {candidates.length < 2 && <Text style={s.body}>La mesa esperará: hace falta otro participante para repartir.</Text>}
          <View style={s.actions}><Pressable ref={safeAction} onPress={cancel} style={s.cancel} accessibilityRole="button"><Text style={s.choiceText}>Cancelar</Text></Pressable><Pressable disabled={!hostId || busy} onPress={() => hostId && confirm(hostId, stay)} style={[s.confirm, (!hostId || busy) && { opacity: 0.5 }]} accessibilityRole="button"><Text style={s.choiceText}>{busy ? 'Esperando cartas…' : 'Salir de la mesa'}</Text></Pressable></View>
          {isHost && closeForEveryone && <Pressable disabled={busy} onPress={closeForEveryone} accessibilityRole="button" style={s.closeEveryone}><Text style={s.closeEveryoneText}>Cerrar la mesa para todos</Text></Pressable>}
        </ScrollView>
      </View>
    </View>
  </Modal>;
}
const s = StyleSheet.create({
  scrim: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 22, backgroundColor: 'rgba(9,24,8,0.65)' },
  dialog: { width: '100%', maxWidth: 440, maxHeight: '90%', backgroundColor: '#FAF7EE', borderRadius: 18, overflow: 'hidden' },
  content: { padding: 24, gap: 9 },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, color: '#20331B' },
  body: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, lineHeight: 19, color: '#4E5E45', marginVertical: 5 },
  label: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 13, color: '#24381B', marginTop: 12, marginBottom: 2 },
  choices: { gap: 6 },
  choice: { minHeight: 46, paddingHorizontal: 13, paddingVertical: 12, borderRadius: 9, borderWidth: 1, borderColor: '#C7CEBC', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  selected: { borderColor: '#617A47', backgroundColor: '#E1E8D6' },
  choiceText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: '#24381B', flexShrink: 1 },
  closeEveryone: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  closeEveryoneText: { color: '#973C30', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 11 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancel: { flex: 1, minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 9, borderWidth: 1, borderColor: '#7E8D70' },
  confirm: { flex: 1, minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: '#F2CB6B' },
});
