import { useRef, type ComponentRef, type ReactNode } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useTablePreferences } from '../../hooks/useTablePreferences';
import { updateTablePreferences } from '../../preferences/tablePreferences';
import { playCardCue } from '../../services/cardSounds';
import { playTableHaptic } from '../../services/tableHaptics';
import { PlayingCard } from '../cards/PlayingCard';

function HelpSheet({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  const closeButton = useRef<ComponentRef<typeof View>>(null);
  const didFocus = useRef(false);
  const focusClose = () => {
    if (!didFocus.current && closeButton.current) { closeButton.current.focus(); didFocus.current = true; }
  };
  return <Modal transparent animationType="fade" onRequestClose={close} onShow={() => closeButton.current?.focus()}>
    <View style={s.scrim}>
      <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Cerrar y volver a la mesa" onPress={close} />
      <View style={s.sheet} accessibilityViewIsModal onAccessibilityEscape={close}>
        <ScrollView contentContainerStyle={s.content}>
          <View style={s.heading}><Text accessibilityRole="header" style={s.title}>{title}</Text><Pressable ref={closeButton} onLayout={focusClose} accessibilityRole="button" accessibilityLabel="Cerrar" onPress={close} style={({ pressed }) => [s.close, pressed && s.pressed]}><Text style={s.closeText}>×</Text></Pressable></View>
          {children}
        </ScrollView>
      </View>
    </View>
  </Modal>;
}

export function TableSettings({ close, showGuide }: { close: () => void; showGuide: () => void }) {
  const preferences = useTablePreferences();
  return <HelpSheet title="Ajustes de la mesa" close={close}>
    <Text style={s.body}>Elige cómo sentir cada jugada.</Text>
    <View style={s.setting}><View style={s.copy}><Text nativeID="table-sound-label" style={s.label}>Sonido</Text><Text style={s.note}>Mezcla, reparto y cartas al descubierto.</Text></View><Switch accessibilityLabel="Sonido" disabled={!preferences.ready} value={preferences.sound} onValueChange={sound => { updateTablePreferences({ sound }); if (sound) playCardCue('deal'); }} trackColor={{ false: '#9BA58F', true: '#47703A' }} thumbColor="#FAF7EE" /></View>
    <View style={s.setting}><View style={s.copy}><Text style={s.label}>Vibración</Text><Text style={s.note}>Un toque breve al recibir tus cartas y confirmar una acción.</Text></View><Switch accessibilityLabel="Vibración" disabled={!preferences.ready} value={preferences.vibration} onValueChange={vibration => { updateTablePreferences({ vibration }); if (vibration) playTableHaptic('confirm'); }} trackColor={{ false: '#9BA58F', true: '#47703A' }} thumbColor="#FAF7EE" /></View>
    {Platform.OS === 'web' && <Text style={s.note}>La vibración depende del dispositivo y del navegador.</Text>}
    {preferences.storageError && <Text accessibilityRole="alert" style={s.error}>No pudimos guardar los ajustes. Se aplican durante esta sesión; vuelve a cambiarlos para intentar guardarlos.</Text>}
    <Pressable accessibilityRole="button" onPress={showGuide} style={({ pressed }) => [s.guideLink, pressed && s.pressed]}><Text style={s.linkText}>Cómo se gana una apuesta</Text><Text style={s.linkText}>↗</Text></Pressable>
    <Pressable accessibilityRole="button" onPress={close} style={({ pressed }) => [s.primary, pressed && s.pressed]}><Text style={s.primaryText}>Listo</Text></Pressable>
  </HelpSheet>;
}

export function FirstRoundGuide({ close, firstTime }: { close: () => void; firstTime: boolean }) {
  return <HelpSheet title={firstTime ? 'Tu primera mano' : 'Entre tus dos cartas'} close={close}>
    <Text style={s.body}>La tercera carta debe quedar <Text style={s.emphasis}>estrictamente entre estas dos</Text>.</Text>
    <View style={s.example} accessibilityLabel="Ejemplo: tus cartas son 3 y J, que vale 11. Recibes un 7: ganas porque 3 es menor que 7 y 7 es menor que 11.">
      <View style={s.cardColumn}><Text style={s.cardLabel}>TU CARTA</Text><PlayingCard card={{ value: 3, suit: 'clubs' }} width={68} animate={false} /></View>
      <View style={s.cardColumn}><Text style={[s.cardLabel, s.winText]}>RECIBES</Text><View style={s.winner}><PlayingCard card={{ value: 7, suit: 'hearts' }} width={68} animate={false} /></View></View>
      <View style={s.cardColumn}><Text style={s.cardLabel}>TU CARTA</Text><PlayingCard card={{ value: 11, suit: 'spades' }} width={68} animate={false} /></View>
    </View>
    <Text style={s.equation}>3 &lt; 7 &lt; J</Text>
    <Text style={s.explanation}>El 7 queda entre el 3 y la J (11): ganas la apuesta.</Text>
    <Text style={s.body}>Si sale 3 o J, también pierdes: igualar un extremo no cuenta. Puedes pasar si prefieres no apostar.</Text>
    <Pressable accessibilityRole="button" onPress={close} style={({ pressed }) => [s.primary, pressed && s.pressed]}><Text style={s.primaryText}>{firstTime ? 'Entendido, repartir' : 'Volver a la mesa'}</Text></Pressable>
    {firstTime && <Pressable accessibilityRole="button" onPress={close} style={({ pressed }) => [s.skip, pressed && s.pressed]}><Text style={s.note}>Ya sé jugar · Omitir guía</Text></Pressable>}
  </HelpSheet>;
}
const s = StyleSheet.create({
  scrim: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'rgba(9,24,8,0.7)' },
  sheet: { width: '100%', maxWidth: 440, maxHeight: '90%', borderRadius: 18, backgroundColor: '#FAF7EE', overflow: 'hidden' },
  content: { padding: 22, gap: 16 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'space-between' },
  title: { flex: 1, fontFamily: 'PlayfairDisplay_700Bold', fontSize: 25, color: '#20331B' },
  close: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E7EBDD' },
  closeText: { color: '#24381B', fontSize: 26 },
  body: { fontFamily: 'PlusJakartaSans_400Regular', color: '#45583D', fontSize: 13, lineHeight: 21 },
  emphasis: { fontFamily: 'PlusJakartaSans_800ExtraBold', color: '#20331B' },
  setting: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#D9DDCE' },
  copy: { flex: 1, gap: 5 },
  label: { fontFamily: 'PlusJakartaSans_800ExtraBold', color: '#24381B', fontSize: 15 },
  note: { fontFamily: 'PlusJakartaSans_400Regular', color: '#526149', fontSize: 12, lineHeight: 18 },
  error: { fontFamily: 'PlusJakartaSans_600SemiBold', color: '#973C30', fontSize: 12, lineHeight: 18 },
  guideLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48, gap: 10 },
  linkText: { fontFamily: 'PlusJakartaSans_700Bold', color: '#294C23', fontSize: 13, flexShrink: 1 },
  primary: { minHeight: 50, borderRadius: 9, backgroundColor: '#F2CB6B', alignItems: 'center', justifyContent: 'center', padding: 12 },
  primaryText: { fontFamily: 'PlusJakartaSans_800ExtraBold', color: '#24381B', fontSize: 14 },
  example: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: 12, paddingTop: 8 },
  cardColumn: { alignItems: 'center', gap: 10 },
  cardLabel: { fontFamily: 'PlusJakartaSans_700Bold', color: '#526149', fontSize: 9 },
  winner: { borderWidth: 2, borderRadius: 8, borderColor: '#47703A', padding: 3 },
  winText: { color: '#2D6428' },
  equation: { fontFamily: 'Oswald_700Bold', color: '#2D6428', fontSize: 27, textAlign: 'center' },
  explanation: { fontFamily: 'PlusJakartaSans_700Bold', color: '#294C23', fontSize: 12, textAlign: 'center', lineHeight: 19 },
  skip: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7 },
});
