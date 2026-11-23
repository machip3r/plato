import { Canvas, Path } from '@shopify/react-native-skia';

export function TableIcon({ name }: { name: 'history' | 'exit' }) {
  const path = name === 'history'
    ? 'M4 9 A8 8 0 1 1 4 16 M4 4 L4 9 L9 9 M12 7 L12 12 L16 14'
    : 'M10 4 L4 4 L4 20 L10 20 M10 12 L21 12 M17 8 L21 12 L17 16';
  return <Canvas pointerEvents="none" style={{ width: 24, height: 24 }}><Path path={path} style="stroke" strokeWidth={1.8} strokeCap="round" strokeJoin="round" color="#294124" /></Canvas>;
}
