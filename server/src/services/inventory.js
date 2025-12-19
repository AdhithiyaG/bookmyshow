const mongoose = require('mongoose');
const Seat = require('../models/Seat');
const SeatHold = require('../models/SeatHold');
const Booking = require('../models/Booking');
const { v4: uuidv4 } = require('uuid');
const cfg = require('../config');

function sumPrices(seats) { return seats.reduce((s, x) => s + x.price, 0); }

async function holdSeats(showId, seatLabels, userId, cache) {
  const session = await mongoose.startSession();
  const holdId = uuidv4();
  const expiresAt = new Date(Date.now() + cfg.holdTtlSeconds * 1000);

  try {
    await session.withTransaction(async () => {
      const seats = await Seat.find({ showId, seatLabel: { $in: seatLabels } }).session(session).lean();
      if (seats.length !== seatLabels.length) throw new Error('Some seats do not exist');

      const res = await Seat.updateMany(
        { showId, seatLabel: { $in: seatLabels }, status: 'AVAILABLE' },
        { $set: { status: 'HELD', holdId, holdExpiresAt: expiresAt } }
      ).session(session);

      if (res.matchedCount !== seatLabels.length) throw new Error('Some seats are already held or booked');

      await SeatHold.create([{ holdId, userId, showId, seatLabels, expiresAt }], { session });
    });
  } catch (e) {
    // Fallback path when transactions are not supported (e.g., non-replica local Mongo)
    if (/replica set|transaction/i.test(String(e?.message))) {
      const seats = await Seat.find({ showId, seatLabel: { $in: seatLabels } }).lean();
      if (seats.length !== seatLabels.length) throw new Error('Some seats do not exist');
      const res = await Seat.updateMany(
        { showId, seatLabel: { $in: seatLabels }, status: 'AVAILABLE' },
        { $set: { status: 'HELD', holdId, holdExpiresAt: expiresAt } }
      );
      const changed = Number(res.modifiedCount ?? res.nModified ?? 0);
      if (changed !== seatLabels.length) throw new Error('Some seats are already held or booked');
      await SeatHold.create({ holdId, userId, showId, seatLabels, expiresAt });
    } else {
      throw e;
    }
  } finally {
    session.endSession();
  }

  if (cache) await cache.del(`seats:${showId}`); // invalidate cache

  return { holdId, expiresAt };
}

async function confirmHold(holdId, cache) {
  const hold = await SeatHold.findOne({ holdId });
  if (!hold) throw new Error('Hold not found');
  if (hold.expiresAt.getTime() < Date.now()) throw new Error('Hold expired');

  const session = await mongoose.startSession();
  let bookingDoc = null;

  try {
    await session.withTransaction(async () => {
      const seats = await Seat.find({ showId: hold.showId, seatLabel: { $in: hold.seatLabels } }).session(session);
      const total = sumPrices(seats);

      const res = await Seat.updateMany(
        { showId: hold.showId, seatLabel: { $in: hold.seatLabels }, status: 'HELD', holdId: hold.holdId },
        { $set: { status: 'BOOKED' }, $unset: { holdId: 1, holdExpiresAt: 1 } }
      ).session(session);

      if (res.matchedCount !== hold.seatLabels.length) throw new Error('Some seats are not in held state');

      bookingDoc = await Booking.create([{ userId: hold.userId, showId: hold.showId, seatLabels: hold.seatLabels, totalAmount: total }], { session });

      await SeatHold.deleteOne({ holdId: hold.holdId }).session(session);
    });
  } catch (e) {
    if (/replica set|transaction/i.test(String(e?.message))) {
      const seats = await Seat.find({ showId: hold.showId, seatLabel: { $in: hold.seatLabels } });
      const total = sumPrices(seats);
      const res = await Seat.updateMany(
        { showId: hold.showId, seatLabel: { $in: hold.seatLabels }, status: 'HELD', holdId: hold.holdId },
        { $set: { status: 'BOOKED' }, $unset: { holdId: 1, holdExpiresAt: 1 } }
      );
      const changed = Number(res.modifiedCount ?? res.nModified ?? 0);
      if (changed !== hold.seatLabels.length) throw new Error('Some seats are not in held state');
      bookingDoc = await Booking.create({ userId: hold.userId, showId: hold.showId, seatLabels: hold.seatLabels, totalAmount: total });
      await SeatHold.deleteOne({ holdId: hold.holdId });
    } else {
      throw e;
    }
  } finally {
    session.endSession();
  }

  if (cache) await cache.del(`seats:${hold.showId}`);

  return bookingDoc?.[0] || null;
}

async function cancelHold(holdId, cache) {
  const hold = await SeatHold.findOne({ holdId });
  if (!hold) return { ok: true };

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await Seat.updateMany(
        { showId: hold.showId, seatLabel: { $in: hold.seatLabels }, status: 'HELD', holdId: hold.holdId },
        { $set: { status: 'AVAILABLE' }, $unset: { holdId: 1, holdExpiresAt: 1 } }
      ).session(session);
      await SeatHold.deleteOne({ holdId: hold.holdId }).session(session);
    });
  } catch (e) {
    if (/replica set|transaction/i.test(String(e?.message))) {
      await Seat.updateMany(
        { showId: hold.showId, seatLabel: { $in: hold.seatLabels }, status: 'HELD', holdId: hold.holdId },
        { $set: { status: 'AVAILABLE' }, $unset: { holdId: 1, holdExpiresAt: 1 } }
      );
      await SeatHold.deleteOne({ holdId: hold.holdId });
    } else {
      throw e;
    }
  } finally {
    session.endSession();
  }

  if (cache) await cache.del(`seats:${hold.showId}`);

  return { ok: true };
}

module.exports = { holdSeats, confirmHold, cancelHold };
