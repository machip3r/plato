import { StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import type { HeaderGlassProps } from './HeaderGlass.types';

export function HeaderGlass({ blurTarget }: HeaderGlassProps) {
  return <BlurView pointerEvents="none" blurTarget={blurTarget} blurMethod="dimezisBlurViewSdk31Plus" blurReductionFactor={2} tint="light" intensity={100} style={StyleSheet.absoluteFill} />;
}
