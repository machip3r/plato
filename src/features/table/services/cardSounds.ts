/*
 Tiny cue player for the table's card-handling sounds.
 Each stage bundles several recorded takes; playback picks one at random
 (never repeating the previous take) to keep the table feeling alive.
 Players are created lazily per take and reused; audio is decorative, so
 every failure is swallowed instead of interrupting the game.
 */
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';
import { getTablePreferences, subscribeTablePreferences } from '../preferences/tablePreferences';

export type CardCue = 'shuffle' | 'deal' | 'reveal';

const variants: Record<CardCue, number[]> = {
  shuffle: [
    require('../../../../assets/sounds/shuffle-1.m4a'),
    require('../../../../assets/sounds/shuffle-2.m4a'),
    require('../../../../assets/sounds/shuffle-3.m4a'),
    require('../../../../assets/sounds/shuffle-4.m4a'),
  ],
  deal: [
    require('../../../../assets/sounds/deal-1.m4a'),
    require('../../../../assets/sounds/deal-2.m4a'),
    require('../../../../assets/sounds/deal-3.m4a'),
    require('../../../../assets/sounds/deal-4.m4a'),
  ],
  reveal: [
    require('../../../../assets/sounds/reveal-1.m4a'),
    require('../../../../assets/sounds/reveal-2.m4a'),
    require('../../../../assets/sounds/reveal-3.m4a'),
    require('../../../../assets/sounds/reveal-4.m4a'),
  ],
};

const players = new Map<string, AudioPlayer>();
const lastTake: Partial<Record<CardCue, number>> = {};
const fades = new Map<string, ReturnType<typeof setTimeout>[]>();
let modeConfigured = false;

// Preload every take eagerly: on web, playing a just-created element before
// its source loads is silent, so the first use of each take must exist early.
for (const [cue, takes] of Object.entries(variants) as [CardCue, number[]][]) {
  takes.forEach((source, index) => {
    try { players.set(`${cue}:${index}`, createAudioPlayer(source)); } catch { /* decorative */ }
  });
}

function clearFade(key: string) {
  const pending = fades.get(key);
  if (pending) { pending.forEach(clearTimeout); fades.delete(key); }
}

function pickTake(cue: CardCue): number {
  const count = variants[cue].length;
  if (count <= 1) return 0;
  let index = Math.floor(Math.random() * count);
  if (index === lastTake[cue]) index = (index + 1 + Math.floor(Math.random() * (count - 1))) % count;
  lastTake[cue] = index;
  return index;
}

function playerFor(cue: CardCue, index: number): AudioPlayer | undefined {
  try {
    const key = `${cue}:${index}`;
    let player = players.get(key);
    if (!player) {
      player = createAudioPlayer(variants[cue][index]);
      players.set(key, player);
    }
    return player;
  } catch {
    return undefined;
  }
}

/** Replay a random card-cue take; safe to call from timers and animation callbacks. */
export function playCardCue(cue: CardCue, volume = 0.55) {
  const preferences = getTablePreferences();
  if (!preferences.ready || !preferences.sound) return;
  try {
    if (!modeConfigured) {
      modeConfigured = true;
      // SFX should stay audible with the ringer switch on silent (iOS).
      void setAudioModeAsync({ playsInSilentMode: Platform.OS !== 'web' }).catch(() => undefined);
    }
    const index = pickTake(cue);
    clearFade(`${cue}:${index}`);
    const player = playerFor(cue, index);
    if (!player) return;
    player.volume = Math.max(0, Math.min(1, volume));
    void player.seekTo(0).catch(() => undefined);
    player.play();
  } catch {
    // Audio is decorative; never break the choreography over it.
  }
}

// Muting also stops takes that were already playing, including scheduled fades.
subscribeTablePreferences(() => {
  if (!getTablePreferences().sound) {
    (Object.keys(variants) as CardCue[]).forEach(cue => stopCardCue(cue, 0));
  }
});

/** Fade every take of a stage to silence and pause them, keeping stage boundaries clean. */
export function stopCardCue(cue: CardCue, fadeMs = 140) {
  try {
    for (const [key, player] of players) {
      if (!key.startsWith(`${cue}:`)) continue;
      clearFade(key);
      if (fadeMs <= 0) { player.pause(); continue; }
      const from = player.volume;
      const steps = 4;
      const timers: ReturnType<typeof setTimeout>[] = [];
      for (let step = 1; step <= steps; step++) {
        timers.push(setTimeout(() => {
          try {
            player.volume = Math.max(0, from * (1 - step / steps));
            if (step === steps) { player.pause(); fades.delete(key); }
          } catch { /* decorative */ }
        }, (fadeMs / steps) * step));
      }
      fades.set(key, timers);
    }
  } catch {
    // Audio is decorative; never break the choreography over it.
  }
}
