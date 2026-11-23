import { chooseInitialDealer, getNextDealerId } from './rules';
import { drawCards, drawRandomCard } from './cards';
import { MAX_PLAYERS, MIN_PLAYERS, STARTING_BALANCE, type Player, type RoundState } from './model';
import { chooseRiskTakingBotAction } from './bots';
import { passTurn, placeBet, startRound } from './round';

export const BOT_NAMES = ['OskyBot', 'MallocBot', 'DieBot', 'DoomBot', 'DOCABOT', 'MacBot', 'MaxBot'];

export type MatchStatus = 'ready' | 'in_progress' | 'awaiting_host' | 'closed';

export interface ActionRecord {
  id: number;
  round: number;
  playerId: string;
  type: 'ante' | 'pass' | 'bet';
  delta: number;
  balanceAfter: number;
  potAfter: number;
  reason?: 'timeout';
  bet?: import('./model').BetResolution;
}

export interface LocalMatch {
  history: ActionRecord[];
  hostId: string;
  players: Player[];
  dealerId: string;
  pot: number;
  roundNumber: number;
  status: MatchStatus;
  round?: RoundState;
}

export function createLocalMatch(botCount: number, random: () => number = Math.random): LocalMatch {
  const totalPlayers = botCount + 1;
  if (!Number.isInteger(botCount) || totalPlayers < MIN_PLAYERS || totalPlayers > MAX_PLAYERS) {
    throw new Error(`Choose between ${MIN_PLAYERS - 1} and ${MAX_PLAYERS - 1} bots.`);
  }

  const players: Player[] = [
    { id: 'human', name: 'Tú', seat: 0, balance: STARTING_BALANCE, kind: 'human' },
    ...BOT_NAMES.slice(0, botCount).map((name, index) => ({
      id: `bot-${index + 1}`,
      name,
      seat: index + 1,
      balance: STARTING_BALANCE,
      kind: 'bot' as const,
    })),
  ];

  return {
    history: [],
    hostId: 'human',
    players,
    dealerId: chooseInitialDealer(players, random),
    pot: 0,
    roundNumber: 0,
    status: 'ready',
  };
}

export function startNextRound(match: LocalMatch, random: () => number = Math.random): LocalMatch {
  if (match.status === 'closed') throw new Error('This match has already been closed.');
  if (match.round?.status === 'in_progress') throw new Error('The current round is still in progress.');

  const eligibleCount = match.players.filter((player) => !player.spectating && player.balance >= 1).length;

  if (eligibleCount < MIN_PLAYERS) {
    return { ...match, status: 'awaiting_host' };
  }

  let dealerId = match.round ? getNextDealerId(match.players, match.dealerId) : match.dealerId;
  while (match.players.find(player => player.id === dealerId)?.spectating) dealerId = getNextDealerId(match.players, dealerId);

  const round = startRound({
    players: match.players,
    dealerId,
    potBeforeAnte: match.pot,
    dealtCards: drawCards(eligibleCount * 2, random),
  });

  return {
    ...match,
    dealerId,
    players: round.players,
    history: [...match.history, ...round.turnOrder.map((id, index) => { const player = round.players.find(candidate => candidate.id === id)!; return ({
      id: match.history.length + index + 1,
      round: match.roundNumber + 1,
      playerId: player.id,
      type: 'ante' as const,
      delta: -1,
      balanceAfter: player.balance,
      potAfter: match.pot + index + 1,
    }); })],
    pot: round.pot,
    roundNumber: match.roundNumber + 1,
    status: 'in_progress',
    round,
  };
}

/** Keep paid antes and history; a departed human passes any remaining turn. */
export function leaveLocalTable(match: LocalMatch, newHostId: string): LocalMatch {
  const host = match.players.find(player => player.id === newHostId && player.id !== 'human' && !player.spectating);
  if (!host) throw new Error('Choose an active player as the next host.');
  const players = match.players.map(player => player.id === 'human' ? { ...player, spectating: true } : player);
  const departed = { ...match, hostId: host.id, players, round: match.round ? { ...match.round, players } : undefined };
  return currentTurnPlayer(departed)?.id === 'human' ? passCurrentTurn(departed, 'human') : departed;
}

export function joinLocalTable(match: LocalMatch): LocalMatch {
  if (match.round?.status === 'in_progress') throw new Error('Join the table between rounds.');
  return { ...match, players: match.players.map(player => player.id === 'human' ? { ...player, spectating: false } : player) };
}

export function currentTurnPlayer(match: LocalMatch): Player | undefined {
  if (!match.round || match.round.status !== 'in_progress') return undefined;
  const id = match.round.turnOrder[match.round.currentTurnIndex];
  return match.players.find((player) => player.id === id);
}

export function passCurrentTurn(match: LocalMatch, playerId: string, reason?: 'timeout'): LocalMatch {
  const round = passTurn(requireRound(match), playerId);
  return recordAction(match, round, playerId, 'pass', reason);
}

export function betCurrentTurn(
  match: LocalMatch,
  playerId: string,
  amount: number,
  random: () => number = Math.random,
): LocalMatch {
  const round = requireRound(match);
  return recordAction(match, placeBet(round, playerId, amount, drawRandomCard(random)), playerId, 'bet');
}

export function playBotTurn(match: LocalMatch, playerId: string, random: () => number = Math.random): LocalMatch {
  const round = requireRound(match);
  const player = match.players.find((candidate) => candidate.id === playerId);
  const hand = round.hands[playerId];
  if (!player || !hand || player.kind !== 'bot') throw new Error(`Player ${playerId} is not an active bot.`);

  const action = chooseRiskTakingBotAction(player, hand, round.pot);
  return action.type === 'pass'
    ? passCurrentTurn(match, playerId)
    : betCurrentTurn(match, playerId, action.amount, random);
}

export function closeLocalMatch(match: LocalMatch): LocalMatch {
  return { ...match, status: 'closed' };
}

function requireRound(match: LocalMatch): RoundState {
  if (!match.round || match.round.status !== 'in_progress') {
    throw new Error('There is no active round.');
  }
  return match.round;
}

function synchronizeRound(match: LocalMatch, round: RoundState): LocalMatch {
  return {
    ...match,
    players: round.players,
    pot: round.pot,
    status: 'in_progress',
    round,
  };
}

function recordAction(match: LocalMatch, round: RoundState, playerId: string, type: 'pass' | 'bet', reason?: 'timeout'): LocalMatch {
  const player = round.players.find(p => p.id === playerId)!;
  const before = match.players.find(p => p.id === playerId)!;
  return {
    ...synchronizeRound(match, round),
    history: [...match.history, {
      id: match.history.length + 1,
      round: match.roundNumber,
      playerId,
      type,
      delta: player.balance - before.balance,
      balanceAfter: player.balance,
      potAfter: round.pot,
      reason,
      bet: type === 'bet' ? round.bets.at(-1) : undefined,
    }],
  };
}
