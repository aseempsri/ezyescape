export const STAY_PRICES = {
  1: 3200,
  2: 3800,
  3: 3500,
  4: 4200,
};

export const STAY_TITLES = {
  1: 'The Kumaoni Family Home',
  2: 'The Quiet Pine Retreat',
  3: 'The Family Valley Stay',
  4: 'The Valley View Cottage',
};

export function getStayPrice(stayId) {
  return STAY_PRICES[stayId] ?? null;
}
