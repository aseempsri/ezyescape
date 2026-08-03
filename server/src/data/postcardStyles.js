/** Shared postcard style catalog — keep in sync with web/src/data/postcardStyles.js */

export const HAND_FONT_IDS = [
  'tangerine',
  'caveat',
  'kalam',
  'patrick',
  'shadows',
  'satisfy',
  'gloria',
  'indie',
];

export const LAYOUT_IDS = [
  'letter',
  'airmail',
  'polaroid',
  'telegram',
  'kraft',
  'night',
  'meadow',
  'ticket',
];

/** Deterministic unique pair from sequence index (creation order). */
export function styleForIndex(index) {
  const i = Math.max(0, Number(index) || 0);
  let layout = LAYOUT_IDS[i % LAYOUT_IDS.length];
  // Wall cards stay side-by-side (image | note) — skip stacked polaroid in rotation
  if (layout === 'polaroid') layout = 'letter';
  return {
    layout,
    handFont: HAND_FONT_IDS[(i * 3 + 1) % HAND_FONT_IDS.length],
  };
}
