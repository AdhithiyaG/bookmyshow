const Movie = require('../models/Movie');

async function listMovies(req, res) {
  const rows = await Movie.find({}).sort({ createdAt: 1 }).lean();
  res.json(rows);
}

module.exports = { listMovies };
