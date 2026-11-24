import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { palette } from '../ui/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'No encontrado' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Esta mesa no existe.</Text>
        <Link href="/" style={styles.link}>Volver a PLATO</Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.ink, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: palette.paper, fontSize: 22, fontWeight: '800' },
  link: { marginTop: 12, color: palette.brassLight, fontSize: 14, fontWeight: '700' },
});
