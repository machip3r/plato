# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Groups of friends who want to play PLATO together, first in a local prototype against automatic bots and later across web, iOS, and Android.

## Product Purpose

PLATO is a social card game centered on a shared pot. Success means friends can understand the rules quickly, finish a round smoothly, and want to play again.

## Positioning

The game combines a rotating dealer, a mandatory contribution from each active player, a persistent shared pot, and a round that ends immediately when the first player wins a bet. It uses a virtual infinite American card set rather than the Spanish deck proposed in the original PRD.

## Operating Context

Players receive two cards and may pass or bet that a third card will fall strictly between them. The dealer also plays. Turns proceed to the dealer's right. The first dealer is selected randomly. The first prototype is a local game for one person and automatic bots, with no account required.

## Capabilities and Constraints

- Initial targets: web, iOS, and Android; the first prototype is local.
- Table size: 2–8 players total. Each new local match chooses 1–7 bots at random, using a different count from the previous match; the setup preview can reroll the count.
- Cards: four standard suits and values 1–13 (Jack=11, Queen=12, King=13). Each draw is independent with replacement; every value has probability 1/13. There is no deck exhaustion.
- Starting balance: 1,000 free tokens per player. No refills during a match. A player unable to pay the one-token ante sits out that round; a round waits for the host if fewer than two players can ante.
- Bets are whole numbers from 1 to `min(current pot, player balance)`. Players may bet even on equal or adjacent values; the UI clearly marks their 0% chance of winning.
- A bet wins only when the third value is strictly between the two initial values. The first winning bet ends the round and pays exactly the bet amount from the pot. Losing adds the bet amount to the pot. A partial win leaves the remainder for the next round. If all players pass or lose, the round ends without a winner.
- The dealer participates if able to ante; otherwise they keep the dealer role and sit out that round. The first turn remains to their right, and the dealer rotates one seat to the right each round.
- Hands that bet are revealed when the wager begins and remain visible; passed hands stay concealed. Spectators do not pay the ante.
- Any player who does not act within 60 seconds automatically passes. A player who leaves is removed after the current round.
- A match ends when its host closes it. A new match starts with fresh balances.
- Bots use a risk-taking baseline: they enter hands with at least 2 winning ranks and stake 25–85% of the available limit according to their probability. They wait 2.3–3.4 seconds before deciding.
- The first prototype uses free, fictional, non-transferable tokens with no cash value or redemption. No deposits, withdrawals, real-money wagers, or prizes of monetary value.
- These user decisions supersede conflicting proposals in the source PRD.

## Brand Commitments

PLATO is the working game name. The visual direction is Swiss concert-poster typography fused with an intimate casino room: warm paper and decisive black type around a deep felt oval, walnut rail, brass accents, red action cues, and expressive player portraits. The first mobile composition centers the table and seats, keeps the turn marker compact, and anchors the bet/pass controls at the bottom. The Swiss grid guides hierarchy; it does not turn the felt table into an abstract geometric diagram.

## Evidence on Hand

- Full initial product brief and rules: `/Users/machip3r/Downloads/PLATO_Contexto_Completo_PRD_Codex.pdf`.
- No approved logos, card illustrations, mascot, or other visual assets yet.

## Product Principles

- Make the turn, pot, and available actions easy to understand.
- Keep the game social and approachable.
- Keep game rules independent of presentation and storage.
- Treat virtual tokens as play-only and free.

## Accessibility & Inclusion

Respect system reduced-motion preferences and support disabling sound when sound is introduced. Keep turn, pot, balance, and available actions legible on mobile screens.

## Local host transfer and spectators
The human can leave their seat from the header, choose a successor host and decide whether to watch. During a round, any remaining turn passes automatically and the already-paid ante stays in the Plato; no further antes are charged as a spectator. The local successor is one of the bots. Spectators retain their existing balance and history, do not receive hands or pay the ante, and can queue entry for the next round. A bot host starts the next round automatically after a seven-second break while the table is being watched. With fewer than two funded participants, the table waits and a funded spectator can rejoin. Leaving the game screen pauses the local simulation until returning to watch; this is in-memory state, not a network session.

At zero balance, the human action buttons are hidden and any remaining human turn automatically passes. Leaving waits for an in-flight card animation to finish; the host can still close the entire table through the separate confirmed close action.
