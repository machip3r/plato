import type { LocalMatch } from '../../game';

export type TablePresentation = { type: 'deal' | 'bet' | 'pass'; next: LocalMatch; actorId?: string };

export type QueuedAction = { type: 'pass' } | { type: 'bet'; amount: number };
