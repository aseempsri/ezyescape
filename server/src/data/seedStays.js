import Stay from '../models/Stay.js';

const SEED = [
  {
    title: 'The Kumaoni Family Home',
    location: 'Almora, Kumaon',
    cat: 'quiet culture',
    best: 'Couples · Writers · Slow Travellers',
    guests: 4,
    rooms: 3,
    price: 4500,
    discountType: 'flat',
    discountValue: 1300,
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'],
    videos: [],
  },
  {
    title: 'The Quiet Pine Retreat',
    location: 'Ranikhet, Kumaon',
    cat: 'quiet forest',
    best: 'Solo · Nature Lovers',
    guests: 2,
    rooms: 2,
    price: 5200,
    discountType: 'flat',
    discountValue: 1400,
    images: ['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80'],
    videos: [],
  },
  {
    title: 'The Family Valley Stay',
    location: 'Nainital Hills',
    cat: 'family accessible',
    best: 'Families · Easy Access',
    guests: 6,
    rooms: 4,
    price: 4800,
    discountType: 'flat',
    discountValue: 1300,
    images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'],
    videos: [],
  },
  {
    title: 'The Valley View Cottage',
    location: 'Kausani, Kumaon',
    cat: 'quiet accessible',
    best: 'Remote Workers · Couples',
    guests: 3,
    rooms: 2,
    price: 5500,
    discountType: 'flat',
    discountValue: 1300,
    images: ['https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80'],
    videos: [],
  },
];

export async function seedStaysIfEmpty() {
  const count = await Stay.countDocuments();
  if (count > 0) return;
  await Stay.insertMany(SEED);
  console.log(`Seeded ${SEED.length} stays`);
}
