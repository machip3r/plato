import { CARD_VALUES } from './model';
import type { Hand } from './model';

/** Exact chance to draw a winning rank from the infinite, uniform 1–13 shoe. */
export function winProbability(hand: Hand): number {
  const lower = Math.min(hand.first.value, hand.second.value);
  const upper = Math.max(hand.first.value, hand.second.value);
  const winningRanks = CARD_VALUES.filter((value) => value > lower && value < upper).length;

  return winningRanks / CARD_VALUES.length;
}
