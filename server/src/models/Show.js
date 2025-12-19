const { Schema, model, Types } = require('mongoose');

const ShowSchema = new Schema({
  movieId: { type: Types.ObjectId, ref: 'Movie', required: true },
  theaterId: { type: Types.ObjectId, ref: 'Theater', required: true },
  screenName: { type: String, required: true },
  startTime: { type: String, required: true }
}, { timestamps: true });

module.exports = model('Show', ShowSchema);
