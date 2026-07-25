/** Fixed ad slot catalogue for Ezy Escape (site = ezyescape). */

export const AD_SITE = 'ezyescape';

/**
 * @typedef {{ id: string, label: string, orientation: 'horizontal' | 'vertical', hint: string }} AdSlotDef
 * @typedef {{ id: string, title: string, slots: AdSlotDef[] }} AdSectionDef
 */

/** @type {AdSectionDef[]} */
export const AD_SECTIONS = [
  {
    id: 'homestays',
    title: 'Homestays',
    slots: [
      {
        id: 'homestays-ad1',
        label: 'AD1',
        orientation: 'horizontal',
        hint: 'Above “Still deciding?” — wide banner',
      },
      {
        id: 'homestays-ad2',
        label: 'AD2',
        orientation: 'vertical',
        hint: 'Below “Still deciding?” — tall frame',
      },
    ],
  },
  {
    id: 'experiences',
    title: 'Experiences',
    slots: [
      {
        id: 'experiences-ad1',
        label: 'AD1',
        orientation: 'horizontal',
        hint: 'Above “Ready to join one of these?” — wide banner',
      },
      {
        id: 'experiences-ad2',
        label: 'AD2',
        orientation: 'vertical',
        hint: 'Below “Ready to join one of these?” — tall frame',
      },
    ],
  },
  {
    id: 'postcards',
    title: 'Postcards',
    slots: [
      {
        id: 'postcards-ad1',
        label: 'AD1',
        orientation: 'horizontal',
        hint: 'Above “Send the next postcard” — wide banner',
      },
      {
        id: 'postcards-ad2',
        label: 'AD2',
        orientation: 'vertical',
        hint: 'Below “Send the next postcard” — tall frame',
      },
    ],
  },
  {
    id: 'shop',
    title: 'Shop',
    slots: [
      {
        id: 'shop-ad1',
        label: 'AD1',
        orientation: 'horizontal',
        hint: 'Above “Who your purchase supports” — wide banner',
      },
      {
        id: 'shop-ad2',
        label: 'AD2',
        orientation: 'vertical',
        hint: 'Below “Who your purchase supports” — tall frame',
      },
    ],
  },
  {
    id: 'partner',
    title: 'Partner',
    slots: [
      {
        id: 'partner-ad1',
        label: 'AD1',
        orientation: 'horizontal',
        hint: 'Above “Ready to host with intention?” — wide banner',
      },
      {
        id: 'partner-ad2',
        label: 'AD2',
        orientation: 'vertical',
        hint: 'Below “Ready to host with intention?” — tall frame',
      },
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    slots: [
      {
        id: 'contact-ad1',
        label: 'AD1',
        orientation: 'horizontal',
        hint: 'Above “Looking for something specific?” — wide banner',
      },
      {
        id: 'contact-ad2',
        label: 'AD2',
        orientation: 'vertical',
        hint: 'Below “Looking for something specific?” — tall frame',
      },
    ],
  },
  {
    id: 'home',
    title: 'Homepage',
    slots: [
      {
        id: 'home-ad1',
        label: 'AD1',
        orientation: 'horizontal',
        hint: 'End of Local Immersion section — wide banner',
      },
      {
        id: 'home-ad2',
        label: 'AD2',
        orientation: 'horizontal',
        hint: 'End of Responsible Tourism section — wide banner',
      },
      {
        id: 'home-ad3',
        label: 'AD3',
        orientation: 'vertical',
        hint: 'After “Read more postcards” — tall frame',
      },
      {
        id: 'home-ad4',
        label: 'AD4',
        orientation: 'vertical',
        hint: 'After “Ready to Escape?” section — tall frame',
      },
    ],
  },
];

export function allSlotIds() {
  return AD_SECTIONS.flatMap((s) => s.slots.map((slot) => slot.id));
}

export function slotMeta(adId) {
  for (const section of AD_SECTIONS) {
    const slot = section.slots.find((s) => s.id === adId);
    if (slot) return { ...slot, sectionId: section.id, sectionTitle: section.title };
  }
  return null;
}
