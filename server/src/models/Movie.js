const { Schema, model } = require('mongoose');

const MovieSchema = new Schema({
  title: { type: String, required: true },
  releaseDate: { type: String }
}, { timestamps: true });

module.exports = model('Movie', MovieSchema);
