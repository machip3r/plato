export const CARD_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 8;
export const STARTING_BALANCE = 1_000;

export type CardValue = (typeof CARD_VALUES)[number];
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export interface Card {
  value: CardValue;
  suit: Suit;
}

export interface Player {
  id: string;
  name: string;
  seat: number;
  balance: number;
  kind: 'human' | 'bot';
  spectating?: boolean;
}

export interface Hand {
  first: Card;
  second: Card;
}

export type BetOutcome = 'win' | 'loss';

export interface BetResolution {
  playerId: string;
  amount: number;
  hand: Hand;
  thirdCard: Card;
  outcome: BetOutcome;
  potAfter: number;
}

export type RoundStatus = 'in_progress' | 'won' | 'ended';

export interface RoundState {
  status: RoundStatus;
  dealerId: string;
  players: Player[];
  pot: number;
  turnOrder: string[];
  currentTurnIndex: number;
  actedPlayerIds: string[];
  hands: Record<string, Hand>;
  bets: BetResolution[];
  winnerId?: string;
}
