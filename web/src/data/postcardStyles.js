/** Handwriting styles + postcard layouts for the guest wall. */

export const HAND_FONTS = [
  { id: 'tangerine', family: "'Tangerine', cursive", size: 'clamp(2.05rem, 3.5vw, 2.9rem)', weight: 700, line: 1.12 },
  { id: 'caveat', family: "'Caveat', cursive", size: 'clamp(1.55rem, 2.7vw, 2.15rem)', weight: 600, line: 1.28 },
  { id: 'kalam', family: "'Kalam', cursive", size: 'clamp(1.25rem, 2.2vw, 1.7rem)', weight: 400, line: 1.45 },
  { id: 'patrick', family: "'Patrick Hand', cursive", size: 'clamp(1.35rem, 2.35vw, 1.85rem)', weight: 400, line: 1.4 },
  { id: 'shadows', family: "'Shadows Into Light', cursive", size: 'clamp(1.45rem, 2.5vw, 2rem)', weight: 400, line: 1.35 },
  { id: 'satisfy', family: "'Satisfy', cursive", size: 'clamp(1.5rem, 2.6vw, 2.05rem)', weight: 400, line: 1.35 },
  { id: 'gloria', family: "'Gloria Hallelujah', cursive", size: 'clamp(1.2rem, 2.1vw, 1.55rem)', weight: 400, line: 1.5 },
  { id: 'indie', family: "'Indie Flower', cursive", size: 'clamp(1.35rem, 2.4vw, 1.85rem)', weight: 400, line: 1.4 },
];

/** Eight distinct postcard papers — every story gets a different one in rotation. */
export const POSTCARD_LAYOUTS = [
  { id: 'letter', label: 'Hill letter', blurb: 'Cream paper · note left · view right', kicker: 'A note from the hills' },
  { id: 'airmail', label: 'Airmail', blurb: 'Striped border · view left · ruled note', kicker: 'Par avion · from the hills' },
  { id: 'polaroid', label: 'Polaroid', blurb: 'Photo on top · note underneath', kicker: 'Developed in the mountains' },
  { id: 'telegram', label: 'Telegram', blurb: 'Urgent strip · dark paper', kicker: 'STOP · ridge telegram' },
  { id: 'kraft', label: 'Kraft', blurb: 'Brown wrap · perforated edge', kicker: 'Packed with care' },
  { id: 'night', label: 'Night ink', blurb: 'Indigo card · starlight note', kicker: 'Written after dark' },
  { id: 'meadow', label: 'Meadow', blurb: 'Sage wash · soft orchard ink', kicker: 'From the orchard path' },
  { id: 'ticket', label: 'Trail ticket', blurb: 'Boarding stub · perforated', kicker: 'Admit one · slow traveller' },
];

export const HAND_FONT_IDS = HAND_FONTS.map((f) => f.id);
export const LAYOUT_IDS = POSTCARD_LAYOUTS.map((l) => l.id);

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

/** Prefer stored style; fall back to unique pair from list index. */
export function resolvePostcardStyle(postcard, listIndex = 0) {
  const fallback = styleForIndex(listIndex);
  const layout =
    (LAYOUT_IDS.includes(postcard?.layout) && postcard.layout) || fallback.layout;
  const font =
    HAND_FONTS.find((f) => f.id === postcard?.handFont) ||
    HAND_FONTS.find((f) => f.id === fallback.handFont) ||
    HAND_FONTS[0];
  const meta = POSTCARD_LAYOUTS.find((l) => l.id === layout) || POSTCARD_LAYOUTS[0];
  return { font, layout, kicker: meta.kicker };
}
