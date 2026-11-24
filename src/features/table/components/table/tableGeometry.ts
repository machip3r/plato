export function opponentPosition(index: number, width: number, height: number, playerCount = 4) {
  const count = Math.max(1, playerCount - 1);
  const span = count === 1 ? 0 : count === 2 ? 90 : count === 3 ? 130 : Math.min(250, 150 + (count - 4) * 34);
  const angle = (270 - span / 2 + (count > 1 ? index * span / (count - 1) : 0)) * Math.PI / 180;
  const cardWidth = tableCardWidth(width, height, playerCount);
  // The seat arc reserves the three-card spread (28% of a card) and the 17 px inset dashed line,
  // so side seats never push their outer card past the felt's stitched border.
  const radiusX = Math.max(0, width / 2 - cardWidth * 1.28 - 27);
  return { x: width / 2 + Math.cos(angle) * radiusX, y: height * (0.34 + Math.sin(angle) * 0.28) };
}
export function deckPosition(width: number, height: number) {
  return { x: width * 0.5, y: height * (height < 650 ? 0.49 : 0.44) };
}

/** Scale to the tighter axis: two cards must fit a seat and each row must clear the next. */
export function tableCardWidth(width: number, height: number, playerCount: number) {
  const rows = Math.max(1, Math.ceil((playerCount - 2) / 2));
  const rowLimit = rows > 1 ? (height * 0.13 - 49) / 1.39 : 70;
  return Math.round(Math.max(30, Math.min(playerCount <= 4 ? 60 : 48, width * 0.13, rowLimit)));
}
export function centralDeckWidth(width: number, height: number) {
  return Math.round(Math.max(44, Math.min(82, width * 0.18, height * 0.09)));
}

export function dealTravelDuration(count: number) { return count * 440 + 1100; }
export function dealArrivalMs(count: number, index: number) {
  return 1200 + dealTravelDuration(count) * (Math.max(0, index) + 2) / (count * 2 + 2);
}
export function dealArrivalGap(count: number) { return dealTravelDuration(count) / (count * 2 + 2); }

/** Shared poses prevent jumps between flying cards and the retained foreground fan. */
export const foregroundHandBottom = 42;
export function foregroundCardWidth(width: number, height: number) {
  return Math.min(width * 0.42, height * 0.3, 220);
}
export function foregroundHandOffset(cardWidth: number, raised = false) {
  return cardWidth * 1.39 * (raised ? -0.06 : 0.08);
}
export function foregroundCardCenter(width: number, height: number, slot: 'first' | 'second' | 'draw', raised = false) {
  const cardWidth = foregroundCardWidth(width, height);
  const fanTop = height - foregroundHandBottom - cardWidth * 1.39 + foregroundHandOffset(cardWidth, raised);
  return {
    x: width / 2 + (slot === 'draw' ? 0 : (slot === 'first' ? -1 : 1) * (cardWidth / 2 + 1)),
    y: fanTop + cardWidth * (slot === 'draw' ? 0.16 : 0.07) + Math.round(cardWidth * 1.39) / 2,
  };
}
