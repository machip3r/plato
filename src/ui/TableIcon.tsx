import { Canvas, Path } from '@shopify/react-native-skia';

export function TableIcon({ name, color = '#294124' }: { name: 'history' | 'exit' | 'settings'; color?: string }) {
  const path = name === 'history'
    ? 'M4 9 A8 8 0 1 1 4 16 M4 4 L4 9 L9 9 M12 7 L12 12 L16 14'
    : name === 'exit' ? 'M10 4 L4 4 L4 20 L10 20 M10 12 L21 12 M17 8 L21 12 L17 16'
    : 'M4 6 L20 6 M4 12 L20 12 M4 18 L20 18 M8 3 L8 9 M16 9 L16 15 M10 15 L10 21';
  return <Canvas pointerEvents="none" style={{ width: 24, height: 24 }}><Path path={path} style="stroke" strokeWidth={1.8} strokeCap="round" strokeJoin="round" color={color} /></Canvas>;
}
