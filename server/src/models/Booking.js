const { Schema, model, Types } = require('mongoose');

const BookingSchema = new Schema({
  userId: { type: String, required: true },
  showId: { type: Types.ObjectId, ref: 'Show', required: true },
  seatLabels: { type: [String], required: true },
  totalAmount: { type: Number, required: true },
  bookedAt: { type: Date, default: () => new Date() }
}, { timestamps: true });

module.exports = model('Booking', BookingSchema);
