import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { TableIcon } from '../../../ui/TableIcon';
import { palette } from '../../../ui/theme';

export function TableHeader({ label, roundNumber, leaveAction, historyAction, settingsAction, homeAction, immersive = false }: { label: string; roundNumber?: number; leaveAction?: () => void; historyAction?: () => void; settingsAction: () => void; homeAction?: () => void; immersive?: boolean }) {
  const { width } = useWindowDimensions();
  const playing = roundNumber !== undefined;
  const dark = playing || immersive;
  return <View style={[styles.header, dark && styles.gameHeader]}>
    <Pressable disabled={!homeAction} onPress={homeAction} accessibilityRole={homeAction ? 'button' : undefined} accessibilityLabel={homeAction ? 'Volver al inicio de PLATO' : undefined} style={[styles.brandLockup, homeAction && { minHeight: 44 }]}>
      {homeAction && !playing && <Text style={{ color: dark ? '#F0E7C8' : palette.ink, fontSize: 24 }}>‹</Text>}
      <View style={[styles.brandMark, playing && { width: 16, height: 16 }]}><View style={styles.brandMarkSlash} /></View>
      <View><Text style={[styles.brand, dark && styles.gameBrand, playing && width < 360 && { fontSize: 17 }]}>PLATO</Text>{!playing && <Text style={[styles.roomLabel, dark && { color: '#E3CE94' }]}>{label}</Text>}</View>
    </Pressable>
    {playing && <View pointerEvents="none" style={styles.headerCenter}><View style={styles.headerRound}><Text style={styles.headerRoundLabel}>RONDA</Text><Text style={styles.headerRoundNumber}>{String(roundNumber).padStart(2, '0')}</Text></View></View>}
    <View style={styles.headerRight}>
      <Pressable accessibilityRole="button" accessibilityLabel="Ajustes de sonido y vibración" onPress={settingsAction} style={({ pressed }) => [styles.headerIconButton, { minWidth: 44, height: 44 }, pressed && { opacity: 0.7 }]}><TableIcon name="settings" color={dark ? '#E7EBDD' : '#294124'} /></Pressable>
      {historyAction && <Pressable accessibilityRole="button" accessibilityLabel="Ver historial de acciones" onPress={historyAction} style={({ pressed }) => [styles.headerIconButton, pressed && { opacity: 0.7 }]}><TableIcon name="history" color="#E7EBDD" />{width >= 440 && <Text style={styles.historyLabel}>Historial</Text>}</Pressable>}
      {leaveAction && <Pressable onPress={leaveAction} style={({ pressed }) => [styles.headerExit, pressed && { opacity: 0.7 }]} accessibilityRole="button" accessibilityLabel="Salir de la partida" accessibilityHint="Elige un nuevo anfitrión si corresponde y decide si quieres observar."><TableIcon name="exit" color="#F2A096" /></Pressable>}
    </View>
  </View>;
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.darkLine,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandMark: { width: 20, height: 20, backgroundColor: palette.red, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  brandMarkSlash: { height: 26, width: 4, backgroundColor: '#FFFFFF', transform: [{ rotate: '38deg' }] },
  brand: { color: palette.ink, fontFamily: 'PlayfairDisplay_900Black', fontSize: 27, lineHeight: 32, letterSpacing: -0.8 },
  roomLabel: { color: '#555E53', fontSize: 7, lineHeight: 10, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 1.1 },
  gameHeader: { paddingHorizontal: 12, backgroundColor: '#12391B', borderBottomColor: 'rgba(221,193,126,0.35)' },
  gameBrand: { fontSize: 19, lineHeight: 25, letterSpacing: -0.4, color: '#F0E7C8' },
  headerCenter: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  headerRound: { minWidth: 46, alignItems: 'center', paddingVertical: 4 },
  headerRoundLabel: { color: '#E3CE94', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 7, letterSpacing: 0.6 },
  headerRoundNumber: { color: '#FFF7DC', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 16, lineHeight: 20, fontVariant: ['tabular-nums'] },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  headerIconButton: { minWidth: 38, height: 38, paddingHorizontal: 7, flexDirection: 'row', gap: 4, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: 'rgba(236,211,148,0.16)' },
  historyLabel: { color: '#F0EBD7', fontFamily: 'PlusJakartaSans_700Bold', fontSize: 9 },
  headerExit: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: palette.red, borderRadius: 9 },
});
