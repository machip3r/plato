# PLATO — Visual contract

**THESIS** — A private card room should feel tactile, social, and instantly playable.

**OWN-WORLD** — Swiss concert-poster discipline meets a warm casino table: confident black typography, restrained red signals, deep felt, walnut rail, brass details, and small character portraits.

**STORY** — Arrive, choose the table size, read the pot and your own hand, then pass or wager. Bot turns move briskly; a win closes the round and leaves the rest of the pot for the next one.

**FIRST VIEWPORT** — Compact round header; an oval felt table with bot seats and a centered pot; the human hand below; a quiet turn indicator and a bottom action bar.

**FORM** — Portrait-first, responsive, no oversized “your turn” headline and no abstract geometric table. Keep the table immersive, the hand legible, and actions within thumb reach. Use Skia for the table illustration and Reanimated for the card reveal and tactile press response; add Rive when original animation assets are ready.

## Revised visual authority
The user's supplied A/C concept image is authoritative: marfil background, black grotesk type, fine oval black table line, red poster arcs and additional mint, ochre and portrait colors. Avoid dark felt room styling. The compact bottom controls belong to A; C contributes immersion without the large turn heading.

## Motion
Round entry deals two passes of cards from a visible central deck. Turns are locked until dealing finishes. Wagers stage their next state, slide a concealed third card from the dealer, pause, flip it, show the full three-card hand and outcome, then commit the new balance and turn. Respect reduced motion and cancel animations and timers on unmount.

## Typography
- Oswald Bold: card ranks and numeric indices. Keep suit symbols in the system symbol font.
- Playfair Display Black: PLATO branding and primary scene titles; Bold is available for secondary display work.
- Plus Jakarta Sans Regular, Semibold, Bold and ExtraBold: controls, room metadata, names, rules, pot and balances. Use tabular figures on live numerical readouts.
All faces are bundled from Expo Google Fonts and loaded once before the game renders.

## User Figma prototype — current gameplay authority
White header, large PLATO wordmark, continuous green portrait table with a rounded top extending to the bottom edge. Opponents hold concealed pairs at the top and sides. The human hand is large, fanned and partially cropped in the foreground with controls over it. Passing shrinks and moves the hand above a centered “Pasaste” state. Betting places a quantity selector and “¡PLATO!” maximum action above the hand, with Cancelar/Confirmar at the bottom. Keep the user's selected fonts and the animated dealing/reveal sequences.

## In-table motion and turn feedback
Use “Plato” for the shared tokens everywhere in visible copy. The central deck remains on the felt. Shuffle and deal render directly above that deck using the exact seat coordinates; no backdrop, sheet or dialog. A wager flips at the deck, travels to the bettor and shows the three-card hand before committing the outcome. The human turn countdown sits above the foreground cards with numeric seconds and a time bar; it remains mounted while selecting the wager and disappears during animations and other turns.

## Opponent actions and card scale
Bot passes are staged: their concealed pair moves toward the central discard area and fades before the next player acts. Bot wagers turn the initial pair face up at the seat immediately and keep it visible; the third card then flips at the enlarged deck and arrives below that seat. Small faces use a single large Oswald rank and a high-contrast suit with no duplicate indices. Board card sizes account for viewport width, height and seat rows; the central deck uses a separate, larger scale.

## History, betting controls and chip receipts
The header exposes a match-wide action ledger, filterable by player, including round contributions, passes and timeout passes, and bet outcomes with the balance and Plato after each action. The ledger continues across rounds and resets for a new match. Gameplay continues while it is open. Betting uses a rounded stepper with hold-to-repeat, direct numeric entry, +5/+10 shortcuts and a labeled maximum action. The final action names the stake. Player and Plato counters tween to their actual new amounts with signed floating receipts; round entry starts from balances before the ante and the previous Plato.

## Prepared actions and visual clarity
A human may prepare a pass or a fixed whole-number wager before their turn and cancel it. Execute only in that round when the human becomes the actor; cancel on round end or close and revalidate the amount at execution without silently changing the stake. Show exact uniform-draw win probability above the hand, strongly highlighting zero while allowing the wager, including equal ranks. Keep the exposed card and deck centered as a single group. Felt is a bundled repeating fiber texture. Rank-value badges appear only on J/Q/K. Chip receipts are larger and remain visible for three seconds. History shows revealed betting hands and concealed pass hands with player portraits and result cues.

## Round order and table variety
Ante receipts are staggered by the actual round turn order, starting at each first-card arrival; the Plato advances by one on the same beats. Match history records contributions in that order. Opponents follow a balanced upper-table arc that expands with the number of seats; all dealing and pass animations share the same geometry. The active opponent has a gold border and a visible TURNO/APUESTA/PASA badge. The human's active hand has gold edges. New matches and rerolls draw 1–7 bots, excluding the immediately previous count. Names are OskyBot, MallocBot, DieBot, DoomBot, DOCABOT, MacBot and MaxBot.

## Retained wager hands and revised table flow
Every bettor retains a three-card flourish, with the draw centered and green for a win or red for a loss. Passed hands become gray. The ante receipt begins when the first dealt card reaches each seat, using shared arrival timing; the Plato follows the same beats. Pass preparation uses one toggle, “Pasar” / “Cancelar pase”. Remove the local/bot-count tag and separate “view hand” action. Match closure uses an accessible centered confirmation dialog with safe cancel focus and recoverability copy. The ledger shows no cards for passes and positions compact wager cards on the right of the same action row. Bots wait 2.3–3.4 seconds and take larger risks; MaxBot replaces ByteBot.

## Slower motion and glass betting panel
Dealing travels at a slower shared timing (440 ms per participant plus 1.1 s), after a 1.2 s shuffle; chip receipts follow actual arrivals, tween more slowly and remain for 4.6 s. Betting becomes a larger glass panel using Expo BlurView and a BlurTargetView for Android, with the full stake controls and confirmation inside. The bottom dock is hidden while the panel is open; Cancelar apuesta lives inside the glass panel. Default actions are circular; Apostar breathes gently only for a nonzero chance and when no action is queued, respecting reduced motion. Prepared actions appear in those same buttons at 85% opacity, without an extra message. Show the round-order number at each seat and replace the D abbreviation with Repartidor. Hide odds once the human has acted and display zero simply as “0% de ganar”.

## Gold table frame and compact ledger
The felt has a 7 px muted gold rail and inset fine line, with modest rounded top corners (18% of width, capped at 110 px). A low-contrast outlined P sits below the central deck. Primary circular actions are 126 px. Passed status fills the dock width; round completion has a dark gold-edged bar and a prominent gold next-round action. History aligns copy and smaller 32–34 px cards in the same row, preserving revealed draws and hiding cards for passes.

## Arched wordmark and face-down hand delivery
The gold table line is inset 28 px from the edge, replacing the flush gold rail. The center mark is outlined PLATO in bundled Playfair Display, with individually rotated glyphs along an arc. Wager heading and limit are centered; +10, +50 and PLATO share a 50 px minimum height. Human deal cards travel into the exact foreground fan size and ±13° angles, pause face down and flip sequentially before actions unlock. Reduced motion skips the choreography.

## Swipe actions and persistent player receipts
The player balance stays mounted across wager, pass and round-result states, with large signed receipts above it for 4.6 seconds. Receipts update only when the delivered wager commits. Horizontal swipes right pass and left open stake selection, retaining queued-action rules; right swipes dismiss the open wager panel. Gestures require 72 px travel or at least 36 px with clear velocity, reject vertical movement and keep button alternatives. The wager footer puts Cancelar on the left and Apostar N on the right. The inset gold table border is dotted.

## Round ledger and spectator transition
History groups actions under accessible round accordions; the current round opens by default, others start collapsed, and filters preserve the groups. The player balance uses a larger 25 px tabular amount, a gold chip and a dark green panel with a gold outline. The inset table line uses dashes. At round end, Salir sits left of the next-round action. Leaving transfers host control to a chosen bot and offers watching or leaving the game screen. Spectators keep their balance, receive no cards and pay no ante. The bot host waits seven seconds between rounds; joining queues participation for the next deal. The leave dialog pauses that timer. Fewer than two funded participants puts the table in its waiting state, with re-entry available to a spectator.

## Deal settling and one-minute turns
The gold dashed border has 45% opacity. Human turns last 60 seconds, with the deadline and countdown reading one shared constant. After delivery, opponent cards ease over 600 ms from their tilted arrival into the exact vertical seat centers before the animation hands off to the static table. Human cards retain their fan angles, then flip in sequence after the opponents settle. Reduced motion places cards at their final poses immediately. Spectator copy reads “Estás viendo la mesa”.

## Shredded passes and continuous wager delivery
Bot passes break into twenty clipped ribbons that curl and fall locally over 1.6 seconds, revealing the retained disabled backs before handoff. The human hand lifts over 1.05 seconds as the wager is revealed; flying draws use their final card layout and shared fan coordinates throughout, including exact seat centers for opponents. There is no compact-to-large face replacement or hand-position snap at commit. The balance is a root sibling above the presentation and action dock. Action buttons stay absent during the deal, enter over 600 ms once the hand is received, and disappear immediately when the human submits a wager. Odds use a left circular meter with warm colors for low chances, green for favorable chances and red at zero; the turn panel is on the right.

## Centered clock and round-wait footer
The table now clips all four corners with a tighter radius (14% of width, capped at 76 px), with a dark green rail keeping the lower curve visible over foreground cards. The inset dashed line follows the same shape. Probability remains at left; the countdown and active-player status sit in the center, and an independent circular turn-order badge sits at right. Remove the centered human turn-order text. Between rounds, the host status combines the next round number, illustrated avatar, host name, seconds and a linear progress track, reading the actual auto-start deadline rather than a separate timer.

## Header actions and gesture feedback
The round count is geometrically centered in the header; a compact brand remains left, with a clock-history icon and a labeled exit icon button at right. Narrow headers hide only the history text, retaining its accessible name. HUD circles sit 34 px from the edges, within the inset dashed line; the central countdown is longer and 40 px high. Horizontal drags translate and gently tilt the hand, then settle after commitment. A bounded one-shot burst shows coins for betting and sad emoji for passing/cancellation, below the balance; reduced motion skips it. Passed human cards ease to zero rotation while preserving the existing shrink. At zero balance, hide both action buttons and bypass the human turn automatically. Quick stake increments select their exact amount when the current value is 1, then add normally, always capped at the available limit.
