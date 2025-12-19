const Show = require('../models/Show');
const Seat = require('../models/Seat');
const Theater = require('../models/Theater');

async function listTheatersForMovie(req, res) {
  const { movieId } = req.params;
  const shows = await Show.find({ movieId }).lean();
  const theaterIds = [...new Set(shows.map(s => String(s.theaterId)))];
  const theaters = await Theater.find({ _id: { $in: theaterIds } }).lean();
  res.json(theaters);
}

async function listShows(req, res) {
  const { movieId, theaterId } = req.params;
  const shows = await Show.find({ movieId, theaterId }).lean();
  res.json(shows);
}

async function viewSeats(req, res, cache) {
  const { showId } = req.params;
  const key = `seats:${showId}`;
  const cached = await cache.get(key);
  if (cached) return res.json(cached);
  const seats = await Seat.find({ showId }).lean();
  await cache.set(key, seats, 30);
  res.json(seats);
}

module.exports = { listTheatersForMovie, listShows, viewSeats };
