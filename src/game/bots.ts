import { maxBetAmount, handMustPass } from './rules';
import { winProbability } from './probability';
import type { Hand, Player } from './model';

export type BotAction = { type: 'pass' } | { type: 'bet'; amount: number };

/** Risk-seeking bots enter playable hands early and put a substantial share of the available stake at risk. */
export function chooseRiskTakingBotAction(player: Player, hand: Hand, pot: number): BotAction {
  const maximum = maxBetAmount(player, pot);
  const probability = winProbability(hand);

  if (handMustPass(hand) || maximum < 1 || probability < 0.15) {
    return { type: 'pass' };
  }

  const stakeFraction = Math.min(0.85, 0.25 + probability * 0.65);
  const amount = Math.min(maximum, Math.max(1, Math.floor(maximum * stakeFraction)));
  return { type: 'bet', amount };
}
