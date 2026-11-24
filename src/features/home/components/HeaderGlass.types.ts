import type { ComponentRef, RefObject } from 'react';
import type { View } from 'react-native';

export type HeaderGlassProps = {
  blurTarget: RefObject<ComponentRef<typeof View> | null>;
};
