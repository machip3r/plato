import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { Player } from '../../../game';
import { BOT_NAMES } from '../../../game/match';
import { CasinoTable } from './table/CasinoTable';
import { palette } from '../../../ui/theme';
import { TableButton } from './TableButton';
import { randomTableSize } from '../utils/tableSetup';

export function TableSetup({ tableSize, setTableSize, start, ready, width, height }: { tableSize: number; setTableSize: (size: number) => void; start: () => void; ready: boolean; width: number; height: number }) {
  const insets = useSafeAreaInsets();
  const previewHeight = Math.max(260, Math.min(320, Math.round(height * 0.33)));
  const previewWidth = Math.min(width - 32, 600);
  return (
    <>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.setupContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(540)} style={styles.setupCopy}>
          <View style={styles.eyebrow}><View style={styles.eyebrowDot} /><Text style={styles.eyebrowText}>CASA DE JUEGO · PARTIDA LOCAL</Text></View>
          <Text style={styles.heroTitle}>La mesa{ '\n' }está lista.</Text>
          <Text style={styles.heroBody}>Una mano, un poco de suerte y un Plato que puede crecer ronda a ronda.</Text>
        </Animated.View>
        <View style={styles.previewWrap}>
          <CasinoTable
            players={previewPlayers(tableSize)}
            dealerId="preview-bot-1"
            activePlayerIds={previewPlayers(tableSize).map((player) => player.id)}
            pot={tableSize}
            width={Math.min(previewWidth, Math.max(280, 600))}
            height={previewHeight}
          />
        </View>
        <View style={styles.setupControls}>
          <View style={styles.selectorHeader}>
            <View>
              <Text style={styles.selectorTitle}>{tableSize - 1} bots en esta mesa</Text>
              <Text style={styles.selectorSubtitle}>Cantidad al azar para cada partida</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={() => setTableSize(randomTableSize(tableSize))} style={styles.roundBadge}><Text style={styles.roundBadgeText}>Otra mesa ↻</Text></Pressable>
          </View>
          <View style={styles.setupRule}>
            <Text style={styles.ruleMark}>↗</Text>
            <Text style={styles.ruleText}>Apuesta si la tercera carta cae entre tus dos cartas.</Text>
          </View>
        </View>
      </ScrollView>
      <View style={[styles.setupFooter, { paddingBottom: 10 + insets.bottom }]}>
        <TableButton title={ready ? 'Abrir la mesa' : 'Preparando la mesa…'} disabled={!ready} onPress={start} variant="primary" />
        <Text style={styles.footnote}>Sin cuenta · Sin dinero real · El saldo se reinicia en cada partida</Text>
      </View>
    </>
  );
}

function previewPlayers(count: number): Player[] {
  const names = BOT_NAMES;
  return [
    { id: 'human', name: 'Tú', seat: 0, balance: 1_000, kind: 'human' },
    ...names.slice(0, count - 1).map((name, index) => ({ id: `preview-bot-${index + 1}`, name, seat: index + 1, balance: 1_000, kind: 'bot' as const })),
  ];
}

const styles = StyleSheet.create({
  roundBadge: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 6, backgroundColor: '#E5DDCB', borderWidth: 1, borderColor: '#BAB7A7' },
  roundBadgeText: { color: '#20251F', fontSize: 9, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 0.8 },
  scroll: { flex: 1 },
  setupContent: { paddingTop: 18, paddingBottom: 18, alignItems: 'center' },
  setupCopy: { width: '100%', paddingHorizontal: 22, paddingTop: 9, paddingBottom: 12 },
  eyebrow: { flexDirection: 'row', alignItems: 'center' },
  eyebrowText: { color: '#555E53', fontSize: 8, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 1.3 },
  eyebrowDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.red, marginRight: 7 },
  heroTitle: { color: palette.ink, fontSize: 42, lineHeight: 44, letterSpacing: -1.6, fontFamily: 'PlayfairDisplay_900Black', marginTop: 15 },
  heroBody: { fontFamily: 'PlusJakartaSans_400Regular', maxWidth: 340, color: '#555E53', fontSize: 13, lineHeight: 20, marginTop: 8 },
  previewWrap: { width: '100%', alignItems: 'center', paddingHorizontal: 16, marginTop: 1 },
  setupControls: { width: '100%', paddingHorizontal: 20, paddingTop: 7 },
  selectorHeader: { minHeight: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: palette.darkLine, paddingVertical: 9 },
  selectorTitle: { color: palette.ink, fontSize: 14, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  selectorSubtitle: { fontFamily: 'PlusJakartaSans_400Regular', color: '#555E53', fontSize: 10, marginTop: 3 },
  setupRule: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 13, paddingBottom: 4 },
  ruleMark: { color: palette.red, fontSize: 18, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  ruleText: { color: '#485149', fontSize: 10, lineHeight: 15, fontFamily: 'PlusJakartaSans_600SemiBold', flex: 1 },
  setupFooter: { borderTopWidth: 1, borderTopColor: palette.darkLine, paddingTop: 12, paddingHorizontal: 20, paddingBottom: 10, backgroundColor: '#EDE6D7' },
  footnote: { fontFamily: 'PlusJakartaSans_400Regular', color: '#555E53', fontSize: 8, lineHeight: 12, textAlign: 'center', marginTop: 8 },
});
