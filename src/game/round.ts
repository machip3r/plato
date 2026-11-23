import {
  getNextDealerId,
  getTurnOrderForPlayers,
  isStrictlyBetween,
  maxBetAmount,
  REQUIRED_ANTE,
} from './rules';
import { MAX_PLAYERS, MIN_PLAYERS } from './model';
import type { BetResolution, Card, Hand, Player, RoundState } from './model';

export interface StartRoundInput {
  players: Player[];
  dealerId: string;
  potBeforeAnte: number;
  /** Sample two cards per player independently from the infinite shoe. */
  dealtCards: Card[];
}

export function startRound(input: StartRoundInput): RoundState {
  const orderedPlayers = [...input.players].sort((a, b) => a.seat - b.seat);
  const participants = orderedPlayers.filter((player) => !player.spectating && player.balance >= REQUIRED_ANTE);
  const requiredCards = participants.length * 2;

  if (orderedPlayers.length < MIN_PLAYERS || orderedPlayers.length > MAX_PLAYERS) {
    throw new Error(`A table must have between ${MIN_PLAYERS} and ${MAX_PLAYERS} players.`);
  }
  if (!Number.isInteger(input.potBeforeAnte) || input.potBeforeAnte < 0) {
    throw new Error('The pot must be a non-negative whole number.');
  }
  if (participants.length < MIN_PLAYERS) {
    throw new Error('At least two players must be able to pay the ante. Wait for the host to close or restart the match.');
  }
  if (input.dealtCards.length !== requiredCards) {
    throw new Error(`Expected ${requiredCards} dealt cards, received ${input.dealtCards.length}.`);
  }

  const hands: Record<string, Hand> = {};
  let cardIndex = 0;
  for (const player of participants) {
    hands[player.id] = {
      first: input.dealtCards[cardIndex],
      second: input.dealtCards[cardIndex + 1],
    };
    cardIndex += 2;
  }

  const playersAfterAnte = orderedPlayers.map((player) => ({
    ...player,
    balance: hands[player.id] ? player.balance - REQUIRED_ANTE : player.balance,
  }));

  return {
    status: 'in_progress',
    dealerId: input.dealerId,
    players: playersAfterAnte,
    pot: input.potBeforeAnte + participants.length * REQUIRED_ANTE,
    turnOrder: getTurnOrderForPlayers(
      playersAfterAnte,
      input.dealerId,
      participants.map((player) => player.id),
    ),
    currentTurnIndex: 0,
    actedPlayerIds: [],
    hands,
    bets: [],
  };
}

export function passTurn(state: RoundState, playerId: string): RoundState {
  getCurrentHand(state, playerId);
  return finishTurn(state, playerId);
}

export function placeBet(state: RoundState, playerId: string, amount: number, thirdCard: Card): RoundState {
  const hand = getCurrentHand(state, playerId);


  const player = state.players.find((candidate) => candidate.id === playerId);
  if (!player) throw new Error(`Player ${playerId} is not in this round.`);

  const maximum = maxBetAmount(player, state.pot);
  if (!Number.isInteger(amount) || amount < 1 || amount > maximum) {
    throw new Error(`Bet must be a whole number between 1 and ${maximum}.`);
  }

  const wins = isStrictlyBetween(hand.first, thirdCard, hand.second);
  const resolution: BetResolution = {
    playerId,
    amount,
    hand,
    thirdCard,
    outcome: wins ? 'win' : 'loss',
    potAfter: wins ? state.pot - amount : state.pot + amount,
  };

  const players = state.players.map((candidate) => {
    if (candidate.id !== playerId) return candidate;
    return { ...candidate, balance: candidate.balance + (wins ? amount : -amount) };
  });

  const nextState: RoundState = {
    ...state,
    players,
    pot: resolution.potAfter,
    bets: [...state.bets, resolution],
  };

  if (wins) {
    return { ...nextState, status: 'won', winnerId: playerId };
  }

  return finishTurn(nextState, playerId);
}

export function getDealerForNextRound(state: RoundState): string {
  return getNextDealerId(state.players, state.dealerId);
}

function getCurrentHand(state: RoundState, playerId: string): Hand {
  if (state.status !== 'in_progress') {
    throw new Error('This round is already over.');
  }
  if (state.turnOrder[state.currentTurnIndex] !== playerId) {
    throw new Error(`It is not ${playerId}'s turn.`);
  }
  const hand = state.hands[playerId];
  if (!hand) throw new Error(`Player ${playerId} has no hand in this round.`);
  return hand;
}

function finishTurn(state: RoundState, playerId: string): RoundState {
  const actedPlayerIds = [...state.actedPlayerIds, playerId];
  const nextTurnIndex = state.currentTurnIndex + 1;

  if (nextTurnIndex >= state.turnOrder.length) {
    return { ...state, actedPlayerIds, status: 'ended' };
  }

  return { ...state, actedPlayerIds, currentTurnIndex: nextTurnIndex };
}
