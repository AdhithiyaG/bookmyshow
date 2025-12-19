const Movie = require('./models/Movie');
const Theater = require('./models/Theater');
const Show = require('./models/Show');
const Seat = require('./models/Seat');

async function seed() {
  await Promise.all([
    Movie.deleteMany({}), Theater.deleteMany({}), Show.deleteMany({}), Seat.deleteMany({})
  ]);

  const m1 = await Movie.create({ title: 'Interstellar', releaseDate: '2014-11-07' });
  const m2 = await Movie.create({ title: 'Inception', releaseDate: '2010-07-16' });

  const t1 = await Theater.create({ name: 'Downtown Cinemas', address: 'Main Street' });
  const t2 = await Theater.create({ name: 'Uptown Multiplex', address: 'High Street' });

  const s1 = await Show.create({ movieId: m1._id, theaterId: t1._id, screenName: 'Screen 1 (Dolby)', startTime: '18:00' });
  const s2 = await Show.create({ movieId: m1._id, theaterId: t1._id, screenName: 'Screen 2 (IMAX)', startTime: '21:00' });
  const s3 = await Show.create({ movieId: m2._id, theaterId: t2._id, screenName: 'Screen 1', startTime: '20:00' });

  async function buildSeats(show, rows, cols, basePrice) {
    const docs = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const type = (r < rows - 1) ? 'Regular' : 'Premium';
        const price = basePrice + ((r === rows - 1) ? 50 : 0);
        const row = String.fromCharCode('A'.charCodeAt(0) + r);
        const seatLabel = `${row}${c}`;
        docs.push({ showId: show._id, seatLabel, row, col: c, type, price });
      }
    }
    await Seat.insertMany(docs);
  }

  await buildSeats(s1, 3, 6, 200);
  await buildSeats(s2, 4, 8, 250);
  await buildSeats(s3, 3, 6, 200);

  return { movies: [m1, m2] };
}

module.exports = { seed };
