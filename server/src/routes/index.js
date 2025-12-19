const express = require('express');
const { listMovies } = require('../controllers/movies');
const { listTheatersForMovie, listShows, viewSeats } = require('../controllers/shows');
const { createHold, confirm, cancel } = require('../controllers/bookings');

function buildRouter(cache) {
  const r = express.Router();
  r.get('/movies', listMovies);
  r.get('/movies/:movieId/theaters', listTheatersForMovie);
  r.get('/movies/:movieId/theaters/:theaterId/shows', listShows);
  r.get('/shows/:showId/seats', (req, res) => viewSeats(req, res, cache));
  r.post('/shows/:showId/hold', express.json(), (req, res) => createHold(req, res, cache));
  r.post('/holds/:holdId/confirm', (req, res) => confirm(req, res, cache));
  r.post('/holds/:holdId/cancel', (req, res) => cancel(req, res, cache));
  return r;
}

module.exports = { buildRouter };
