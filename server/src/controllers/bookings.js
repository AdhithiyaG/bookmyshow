const mongoose = require('mongoose');
const { holdSeats, confirmHold, cancelHold } = require('../services/inventory');

async function createHold(req, res, cache) {
  const { showId } = req.params;
  const { userId, seatLabels } = req.body;
  if (!Array.isArray(seatLabels) || seatLabels.length === 0) return res.status(400).json({ error: 'seatLabels required' });
  if (!userId) return res.status(400).json({ error: 'userId required' });
  const showObjectId = new mongoose.Types.ObjectId(showId);
  try {
    const hold = await holdSeats(showObjectId, seatLabels, userId, cache);
    res.status(201).json(hold);
  } catch (e) {
    res.status(409).json({ error: e.message || 'Failed to hold seats' });
  }
}

async function confirm(req, res, cache) {
  const { holdId } = req.params;
  try {
    const booking = await confirmHold(holdId, cache);
    res.json(booking);
  } catch (e) {
    res.status(400).json({ error: e.message || 'Failed to confirm hold' });
  }
}

async function cancel(req, res, cache) {
  const { holdId } = req.params;
  try {
    const out = await cancelHold(holdId, cache);
    res.json(out);
  } catch (e) {
    res.status(400).json({ error: e.message || 'Failed to cancel hold' });
  }
}

module.exports = { createHold, confirm, cancel };
