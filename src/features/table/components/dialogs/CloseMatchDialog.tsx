import { useRef, type ComponentRef } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export function CloseMatchDialog({ cancel, confirm }: { cancel: () => void; confirm: () => void }) {
  const safeAction = useRef<ComponentRef<typeof View>>(null);
  return <Modal transparent animationType="fade" onRequestClose={cancel} onShow={() => safeAction.current?.focus()}>
    <View style={s.scrim}>
      <Pressable style={StyleSheet.absoluteFill} onPress={cancel} accessibilityLabel="Seguir jugando" accessibilityRole="button" />
      <View style={s.dialog} accessibilityViewIsModal>
        <Text accessibilityRole="header" style={s.title}>¿Cerrar esta partida?</Text>
        <Text style={s.body}>La mesa termina para todos. Podrás consultar el resultado y el historial, pero no reanudarla. Una nueva partida reinicia las fichas.</Text>
        <View style={s.actions}>
          <Pressable ref={safeAction} onPress={cancel} accessibilityRole="button" style={s.cancel}><Text style={s.cancelText}>Seguir jugando</Text></Pressable>
          <Pressable onPress={confirm} accessibilityRole="button" style={s.confirm}><Text style={s.confirmText}>Cerrar partida</Text></Pressable>
        </View>
      </View>
    </View>
  </Modal>;
}
const s = StyleSheet.create({
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(9,24,8,0.65)' },
  dialog: { width: '100%', maxWidth: 430, backgroundColor: '#FAF7EE', padding: 24, borderRadius: 18 },
  title: { color: '#182714', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 25 },
  body: { color: '#4F5F46', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, lineHeight: 21, marginTop: 12 },
  actions: { gap: 10, marginTop: 24 },
  cancel: { minHeight: 48, borderWidth: 1, borderColor: '#637457', borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  confirm: { minHeight: 48, backgroundColor: '#A43D31', borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: '#283D20', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 },
  confirmText: { color: '#FFFFFF', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 13 },
});
