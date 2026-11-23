import { Canvas, Circle, Line, RoundedRect } from '@shopify/react-native-skia';
import { StyleSheet, Text, View } from 'react-native';
import type { Player } from '../game';
import { IllustratedAvatar } from './IllustratedAvatar';
import { palette } from './theme';

interface CasinoTableProps {
  players: Player[];
  dealerId: string;
  currentTurnId?: string;
  activePlayerIds: string[];
  pot: number;
  width: number;
  height: number;
}

function money(value: number): string {
  return value.toLocaleString('es-MX');
}

function seatAngles(count: number): number[] {
  if (count === 1) return [270];
  if (count === 2) return [225, 315];
  if (count === 3) return [210, 270, 330];
  const spread = Math.min(274, 100 + (count - 3) * 38);
  const start = 270 - spread / 2;
  return Array.from({ length: count }, (_, index) => start + (spread * index) / (count - 1));
}

export function CasinoTable({
  players,
  dealerId,
  currentTurnId,
  activePlayerIds,
  pot,
  width,
  height,
}: CasinoTableProps) {
  const opponents = players.filter((player) => player.id !== 'human').sort((a, b) => a.seat - b.seat);
  const angles = seatAngles(opponents.length);
  const centerX = width / 2;
  const centerY = height / 2;
  const positions = opponents.map((player, index) => {
    const radians = (angles[index] * Math.PI) / 180;
    return {
      player,
      x: centerX + Math.cos(radians) * width * 0.355,
      y: centerY + Math.sin(radians) * height * 0.315,
    };
  });

  const outerHeight = height - 8;
  const innerHeight = height - 31;

  return (
    <View style={[styles.scene, { width, height }]}>
      <View style={[styles.redArc, { width: width * 0.26, height: width * 0.26 }]} />
      <View style={styles.mintBlock} />
      <Canvas style={{ width, height }} pointerEvents="none">
        <RoundedRect x={1} y={4} width={width - 2} height={outerHeight} r={outerHeight / 2} color="#141A17" />
        <RoundedRect x={4} y={7} width={width - 8} height={outerHeight - 6} r={(outerHeight - 6) / 2} color="#141A17" />
        <RoundedRect x={10} y={13} width={width - 20} height={height - 26} r={(height - 26) / 2} color="#E1D7C3" />
        <RoundedRect x={18} y={20} width={width - 36} height={innerHeight} r={innerHeight / 2} color="#EEE6D6" />
        <RoundedRect
          x={23}
          y={25}
          width={width - 46}
          height={innerHeight - 10}
          r={(innerHeight - 10) / 2}
          color="#C7BAA0"
          style="stroke"
          strokeWidth={1}
          opacity={0.35}
        />
        <Circle cx={centerX} cy={centerY + 5} r={width * 0.15} color="#D6CBB5" opacity={0.24} />
        <Line p1={{ x: centerX - width * 0.19, y: centerY + 48 }} p2={{ x: centerX + width * 0.19, y: centerY + 48 }} color="#141A17" strokeWidth={1} opacity={0.34} />
        <Line p1={{ x: centerX - width * 0.19, y: centerY + 66 }} p2={{ x: centerX + width * 0.19, y: centerY + 66 }} color="#141A17" strokeWidth={1} opacity={0.22} />
      </Canvas>

      <View style={styles.tableSignature}><Text style={styles.tableSignatureText}>PLATO · CLUB SOCIAL</Text></View>
      <View style={[styles.pot, { left: centerX - 73, top: centerY - 27 }]} pointerEvents="none">
        <Text style={styles.potLabel}>PLATO</Text>
        <Text style={styles.potValue}>{money(pot)}</Text>
        <Text style={styles.potUnit}>FICHAS</Text>
      </View>

      {positions.map(({ player, x, y }, index) => {
        const active = activePlayerIds.includes(player.id);
        const isTurn = currentTurnId === player.id;
        const isDealer = dealerId === player.id;
        return (
          <View
            key={player.id}
            style={[
              styles.seat,
              { left: x - 38, top: y - 20 },
              isTurn && styles.seatTurn,
              !active && styles.seatOut,
            ]}
            accessibilityLabel={`${player.name}, ${money(player.balance)} fichas${isDealer ? ', repartidor' : ''}${isTurn ? ', turno actual' : ''}`}
          >
            <View style={styles.avatarHolder}>
              <IllustratedAvatar variant={index} size={28} />
              {isDealer && <Text style={styles.dealerMark}>D</Text>}
            </View>
            <View style={styles.seatCopy}>
              <View style={styles.seatNameRow}>
                <Text numberOfLines={1} style={[styles.seatName, isTurn && styles.turnText]}>{player.name}</Text>
              </View>
              <Text style={styles.seatBalance}>{money(player.balance)} <Text style={styles.seatChip}>◆</Text></Text>
            </View>
          </View>
        );
      })}

      <View style={styles.humanSeat}>
        <View style={[styles.humanAvatar, currentTurnId === 'human' && styles.humanAvatarTurn]}>
          <IllustratedAvatar variant={7} size={28} />
          {dealerId === 'human' && <Text style={styles.humanDealerMark}>D</Text>}
        </View>
        <View>
          <Text style={styles.humanName}>TÚ</Text>
          <Text style={styles.humanBalance}>{money(players.find((player) => player.id === 'human')?.balance ?? 0)} <Text style={styles.seatChip}>◆</Text></Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  redArc: { position: 'absolute', left: 0, top: 0, backgroundColor: '#DF4938', borderBottomRightRadius: 150 },
  mintBlock: { position: 'absolute', right: 1, bottom: 12, width: 52, height: 88, backgroundColor: '#67AAA0', borderTopLeftRadius: 80 },
  tableSignature: { position: 'absolute', bottom: 77, alignSelf: 'center' },
  tableSignatureText: { fontSize: 7, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 1.6, color: '#68796C' },
  scene: { position: 'relative', alignSelf: 'center' },
  pot: {
    position: 'absolute',
    width: 146,
    alignItems: 'center',
    zIndex: 2,
  },
  potLabel: { color: '#262B24', fontSize: 9, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 2.1 },
  potValue: { fontVariant: ['tabular-nums'], color: palette.ink, fontSize: 38, lineHeight: 42, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: -0.6 },
  potUnit: { color: '#555E53', fontSize: 8, fontFamily: 'PlusJakartaSans_700Bold', letterSpacing: 1.6 },
  seat: {
    position: 'absolute',
    zIndex: 3,
    width: 76,
    minHeight: 42,
    paddingHorizontal: 5,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 12,
    backgroundColor: '#FAF5E9',
    borderColor: '#242C23',
    borderWidth: 1,
  },
  seatTurn: { borderColor: palette.red, borderWidth: 2, shadowColor: palette.brass, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.36, shadowRadius: 8, elevation: 5 },
  seatOut: { opacity: 0.46 },
  avatarHolder: { width: 28, height: 28, position: 'relative' },
  seatCopy: { flex: 1, minWidth: 0 },
  seatNameRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  seatName: { color: '#18201B', fontSize: 9, lineHeight: 12, fontFamily: 'PlusJakartaSans_800ExtraBold', flexShrink: 1 },
  turnText: { color: palette.red },
  dealerMark: { position: 'absolute', top: -3, right: -3, color: palette.ink, backgroundColor: palette.brassLight, borderRadius: 5, width: 11, height: 11, textAlign: 'center', fontSize: 7, lineHeight: 11, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  seatBalance: { fontVariant: ['tabular-nums'], color: '#424B40', fontSize: 9, lineHeight: 12, fontFamily: 'PlusJakartaSans_700Bold' },
  seatChip: { fontFamily: 'PlusJakartaSans_400Regular', color: palette.red, fontSize: 7 },
  humanSeat: { position: 'absolute', zIndex: 4, bottom: 18, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#F6D7B3', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  humanAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  humanAvatarTurn: { transform: [{ scale: 1.05 }] },
  humanDealerMark: { position: 'absolute', top: -4, right: -5, width: 11, height: 11, borderRadius: 6, textAlign: 'center', lineHeight: 11, backgroundColor: palette.brassLight, color: palette.ink, fontSize: 7, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  humanName: { color: palette.ink, fontSize: 9, lineHeight: 12, fontFamily: 'PlusJakartaSans_800ExtraBold', letterSpacing: 0.6 },
  humanBalance: { fontVariant: ['tabular-nums'], color: '#424B40', fontSize: 10, lineHeight: 12, fontFamily: 'PlusJakartaSans_700Bold' },
});
