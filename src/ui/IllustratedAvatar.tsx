import { StyleSheet, View } from 'react-native';

const LOOKS = [
  { back: '#B76B58', skin: '#E5B492', hair: '#302421', shirt: '#354D45' },
  { back: '#60806B', skin: '#D6A17D', hair: '#4B3225', shirt: '#8D3B32' },
  { back: '#A88453', skin: '#F0C8A7', hair: '#292527', shirt: '#3D5069' },
  { back: '#606E8E', skin: '#C88970', hair: '#3C2625', shirt: '#9B6E46' },
  { back: '#A77583', skin: '#EAC0A0', hair: '#372B29', shirt: '#496D62' },
  { back: '#588487', skin: '#C98E6B', hair: '#25292B', shirt: '#923E36' },
  { back: '#8E7455', skin: '#E1B495', hair: '#513722', shirt: '#485C81' },
  { back: '#9B5145', skin: '#D9A27F', hair: '#302729', shirt: '#456957' },
];

/** Small, original vector portraits built from native shapes for crisp mobile rendering. */
export function IllustratedAvatar({ variant = 0, size = 28 }: { variant?: number; size?: number }) {
  const look = LOOKS[variant % LOOKS.length];
  const hairStyle = variant % 4;
  const longHair = hairStyle === 1 || hairStyle === 3;
  const wearsGlasses = variant === 2 || variant === 5;

  return (
    <View
      style={[styles.portrait, { width: size, height: size, borderRadius: size / 2, backgroundColor: look.back, borderColor: '#E3D6B8' }]}
      accessibilityRole="image"
      accessibilityLabel="Retrato ilustrado de jugador"
    >
      {longHair && <View style={[styles.longHair, { backgroundColor: look.hair, width: size * 0.72, height: size * 0.74, top: size * 0.13 }]} />}
      <View style={[styles.shirt, { backgroundColor: look.shirt, width: size * 0.78, height: size * 0.43, bottom: -size * 0.12, left: size * 0.11, borderTopLeftRadius: size * 0.29, borderTopRightRadius: size * 0.29 }]} />
      <View style={[styles.neck, { backgroundColor: look.skin, width: size * 0.2, height: size * 0.2, left: size * 0.4, top: size * 0.55 }]} />
      <View style={[styles.ear, { backgroundColor: look.skin, left: size * 0.2, top: size * 0.37, width: size * 0.17, height: size * 0.19 }]} />
      <View style={[styles.ear, { backgroundColor: look.skin, right: size * 0.2, top: size * 0.37, width: size * 0.17, height: size * 0.19 }]} />
      <View style={[styles.face, { backgroundColor: look.skin, width: size * 0.49, height: size * 0.56, left: size * 0.255, top: size * 0.22, borderRadius: size * 0.25 }]} />
      <View style={[styles.hairCap, { backgroundColor: look.hair, width: size * (hairStyle === 2 ? 0.68 : 0.74), height: size * (hairStyle === 2 ? 0.28 : 0.24), left: size * (hairStyle === 2 ? 0.16 : 0.13), top: size * (hairStyle === 0 ? 0.07 : 0.045), borderRadius: size * 0.2 }]} />
      {hairStyle === 2 && (
        <>
          <View style={[styles.curl, { backgroundColor: look.hair, left: size * 0.18, top: size * 0.12, width: size * 0.25, height: size * 0.25, borderRadius: size / 2 }]} />
          <View style={[styles.curl, { backgroundColor: look.hair, right: size * 0.18, top: size * 0.12, width: size * 0.25, height: size * 0.25, borderRadius: size / 2 }]} />
        </>
      )}
      <View style={[styles.eye, { left: size * 0.39, top: size * 0.47 }]} />
      <View style={[styles.eye, { right: size * 0.39, top: size * 0.47 }]} />
      <View style={[styles.mouth, { left: size * 0.44, top: size * 0.61, width: size * 0.12 }]} />
      {wearsGlasses && (
        <View style={[styles.glassesBridge, { left: size * 0.42, top: size * 0.48, width: size * 0.16 }]} />
      )}
      <View style={styles.rim} />
    </View>
  );
}

const styles = StyleSheet.create({
  portrait: { overflow: 'hidden', position: 'relative', borderWidth: 1.25, alignItems: 'center' },
  shirt: { position: 'absolute' },
  neck: { position: 'absolute', borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
  ear: { position: 'absolute', borderRadius: 8 },
  face: { position: 'absolute' },
  longHair: { position: 'absolute', left: '14%', borderRadius: 12 },
  hairCap: { position: 'absolute' },
  curl: { position: 'absolute' },
  eye: { position: 'absolute', width: 1.7, height: 1.7, borderRadius: 1, backgroundColor: '#2B2420' },
  mouth: { position: 'absolute', height: 1.2, borderRadius: 2, backgroundColor: '#8B5148' },
  glassesBridge: { position: 'absolute', height: 1.2, backgroundColor: '#2B2420' },
  rim: { ...StyleSheet.absoluteFill, borderWidth: 0.7, borderColor: 'rgba(255,248,229,0.24)', borderRadius: 100 },
});
