import { CARD_VALUES, type Card, type Hand, type Suit } from './model';

export const CARD_SUITS: readonly Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

const SUIT_RANK = new Map(CARD_SUITS.map((suit, index) => [suit, index] as const));

/** Dealt pairs read high to low; equal values break ties by suit (spades highest). */
export function orderedHand(first: Card, second: Card): Hand {
  const rank = (card: Card) => card.value * CARD_SUITS.length + (SUIT_RANK.get(card.suit) ?? 0);
  return rank(first) >= rank(second) ? { first, second } : { first: second, second: first };
}

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
