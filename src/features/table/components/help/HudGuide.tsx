import { Pressable, StyleSheet, Text } from 'react-native';

export function HudGuide({ guide, onClose, style }: { guide: 'chance' | 'balance' | 'turn'; onClose: () => void; style?: object }) {
  const copy = guide === 'chance'
    ? { title: 'Probabilidad de ganar', body: 'La probabilidad de que tu tercera carta caiga entre tus dos cartas y ganes la apuesta. Con 0% conviene pasar.' }
    : guide === 'balance'
      ? { title: 'Tu saldo', body: 'Fichas disponibles para apostar. Cada ronda cobra 1 ficha de entrada y no puedes apostar más que el Plato.' }
      : { title: 'Turno y tiempo', body: 'El número es tu posición en el orden de la ronda. En tu turno, el anillo cuenta los segundos que te quedan para decidir.' };
  return <Pressable accessibilityRole="button" accessibilityLabel="Cerrar guía" onPress={onClose} style={[s.hudGuideCard, style]}>
    <Text style={s.guideTitle}>{copy.title}</Text>
    <Text style={s.guideBody}>{copy.body}</Text>
    <Text style={s.guideHint}>Toca para cerrar</Text>
  </Pressable>;
}

const s = StyleSheet.create({
  hudGuideCard: { backgroundColor: 'rgba(18,57,27,0.94)', borderWidth: 1.5, borderColor: 'rgba(221,193,126,0.55)', borderRadius: 16, padding: 16, alignItems: 'center', gap: 4, shadowColor: '#061704', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 12, elevation: 7 },
  guideTitle: { color: '#FFF4CE', fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 16, textAlign: 'center' },
  guideBody: { color: '#F0EBD7', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, lineHeight: 19, textAlign: 'center' },
  guideHint: { color: '#9DB29A', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 9, marginTop: 4 },
});
