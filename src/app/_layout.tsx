import { useFonts } from 'expo-font';
import { fontAssets } from '../ui/fonts';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';

export {
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const [loaded, error] = useFonts(fontAssets);
  if (error) throw error;
  if (!loaded) return <View style={{ flex: 1, backgroundColor: '#F3EEE3', alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color="#C33A31" accessibilityLabel="Cargando PLATO" /></View>;
  return <Stack screenOptions={{ headerShown: false }} />;
}
