import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { homeColors as c } from '../theme';

type OnlineMode = 'private' | 'public';
export function PlayModes({ play }: { play: () => void }) {
  const [expanded, setExpanded] = useState<OnlineMode>();
  const compact = useWindowDimensions().width < 540;
  const toggle = (mode: OnlineMode) => setExpanded(current => current === mode ? undefined : mode);
  return <View style={s.section}>
    <View style={s.heading}><Text accessibilityRole="header" style={s.title}>{'Tu mesa.\nTu manera.'}</Text><Text style={s.intro}>Una partida rápida, tu grupo de siempre o gente por conocer.</Text></View>
    <Pressable accessibilityRole="button" accessibilityLabel="Jugar una partida con bots" onPress={play} style={({ pressed }) => [s.botRow, compact && s.botRowCompact, pressed && s.pressed]}>
      <Text style={[s.suit, { color: c.green }]}>♣</Text>
      <View style={[s.copy, compact && s.botCopyCompact]}><View style={s.nameRow}><Text style={s.modeName}>Con bots</Text><Text style={s.available}>YA PUEDES JUGAR</Text></View><Text style={s.description}>Siéntate, aprende la mesa y prueba tu suerte.</Text></View>
      <View style={[s.playButton, compact && s.playButtonCompact]}><Text style={s.playText}>Jugar con bots</Text><Text style={s.playArrow}>↗</Text></View>
    </Pressable>
    <View style={s.onlineRow}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: expanded === 'private' }} accessibilityLabel="Partidas privadas, próximamente. Ver detalles" onPress={() => toggle('private')} style={({ pressed }) => [s.onlineControl, compact && s.onlineCompact, pressed && s.pressed]}>
        <Text style={[s.suit, { color: '#B94E3F' }]}>♥</Text><View style={s.copy}><Text style={s.modeName}>Con tu gente</Text>{compact && <Text style={s.soon}>PRONTO</Text>}<Text style={s.description}>Una sala privada. Los tuyos tienen asiento.</Text></View>{!compact && <Text style={s.soon}>PRONTO</Text>}<Text style={s.expand}>{expanded === 'private' ? '−' : '+'}</Text>
      </Pressable>
      {expanded === 'private' && <View style={s.detail}><Text style={s.detailText}>Las salas privadas están en preparación. Podrás crear una mesa e invitar a tus amigos. Mientras tanto, juega con bots sin crear una cuenta.</Text></View>}
    </View>
    <View style={s.onlineRow}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: expanded === 'public' }} accessibilityLabel="Partidas públicas, próximamente. Ver detalles" onPress={() => toggle('public')} style={({ pressed }) => [s.onlineControl, compact && s.onlineCompact, pressed && s.pressed]}>
        <Text style={[s.suit, { color: c.green }]}>♠</Text><View style={s.copy}><Text style={s.modeName}>Mesa abierta</Text>{compact && <Text style={s.soon}>PRONTO</Text>}<Text style={s.description}>Entra a una partida pública y conoce rivales.</Text></View>{!compact && <Text style={s.soon}>PRONTO</Text>}<Text style={s.expand}>{expanded === 'public' ? '−' : '+'}</Text>
      </Pressable>
      {expanded === 'public' && <View style={s.detail}><Text style={s.detailText}>Las partidas públicas llegarán con el multijugador en línea. Aquí encontrarás mesas a las que podrás unirte; todavía no hay salas disponibles.</Text></View>}
    </View>
  </View>;
}
const s = StyleSheet.create({
  section: { width: '100%', maxWidth: 1120, alignSelf: 'center' },
  heading: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, marginBottom: 30 },
  title: { color: c.ink, fontFamily: 'PlayfairDisplay_900Black', fontSize: 45, lineHeight: 49, letterSpacing: -1.2 },
  intro: { color: '#3C5845', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14, lineHeight: 23, maxWidth: 280, paddingBottom: 4 },
  botRow: { flexDirection: 'row', alignItems: 'center', gap: 18, backgroundColor: c.yellow, borderRadius: 12, paddingHorizontal: 22, paddingVertical: 24, minHeight: 120, marginBottom: 12 },
  botRowCompact: { flexWrap: 'wrap', gap: 12, padding: 18 },
  botCopyCompact: { minWidth: 140 },
  suit: { fontSize: 42, width: 36, textAlign: 'center' },
  copy: { flex: 1, gap: 7 },
  nameRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  modeName: { color: c.ink, fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 20, letterSpacing: -0.4 },
  available: { color: '#274F30', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, letterSpacing: 0.2 },
  description: { color: '#3C5845', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 12, lineHeight: 20 },
  playButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 20, paddingHorizontal: 20, borderRadius: 7, backgroundColor: c.green },
  playButtonCompact: { width: '100%', justifyContent: 'space-between' },
  playText: { color: c.paper, fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 13 },
  playArrow: { color: c.lime, fontSize: 23 },
  onlineRow: { borderBottomWidth: 1, borderColor: '#BAC9A9' },
  onlineControl: { flexDirection: 'row', gap: 18, alignItems: 'center', paddingHorizontal: 22, paddingVertical: 24, minHeight: 116 },
  onlineCompact: { paddingHorizontal: 8, gap: 12 },
  soon: { color: '#526346', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, letterSpacing: 0.2 },
  expand: { color: c.green, fontSize: 24, width: 22, textAlign: 'center' },
  detail: { paddingLeft: 76, paddingRight: 24, paddingBottom: 24 },
  detailText: { fontFamily: 'PlusJakartaSans_400Regular', color: '#3C5845', fontSize: 13, lineHeight: 22, maxWidth: 650 },
  pressed: { opacity: 0.75 },
});
