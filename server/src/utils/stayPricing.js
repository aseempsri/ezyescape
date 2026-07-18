export function computeFinalPrice(stay) {
  const price = Number(stay.price) || 0;
  const value = Number(stay.discountValue) || 0;

  if (stay.discountType === 'percent' && value > 0) {
    return Math.max(0, Math.round(price * (1 - value / 100)));
  }
  if (stay.discountType === 'flat' && value > 0) {
    return Math.max(0, price - value);
  }
  return price;
}

// Shape a Stay document for API responses (adds computed pricing fields).
export function serializeStay(stay) {
  const finalPrice = computeFinalPrice(stay);
  const hasDiscount = finalPrice < stay.price;

  return {
    id: stay._id,
    slug: stay.slug || '',
    title: stay.title,
    location: stay.location,
    cat: stay.cat,
    best: stay.best,
    guests: stay.guests,
    rooms: stay.rooms,
    price: stay.price,
    discountType: stay.discountType,
    discountValue: stay.discountValue,
    finalPrice,
    hasDiscount,
    description: stay.description || '',
    story: stay.story || '',
    directions: stay.directions || '',
    highlights: stay.highlights || [],
    images: stay.images || [],
    videos: stay.videos || [],
    image: (stay.images && stay.images[0]) || '',
    active: stay.active,
    createdAt: stay.createdAt,
  };
}
