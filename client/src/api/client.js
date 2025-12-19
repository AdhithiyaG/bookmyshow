const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function api(path, opts = {}) {
  const res = await fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const getMovies = () => api('/movies');
export const getTheaters = (movieId) => api(`/movies/${movieId}/theaters`);
export const getShows = (movieId, theaterId) => api(`/movies/${movieId}/theaters/${theaterId}/shows`);
export const getSeats = (showId) => api(`/shows/${showId}/seats`);
export const createHold = (showId, body) => api(`/shows/${showId}/hold`, { method: 'POST', body: JSON.stringify(body) });
export const confirmHold = (holdId) => api(`/holds/${holdId}/confirm`, { method: 'POST' });
export const cancelHold = (holdId) => api(`/holds/${holdId}/cancel`, { method: 'POST' });

export const getApiInfo = () => api('/');
