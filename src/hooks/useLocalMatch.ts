import { useCallback, useEffect, useRef, useState } from 'react';
import { HUMAN_TURN_TIMEOUT_MS, BETWEEN_ROUNDS_DELAY_MS } from '../game/timing';
import {
  betCurrentTurn,
  closeLocalMatch,
  createLocalMatch,
  currentTurnPlayer,
  passCurrentTurn,
  playBotTurn,
  startNextRound,
  maxBetAmount,
  leaveLocalTable,
  joinLocalTable,
  type LocalMatch,
} from '../game';

export type TablePresentation = { type: 'deal' | 'bet' | 'pass'; next: LocalMatch; actorId?: string };

export type QueuedAction = { type: 'pass' } | { type: 'bet'; amount: number };

const BOT_THINK_TIME_MS = 2300;

export function useLocalMatch(betweenRoundsPaused = false) {
  const nextRoundDeadline = useRef<number | undefined>(undefined);
  const getNextRoundAt = useCallback(() => nextRoundDeadline.current, []);
  const [watching, setWatching] = useState(true);
  const [joinQueued, setJoinQueued] = useState(false);
  const [match, setMatch] = useState<LocalMatch>();
  const [presentation, setPresentation] = useState<TablePresentation>();
  const locked = useRef(false);
  const [queuedAction, setQueuedAction] = useState<QueuedAction>();
  const queued = useRef<QueuedAction | undefined>(undefined);
  const [queueRevision, setQueueRevision] = useState(0);
  const [queueNotice, setQueueNotice] = useState('');
  const cancelQueuedAction = useCallback(() => { queued.current = undefined; setQueuedAction(undefined); if (match && currentTurnPlayer(match)?.id === 'human') setQueueRevision(value => value + 1); }, [match]);
  const clearQueue = () => { cancelQueuedAction(); setQueueNotice(''); };
  const present = (next: LocalMatch, type: TablePresentation['type'], actorId?: string) => {
    if (locked.current) return;
    locked.current = true;
    setPresentation({ type, next, actorId });
  };
  const finishPresentation = () => {
    if (!presentation) return;
    if (presentation.next.round?.status !== 'in_progress') clearQueue();
    setMatch(presentation.next);
    setPresentation(undefined);
    locked.current = false;
  };

  const startMatch = (botCount: number) => {
    clearQueue();
    setWatching(true);
    setJoinQueued(false);
    const created = createLocalMatch(botCount);
    setMatch(created);
    present(startNextRound(created), 'deal');
  };

  const submit = (action: QueuedAction) => {
    if (!match || !watching || match.players.find(player => player.id === 'human')?.spectating || match.players.find(player => player.id === 'human')!.balance <= 0 || match.round?.status !== 'in_progress') return;
    const round = match.round;
    if (!round.turnOrder.slice(round.currentTurnIndex).includes('human')) return;
    if (currentTurnPlayer(match)?.id !== 'human' || locked.current) {
      queued.current = action;
      setQueuedAction(action);
      setQueueNotice('');
      return;
    }
    clearQueue();
    if (action.type === 'pass') setMatch(passCurrentTurn(match, 'human'));
    else present(betCurrentTurn(match, 'human', action.amount), 'bet', 'human');
  };
  const pass = () => submit({ type: 'pass' });
  const bet = (amount: number) => submit({ type: 'bet', amount });

  const nextRound = () => {
    if (!match || locked.current) return;
    clearQueue();
    const next = startNextRound(joinQueued ? joinLocalTable(match) : match);
    setJoinQueued(false);
    if (next.status === 'awaiting_host') setMatch(next);
    else present(next, 'deal');
  };

  const leaveTable = (hostId: string, stay: boolean) => {
    if (!match || locked.current) return false;
    clearQueue();
    setJoinQueued(false);
    setMatch(leaveLocalTable(match, hostId));
    setWatching(stay);
    return true;
  };
  const requestJoin = () => {
    if (!match || !match.players.find(player => player.id === 'human')?.spectating) return;
    if (match.status === 'awaiting_host') {
      const next = startNextRound(joinLocalTable(match));
      if (next.status === 'awaiting_host') setMatch(next);
      else present(next, 'deal');
      setJoinQueued(false);
    } else setJoinQueued(value => !value);
  };

  useEffect(() => {
    if (!watching || betweenRoundsPaused || presentation || !match || match.status !== 'in_progress' || match.round?.status === 'in_progress' || (match.hostId ?? 'human') === 'human') { nextRoundDeadline.current = undefined; return; }
    nextRoundDeadline.current = Date.now() + BETWEEN_ROUNDS_DELAY_MS;
    const timer = setTimeout(() => {
      const next = startNextRound(joinQueued ? joinLocalTable(match) : match);
      setJoinQueued(false);
      if (next.status === 'awaiting_host') setMatch(next);
      else { locked.current = true; setPresentation({ type: 'deal', next }); }
    }, BETWEEN_ROUNDS_DELAY_MS);
    return () => { clearTimeout(timer); nextRoundDeadline.current = undefined; };
  }, [match, presentation, joinQueued, watching, betweenRoundsPaused]);

  const closeMatch = () => {
    if (!match) return;
    setPresentation(undefined);
    locked.current = false;
    clearQueue();
    setMatch(closeLocalMatch(match));
  };

  useEffect(() => {
    if (!watching || presentation || !match || match.status !== 'in_progress' || match.round?.status !== 'in_progress') return;
    const player = currentTurnPlayer(match);
    if (!player) return;

    const delay = player.kind === 'bot' ? BOT_THINK_TIME_MS + Math.floor(Math.random() * 1100) : player.spectating || player.balance <= 0 || queued.current ? 350 : HUMAN_TURN_TIMEOUT_MS;
    const timeout = setTimeout(() => {
      if (locked.current) return;
      if (player.kind === 'human' && queued.current) {
        const action = queued.current;
        cancelQueuedAction();
        const human = match.players.find(p => p.id === 'human')!;
        if (action.type === 'bet' && action.amount > maxBetAmount(human, match.pot)) {
          setQueueNotice('Apuesta preparada cancelada: el límite cambió. Elige otra cantidad.');
          return;
        }
        if (action.type === 'pass') setMatch(passCurrentTurn(match, 'human'));
        else present(betCurrentTurn(match, 'human', action.amount), 'bet', 'human');
        return;
      }
      const next = player.kind === 'bot' 
        ? playBotTurn(match, player.id)
        : passCurrentTurn(match, player.id, 'timeout');
      if ((next.round?.bets.length ?? 0) > (match.round?.bets.length ?? 0)) {
        present(next, 'bet', player.id);
      } else {
        if (player.kind === 'bot') present(next, 'pass', player.id);
        else setMatch(next);
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [match, presentation, queueNotice, queueRevision, cancelQueuedAction, watching]);

  return { getNextRoundAt, watching, resumeWatching: () => setWatching(true), joinQueued, requestJoin, leaveTable, queuedAction, queueNotice, cancelQueuedAction, match, presentation, finishPresentation, startMatch, pass, bet, nextRound, closeMatch };
}
