import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';
import CoinLot from '../models/CoinLot.js';
import { BOOKING_REWARD, WELCOME_BONUS, coinExpiryFrom } from '../config/wallet.js';

// Credit coins: bump the cached balance, open an expiring lot, and log the ledger entry.
async function creditCoins(userId, { amount, reason, bookingId, description }) {
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { ezyCoins: amount } },
    { new: true }
  );
  if (!user) throw new Error('User not found');

  await CoinLot.create({
    userId,
    amount,
    remaining: amount,
    reason,
    bookingId,
    expiresAt: coinExpiryFrom(),
  });

  await WalletTransaction.create({
    userId,
    type: 'credit',
    amount,
    reason,
    bookingId,
    balanceAfter: user.ezyCoins,
    description,
  });

  return { balance: user.ezyCoins };
}

// One-time backfill for coins earned before lots existed: if a user has a
// positive balance but no lots at all, wrap the whole balance in a single lot.
async function backfillLotsIfMissing(userId) {
  const count = await CoinLot.countDocuments({ userId });
  if (count > 0) return;

  const user = await User.findById(userId);
  if (user && user.ezyCoins > 0) {
    await CoinLot.create({
      userId,
      amount: user.ezyCoins,
      remaining: user.ezyCoins,
      reason: 'welcome_bonus',
      expiresAt: coinExpiryFrom(),
    });
  }
}

// Sweep any lots past their expiry date and remove them from the balance.
export async function expireCoins(userId) {
  const now = new Date();
  const lots = await CoinLot.find({
    userId,
    expired: false,
    remaining: { $gt: 0 },
    expiresAt: { $lte: now },
  });

  let total = 0;
  for (const lot of lots) {
    total += lot.remaining;
    lot.remaining = 0;
    lot.expired = true;
    await lot.save();
  }

  if (total <= 0) return { expired: 0 };

  const user = await User.findById(userId);
  const newBalance = Math.max(0, (user?.ezyCoins ?? 0) - total);
  if (user) {
    user.ezyCoins = newBalance;
    await user.save();
  }

  await WalletTransaction.create({
    userId,
    type: 'debit',
    amount: total,
    reason: 'expiry',
    balanceAfter: newBalance,
    description: `${total} ezy coins expired`,
  });

  return { expired: total, balance: newBalance };
}

// Backfill legacy coins, then expire anything overdue. Call before reading balances.
export async function syncCoins(userId) {
  await backfillLotsIfMissing(userId);
  return expireCoins(userId);
}

export async function grantWelcomeBonus(user) {
  if (user.welcomeBonusGranted) {
    return { awarded: false, balance: user.ezyCoins };
  }

  // Guard against double-granting: only the update that flips the flag proceeds.
  const claimed = await User.findOneAndUpdate(
    { _id: user._id, welcomeBonusGranted: false },
    { welcomeBonusGranted: true },
    { new: true }
  );

  if (!claimed) {
    return { awarded: false, balance: user.ezyCoins };
  }

  const { balance } = await creditCoins(user._id, {
    amount: WELCOME_BONUS,
    reason: 'welcome_bonus',
    description: 'Welcome bonus — 500 ezy coins on first sign-in',
  });

  return { awarded: true, balance, amount: WELCOME_BONUS };
}

export async function creditBookingReward(userId, bookingId) {
  return creditCoins(userId, {
    amount: BOOKING_REWARD,
    reason: 'booking_reward',
    bookingId,
    description: `Booking reward — ${BOOKING_REWARD} ezy coins`,
  });
}

export async function redeemCoins(userId, amount, bookingId) {
  if (amount <= 0) {
    const user = await User.findById(userId);
    return { balance: user?.ezyCoins ?? 0 };
  }

  // Spend soonest-to-expire coins first.
  const lots = await CoinLot.find({
    userId,
    expired: false,
    remaining: { $gt: 0 },
  }).sort({ expiresAt: 1 });

  const available = lots.reduce((sum, lot) => sum + lot.remaining, 0);
  if (available < amount) throw new Error('Insufficient ezy coins');

  let toConsume = amount;
  for (const lot of lots) {
    if (toConsume <= 0) break;
    const take = Math.min(lot.remaining, toConsume);
    lot.remaining -= take;
    toConsume -= take;
    await lot.save();
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { ezyCoins: -amount } },
    { new: true }
  );

  await WalletTransaction.create({
    userId,
    type: 'debit',
    amount,
    reason: 'booking_redemption',
    bookingId,
    balanceAfter: user.ezyCoins,
    description: `Redeemed ${amount} ezy coins on booking`,
  });

  return { balance: user.ezyCoins };
}

export async function getWalletSummary(userId) {
  await syncCoins(userId);

  const user = await User.findById(userId).select('ezyCoins welcomeBonusGranted');
  if (!user) throw new Error('User not found');

  const transactions = await WalletTransaction.find({ userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .select('-__v');

  const activeLots = await CoinLot.find({
    userId,
    expired: false,
    remaining: { $gt: 0 },
  }).sort({ expiresAt: 1 });

  const nextExpiry = activeLots[0]
    ? { amount: activeLots[0].remaining, expiresAt: activeLots[0].expiresAt }
    : null;

  return {
    ezyCoins: user.ezyCoins,
    coinValueInr: 1,
    welcomeBonusGranted: user.welcomeBonusGranted,
    transactions,
    nextExpiry,
  };
}
