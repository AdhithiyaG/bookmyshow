import React, { useEffect, useMemo, useState } from 'react'
import { getMovies, getTheaters, getShows, getSeats, createHold, confirmHold, cancelHold } from './api/client'

function Legend() {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="badge badge-info">Available</span>
      <span className="badge badge-warn">Held</span>
      <span className="badge badge-danger">Booked</span>
      <span className="badge" style={{ background: '#1f4fff', color: 'white' }}>Selected</span>
    </div>
  )
}

export default function App() {
  const [movies, setMovies] = useState([])
  const [movie, setMovie] = useState('')
  const [theaters, setTheaters] = useState([])
  const [theater, setTheater] = useState('')
  const [shows, setShows] = useState([])
  const [show, setShow] = useState('')
  const [seats, setSeats] = useState([])
  const [selected, setSelected] = useState([])
  const [hold, setHold] = useState(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { setLoading(true); getMovies().then(setMovies).finally(() => setLoading(false)) }, [])
  useEffect(() => { if (movie) getTheaters(movie).then(setTheaters); setTheater(''); setShows([]); setShow(''); setSeats([]); setSelected([]) }, [movie])
  useEffect(() => { if (movie && theater) getShows(movie, theater).then(setShows); setShow(''); setSeats([]); setSelected([]) }, [theater])
  useEffect(() => { if (show) getSeats(show).then(setSeats); setSelected([]) }, [show])

  const maxCols = useMemo(() => (seats.reduce((m, s) => Math.max(m, s.col || 0), 0) || 10), [seats])

  function toggleSeat(s) {
    if (s.status !== 'AVAILABLE') return
    setSelected(prev => prev.includes(s.seatLabel) ? prev.filter(x => x !== s.seatLabel) : [...prev, s.seatLabel])
  }

  async function doHold() {
    setStatus('')
    try {
      const h = await createHold(show, { userId: 'demo-user', seatLabels: selected })
      setHold(h)
      setStatus(`Hold created. Expires at ${new Date(h.expiresAt).toLocaleTimeString()}`)
      setSeats(await getSeats(show))
      setSelected([])
    } catch (e) { setStatus('Hold failed: ' + e.message) }
  }

  async function doConfirm() {
    if (!hold) return
    try {
      await confirmHold(hold.holdId)
      setStatus('Booking confirmed')
      setSeats(await getSeats(show))
      setHold(null)
    } catch (e) { setStatus('Confirm failed: ' + e.message) }
  }

  async function doCancel() {
    if (!hold) return
    try {
      await cancelHold(hold.holdId)
      setStatus('Hold cancelled')
      setSeats(await getSeats(show))
      setHold(null)
    } catch (e) { setStatus('Cancel failed: ' + e.message) }
  }

  return (
    <div>
      {/* Header */}
      <header className="bg-gradient-to-r from-brand-500 to-indigo-600 text-white shadow">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">BookMyShow LLD</h1>
          <button className="btn btn-secondary" onClick={() => window.fetch(`${import.meta.env.VITE_API_URL}/admin/seed`, { method: 'POST' }).then(() => getMovies().then(setMovies))}>Seed Demo Data</button>
        </div>
      </header>

      <main className="container space-y-6 py-6">
        {/* Controls */}
        <div className="card">
          <div className="card-header">Find a show</div>
          <div className="card-body">
            <div className="flex flex-wrap gap-3 items-center">
              <select className="select" value={movie} onChange={e => setMovie(e.target.value)}>
                <option value="">Select Movie</option>
                {movies.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
              </select>

              <select className="select" value={theater} onChange={e => setTheater(e.target.value)} disabled={!movie}>
                <option value="">Select Theater</option>
                {theaters.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>

              <select className="select" value={show} onChange={e => setShow(e.target.value)} disabled={!theater}>
                <option value="">Select Show</option>
                {shows.map(s => <option key={s._id} value={s._id}>{s.screenName} @ {s.startTime}</option>)}
              </select>

              {loading && <span className="badge badge-info">Loading...</span>}
            </div>
          </div>
        </div>

        {/* Status */}
        {status && (
          <div className="card">
            <div className="card-body">
              <div className="badge badge-info">{status}</div>
            </div>
          </div>
        )}

        {/* Seats */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <span>Seats</span>
            <Legend />
          </div>
          <div className="card-body">
            <div className="grid" style={{ gridTemplateColumns: `repeat(${maxCols}, 40px)`, gap: 8 }}>
              {seats.map(s => {
                const isSelected = selected.includes(s.seatLabel)
                const bg = isSelected ? 'bg-brand-500 text-white' : s.status === 'AVAILABLE' ? 'bg-gray-200 dark:bg-gray-700' : s.status === 'HELD' ? 'bg-yellow-300 dark:bg-yellow-600' : 'bg-red-500 text-white'
                const canClick = s.status === 'AVAILABLE' || isSelected
                return (
                  <button key={s.seatLabel}
                    onClick={() => canClick && toggleSeat(s)}
                    className={`w-10 h-10 rounded text-xs font-medium border border-gray-400 dark:border-gray-600 ${bg}`}
                    title={`${s.seatLabel} - ${s.status} - ${s.price}`}
                  >{s.seatLabel}</button>
                )
              })}
            </div>
            <div className="mt-4 flex gap-2">
              <button className="btn btn-primary" onClick={doHold} disabled={!show || selected.length === 0}>Hold Selected</button>
              <button className="btn btn-secondary" onClick={doConfirm} disabled={!hold}>Confirm Hold</button>
              <button className="btn btn-danger" onClick={doCancel} disabled={!hold}>Cancel Hold</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
