const { Schema, model } = require('mongoose');

const TheaterSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, default: '' }
}, { timestamps: true });

module.exports = model('Theater', TheaterSchema);
