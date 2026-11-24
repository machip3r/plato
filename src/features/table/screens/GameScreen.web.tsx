import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web/WithSkiaWeb';
import { StyleSheet, Text, View } from 'react-native';
import { palette } from '../../../ui/theme';

export default function GameScreen() {
  return (
    <WithSkiaWeb
      getComponent={() => import('./PlatoGameScreen')}
      opts={{ locateFile: (file) => `/${file}` }}
      fallback={(
        <View style={styles.loading}>
          <View style={styles.mark}><Text style={styles.markText}>P</Text></View>
          <Text style={styles.loadingText}>Preparando la mesa…</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, minHeight: 500, backgroundColor: palette.ink, alignItems: 'center', justifyContent: 'center', gap: 12 },
  mark: { width: 42, height: 42, backgroundColor: palette.red, alignItems: 'center', justifyContent: 'center' },
  markText: { color: palette.paper, fontSize: 24, fontFamily: 'PlusJakartaSans_800ExtraBold' },
  loadingText: { color: palette.paper, fontSize: 13, fontFamily: 'PlusJakartaSans_700Bold' },
});
