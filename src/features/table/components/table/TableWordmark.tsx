import { Canvas, Group, Text as SkiaText, useFont } from '@shopify/react-native-skia';
import { StyleSheet, View } from 'react-native';
import { fontAssets } from '../../../../ui/fonts';

export function TableWordmark({ width, top }: { width: number; top: number }) {
  const font = useFont(fontAssets.PlayfairDisplay_700Bold, width * 0.20);
  return <View pointerEvents="none" style={[s.monogram, { top }]}><Canvas style={{ width, height: width * 0.48 }}>
    {font && 'PLATO'.split('').map((letter, index) => {
      const angle = (index - 2) * 0.19;
      const x = width / 2 + Math.sin(angle) * width * 0.95;
      const y = width * 0.99 - Math.cos(angle) * width * 0.78;
      const glyphWidth = font.measureText(letter).width;
      return <Group key={index} origin={{ x, y }} transform={[{ rotate: angle }]}><SkiaText text={letter} x={x - glyphWidth / 2} y={y} font={font} color="rgba(238,204,125,0.32)" /></Group>;
    })}
  </Canvas></View>;
}

const s = StyleSheet.create({
  monogram: { position: 'absolute', alignSelf: 'center' },
});
