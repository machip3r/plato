import type { Card, Hand, Player } from './model';

export const REQUIRED_ANTE = 1;

export function handMustPass(hand: Hand): boolean {
  return hand.first.value === hand.second.value;
}

export function isStrictlyBetween(first: Card, third: Card, second: Card): boolean {
  const lower = Math.min(first.value, second.value);
  const upper = Math.max(first.value, second.value);
  return lower < third.value && third.value < upper;
}

export function maxBetAmount(player: Player, pot: number): number {
  return Math.max(0, Math.min(player.balance, pot));
}

export function getTurnOrder(players: readonly Player[], dealerId: string): string[] {
  const seats = [...players].sort((a, b) => a.seat - b.seat);
  const dealerIndex = seats.findIndex((player) => player.id === dealerId);

  if (dealerIndex < 0) {
    throw new Error(`Dealer ${dealerId} is not seated at this table.`);
  }

  return getTurnOrderFromSeat(seats, dealerIndex, new Set(seats.map((player) => player.id)));
}

export function getTurnOrderForPlayers(
  seatedPlayers: readonly Player[],
  dealerId: string,
  participatingPlayerIds: readonly string[],
): string[] {
  const seats = [...seatedPlayers].sort((a, b) => a.seat - b.seat);
  const dealerIndex = seats.findIndex((player) => player.id === dealerId);

  if (dealerIndex < 0) {
    throw new Error(`Dealer ${dealerId} is not seated at this table.`);
  }

  return getTurnOrderFromSeat(seats, dealerIndex, new Set(participatingPlayerIds));
}

export function getNextDealerId(players: readonly Player[], dealerId: string): string {
  const seats = [...players].sort((a, b) => a.seat - b.seat);
  const dealerIndex = seats.findIndex((player) => player.id === dealerId);

  if (dealerIndex < 0 || seats.length === 0) {
    throw new Error(`Dealer ${dealerId} is not seated at this table.`);
  }

  return seats[(dealerIndex + 1) % seats.length].id;
}

export function chooseInitialDealer(players: readonly Player[], random: () => number = Math.random): string {
  if (players.length === 0) throw new Error('Cannot choose a dealer without players.');
  const index = Math.min(players.length - 1, Math.floor(random() * players.length));
  return players[index].id;
}

function getTurnOrderFromSeat(
  seats: readonly Player[],
  dealerIndex: number,
  participatingIds: ReadonlySet<string>,
): string[] {
  return Array.from({ length: seats.length }, (_, offset) => seats[(dealerIndex + offset + 1) % seats.length])
    .filter((player) => participatingIds.has(player.id))
    .map((player) => player.id);
}
