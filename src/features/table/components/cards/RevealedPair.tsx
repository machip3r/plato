import { useEffect, useState } from 'react';
import { Animated } from 'react-native';
import type { Card } from '../../../../game';
import { CardFan } from './CardFan';
import { CardBack } from './PlayingCard';

export function RevealedPair({ first, second, third, outcome, width, reducedMotion }: { first: Card; second: Card; third?: Card; outcome?: 'win' | 'loss'; width: number; reducedMotion: boolean }) {
  const [flip] = useState(() => new Animated.Value(1));
  const [open, setOpen] = useState(reducedMotion);
  useEffect(() => {
    if (reducedMotion) return;
    let alive = true;
    Animated.timing(flip, { toValue: 0.01, duration: 190, useNativeDriver: true }).start(() => {
      if (!alive) return;
      setOpen(true);
      Animated.timing(flip, { toValue: 1, duration: 240, useNativeDriver: true }).start();
    });
    return () => { alive = false; flip.stopAnimation(); };
  }, [flip, reducedMotion]);
  return <Animated.View style={{ flexDirection: 'row', gap: 4, transform: [{ scaleX: flip }] }}>
    {open ? <CardFan first={first} second={second} third={third} outcome={outcome} width={width} /> : <><CardBack width={width} /><CardBack width={width} /></>}
  </Animated.View>;
}

