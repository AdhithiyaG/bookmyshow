const { Schema, model, Types } = require('mongoose');

const SeatHoldSchema = new Schema({
  holdId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  showId: { type: Types.ObjectId, ref: 'Show', required: true },
  seatLabels: { type: [String], required: true },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

SeatHoldSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto-clean after expiry

module.exports = model('SeatHold', SeatHoldSchema);
