import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { PlayingCard } from '../../table/components/cards/PlayingCard';
import { homeColors as c } from '../theme';

export function HowToPlay() {
  const { width } = useWindowDimensions();
  const wide = width >= 800;
  const cardWidth = width < 400 ? 66 : 82;
  return <View style={[s.section, wide && s.wide]}>
    <View style={[s.intro, wide && s.column]}><Text accessibilityRole="header" style={[s.title, width < 360 && { fontSize: 30, lineHeight: 36 }]}>{'Dos cartas dicen mucho.\nLa tercera lo decide.'}</Text><Text style={s.body}>La apuesta se gana si la nueva carta cae estrictamente entre tus dos valores. Si iguala uno de los extremos, pierdes.</Text><View style={s.example}><PlayingCard card={{ value: 3, suit: 'clubs' }} width={cardWidth} animate={false} /><Text style={s.between}>&lt;</Text><PlayingCard card={{ value: 7, suit: 'hearts' }} width={cardWidth} outcome="win" animate={false} /><Text style={s.between}>&lt;</Text><PlayingCard card={{ value: 11, suit: 'diamonds' }} width={cardWidth} animate={false} /></View><Text style={s.exampleCaption}>3 &lt; 7 &lt; J · Esta apuesta gana.</Text></View>
    <View style={[s.steps, wide && s.column]}>
      {[['1', 'Recibe tu par', 'Cada participante aporta una ficha al Plato y recibe dos cartas.'], ['2', 'Pasa o apuesta', 'Tú decides cuánto arriesgar, hasta el límite de tu saldo y del Plato.'], ['3', 'Descubre la tercera', 'La primera apuesta ganadora cierra la ronda. Si nadie acierta, el Plato sigue creciendo.']].map(([number, title, body]) => <View key={number} style={s.step}><Text style={s.number}>{number}</Text><View style={s.stepCopy}><Text style={s.stepTitle}>{title}</Text><Text style={s.stepBody}>{body}</Text></View></View>)}
    </View>
  </View>;
}
const s = StyleSheet.create({
  section: { maxWidth: 1120, alignSelf: 'center', width: '100%', gap: 42 },
  wide: { flexDirection: 'row', alignItems: 'center', gap: 80 },
  intro: { minWidth: 0 },
  column: { flex: 1 },
  title: { color: c.ink, fontFamily: 'PlayfairDisplay_900Black', fontSize: 36, lineHeight: 42, letterSpacing: -0.8 },
  body: { color: '#49614C', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, lineHeight: 22, marginTop: 20, maxWidth: 430 },
  example: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 30, paddingVertical: 10 },
  between: { color: '#526346', fontFamily: 'Oswald_700Bold', fontSize: 23 },
  exampleCaption: { color: '#49614C', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 11, marginTop: 12 },
  steps: { gap: 26 },
  step: { flexDirection: 'row', gap: 18 },
  number: { color: '#B94E3F', fontFamily: 'Oswald_700Bold', fontSize: 27, width: 24, lineHeight: 32 },
  stepCopy: { flex: 1, gap: 8 },
  stepTitle: { color: c.ink, fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 16 },
  stepBody: { color: '#49614C', fontFamily: 'PlusJakartaSans_400Regular', fontSize: 13, lineHeight: 22, maxWidth: 410 },
});
