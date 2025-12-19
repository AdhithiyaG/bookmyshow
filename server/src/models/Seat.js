const { Schema, model, Types } = require('mongoose');

const SeatSchema = new Schema({
  showId: { type: Types.ObjectId, ref: 'Show', index: true, required: true },
  seatLabel: { type: String, required: true }, // e.g., A1
  row: { type: String, required: true },
  col: { type: Number, required: true },
  type: { type: String, enum: ['Regular', 'Premium'], default: 'Regular' },
  price: { type: Number, required: true },
  status: { type: String, enum: ['AVAILABLE', 'HELD', 'BOOKED'], default: 'AVAILABLE', index: true },
  holdId: { type: String, default: null, index: true },
  holdExpiresAt: { type: Date, default: null }
}, { timestamps: true });

SeatSchema.index({ showId: 1, seatLabel: 1 }, { unique: true });

module.exports = model('Seat', SeatSchema);
