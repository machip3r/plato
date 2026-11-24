import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { MIN_PLAYERS, MAX_PLAYERS, STARTING_BALANCE } from '../../../game/model';
import { BOT_NAMES } from '../../../game/match';
import { IllustratedAvatar } from '../../../ui/IllustratedAvatar';
import { randomTableSize } from '../utils/tableSetup';
import { formatChips } from '../utils/formatChips';
import { TableSurface } from './table/TableSurface';

type Props = {
  tableSize: number;
  setTableSize: (size: number) => void;
  start: () => void;
  ready: boolean;
  width: number;
  height: number;
};

/** Match configuration belongs to the felt, with the same cast and colors as play. */
export function TableMenu({ tableSize, setTableSize, start, ready, width, height }: Props) {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const compact = height < 860 || width < 360;
  const columns = width >= 480 ? 4 : 3;
  const participants = [{ id: 'human', name: 'Tú', avatar: 0 }, ...BOT_NAMES.slice(0, tableSize - 1).map((name, index) => ({ id: name, name, avatar: index + 1 }))];
  const changeCount = (delta: number) => setTableSize(Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, tableSize + delta)));

  return <TableSurface>
    <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={[s.content, compact && s.contentCompact]}>
      <View style={s.heading}>
        <Text style={s.mode}>PARTIDA CON BOTS</Text>
        <Text accessibilityRole="header" style={[s.title, compact && s.titleCompact]}>Arma tu mesa.</Text>
        <Text style={s.body}>Elige cuántos bots se sientan contigo.</Text>
      </View>

      <View style={[s.counter, compact && { gap: 20 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Quitar un bot" disabled={tableSize === MIN_PLAYERS} onPress={() => changeCount(-1)} style={({ pressed }) => [s.step, tableSize === MIN_PLAYERS && s.disabled, pressed && s.pressed]}><Text style={s.stepText}>−</Text></Pressable>
        <View style={s.countCopy} accessibilityLiveRegion="polite" accessibilityLabel={`${tableSize - 1} ${tableSize === 2 ? 'bot' : 'bots'}, ${tableSize} participantes en total`}><Text style={[s.count, compact && s.countCompact]}>{tableSize - 1}</Text><Text style={s.countLabel}>{tableSize === 2 ? 'bot contigo' : 'bots contigo'}</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Añadir un bot" disabled={tableSize === MAX_PLAYERS} onPress={() => changeCount(1)} style={({ pressed }) => [s.step, tableSize === MAX_PLAYERS && s.disabled, pressed && s.pressed]}><Text style={s.stepText}>+</Text></Pressable>
      </View>

      <View style={s.rosterHeading}><Text style={s.rosterTitle}>{tableSize} asientos ocupados</Text><Pressable accessibilityRole="button" accessibilityLabel="Elegir una cantidad de bots al azar" onPress={() => setTableSize(randomTableSize(tableSize))} style={({ pressed }) => [s.random, pressed && s.pressed]}><Text style={s.randomText}>Al azar ↻</Text></Pressable></View>
      <View style={s.roster}>
        {participants.map(player => <Animated.View key={player.id} entering={reducedMotion ? undefined : FadeInDown.duration(220)} style={[s.seat, { width: `${100 / columns}%` }]}>
          <View style={[s.avatar, player.id === 'human' && s.humanAvatar]}><IllustratedAvatar variant={player.avatar} size={compact ? 37 : 43} /></View>
          <Text numberOfLines={1} style={[s.name, player.id === 'human' && s.humanName]}>{player.name}</Text>
        </Animated.View>)}
      </View>
      <View style={s.rules}><Text style={s.chips}>◆ {formatChips(STARTING_BALANCE)} fichas por jugador</Text><Text style={s.ruleNote}>1 ficha de entrada por ronda · Sin recargas</Text></View>
    </ScrollView>
    <View style={[s.footer, { paddingBottom: 18 + insets.bottom }]}>
      <Pressable accessibilityRole="button" disabled={!ready} onPress={start} style={({ pressed }) => [s.start, !ready && s.disabled, pressed && s.startPressed]}><Text style={s.startText}>{ready ? 'Repartir cartas' : 'Preparando…'}</Text><Text style={s.startArrow}>↗</Text></Pressable>
      <Text style={s.note}>Solo fichas virtuales. El reparto inicial es aleatorio.</Text>
    </View>
  </TableSurface>;
}
const s = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 26, paddingTop: 32, paddingBottom: 18, gap: 26 },
  contentCompact: { paddingHorizontal: 22, paddingTop: 24, gap: 20 },
  heading: { alignItems: 'center', gap: 9 },
  mode: { fontFamily: 'PlusJakartaSans_700Bold', color: '#E7CE95', fontSize: 9, letterSpacing: 1 },
  title: { fontFamily: 'PlayfairDisplay_900Black', color: '#FFF5D9', fontSize: 34, lineHeight: 42, letterSpacing: -0.8 },
  titleCompact: { fontSize: 29, lineHeight: 36 },
  body: { fontFamily: 'PlusJakartaSans_400Regular', color: '#D1DFCA', fontSize: 12, lineHeight: 20, textAlign: 'center' },
  counter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 30, paddingVertical: 4 },
  countCopy: { alignItems: 'center', minWidth: 100 },
  count: { fontFamily: 'Oswald_700Bold', color: '#F4D36B', fontSize: 64, lineHeight: 76 },
  countCompact: { fontSize: 53, lineHeight: 64 },
  countLabel: { fontFamily: 'PlusJakartaSans_600SemiBold', color: '#E6E7D0', fontSize: 12, lineHeight: 20 },
  step: { width: 52, height: 52, borderRadius: 26, borderWidth: 1, borderColor: '#A6AF7F', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(10,40,21,0.48)' },
  stepText: { color: '#F5DB97', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 25 },
  rosterHeading: { borderTopWidth: 1, borderColor: 'rgba(235,203,130,0.24)', paddingTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  rosterTitle: { fontFamily: 'PlusJakartaSans_700Bold', color: '#EAE9D4', fontSize: 11 },
  random: { minHeight: 44, paddingHorizontal: 8, justifyContent: 'center' },
  randomText: { fontFamily: 'PlusJakartaSans_700Bold', color: '#F4D36B', fontSize: 11 },
  roster: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', rowGap: 18 },
  seat: { alignItems: 'center', gap: 7, paddingHorizontal: 3 },
  avatar: { padding: 4, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(213,223,189,0.28)' },
  humanAvatar: { borderColor: '#F4D36B', backgroundColor: 'rgba(244,211,107,0.12)' },
  name: { color: '#E6E7D0', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 10, lineHeight: 16 },
  humanName: { color: '#F4D36B', fontFamily: 'PlusJakartaSans_800ExtraBold' },
  rules: { alignItems: 'center', gap: 6, paddingTop: 6 },
  chips: { color: '#F5DB97', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, textAlign: 'center' },
  ruleNote: { color: '#CDDDC6', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 10, lineHeight: 17, textAlign: 'center' },
  footer: { paddingHorizontal: 26, paddingTop: 12, gap: 10 },
  start: { backgroundColor: '#F4D36B', borderRadius: 10, minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  startText: { color: '#193C22', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 15 },
  startArrow: { color: '#193C22', fontSize: 25 },
  startPressed: { backgroundColor: '#E9C455', transform: [{ translateY: 1 }] },
  note: { color: '#D1DFCA', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 9, lineHeight: 16, textAlign: 'center' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.65 },
});
