import { CARD_VALUES, type Card, type Suit } from './model';

export const CARD_SUITS: readonly Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

/** Each draw is independent and sampled with replacement from 52 suit/value pairs. */
export function drawRandomCard(random: () => number = Math.random): Card {
  const valueIndex = Math.floor(random() * CARD_VALUES.length);
  const suitIndex = Math.floor(random() * CARD_SUITS.length);

  return {
    value: CARD_VALUES[valueIndex],
    suit: CARD_SUITS[suitIndex],
  };
}

export function drawCards(count: number, random: () => number = Math.random): Card[] {
  if (!Number.isInteger(count) || count < 0) {
    throw new Error('Card count must be a non-negative integer.');
  }

  return Array.from({ length: count }, () => drawRandomCard(random));
}
