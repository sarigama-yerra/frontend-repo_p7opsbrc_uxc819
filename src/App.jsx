import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Section({ title, children }) {
  return (
    <div className="bg-white/80 backdrop-blur shadow-sm rounded-xl p-5 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">{title}</h2>
      {children}
    </div>
  )
}

export default function App() {
  const [me, setMe] = useState(null)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')

  // data stores
  const [plans, setPlans] = useState([])
  const [classes, setClasses] = useState([])
  const [workouts, setWorkouts] = useState([])
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    loadBasics()
  }, [])

  async function loadBasics() {
    const [pRes, cRes] = await Promise.all([
      fetch(`${API}/plans`).then(r => r.json()),
      fetch(`${API}/classes`).then(r => r.json()),
    ])
    setPlans(pRes.plans || [])
    setClasses(cRes.classes || [])
  }

  async function login() {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, full_name: fullName }),
    })
    const data = await res.json()
    if (res.ok) setMe(data.member)
    else alert(data.detail || 'Login failed')
  }

  async function createWorkout() {
    if (!me) return alert('Login first')
    const date = new Date().toISOString().slice(0, 10)
    const payload = { member_id: me._id, date, workout_name: 'Full Body', duration_minutes: 45 }
    const res = await fetch(`${API}/workouts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const out = await res.json()
    if (res.ok) {
      const ls = await fetch(`${API}/workouts?member_id=${me._id}`).then(r => r.json())
      setWorkouts(ls.workouts || [])
    } else alert(out.detail || 'Failed to add workout')
  }

  async function bookFirstClass() {
    if (!me) return alert('Login first')
    if (!classes.length) return alert('No classes available')
    const res = await fetch(`${API}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ member_id: me._id, class_id: classes[0]._id }) })
    const out = await res.json()
    if (res.ok) {
      const ls = await fetch(`${API}/bookings?member_id=${me._id}`).then(r => r.json())
      setBookings(ls.bookings || [])
    } else alert(out.detail || 'Failed to book')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Gym Manager</h1>
          <span className="text-xs text-gray-500">API: {API}</span>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <Section title="Quick Login / Sign up">
            <div className="space-y-3">
              <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded px-3 py-2" />
              <input placeholder="Full name (if new)" value={fullName} onChange={e=>setFullName(e.target.value)} className="w-full border rounded px-3 py-2" />
              <button onClick={login} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Continue</button>
              {me && (
                <div className="text-sm text-gray-700">Logged in as <span className="font-medium">{me.full_name}</span></div>
              )}
            </div>
          </Section>

          <Section title="Plans">
            <div className="space-y-3">
              {plans.length ? (
                plans.map(p => (
                  <div key={p._id} className="p-3 rounded border flex items-center justify-between">
                    <div>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-sm text-gray-500">${'{'}p.price{'}'} / {p.duration_months} mo</div>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{p.access_level}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No plans yet</div>
              )}
            </div>
          </Section>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Section title="Classes">
            <div className="space-y-3">
              {classes.length ? classes.map(c => (
                <div key={c._id} className="p-3 rounded border">
                  <div className="font-medium">{c.title}</div>
                  <div className="text-xs text-gray-500">{c.start_time} → {c.end_time}</div>
                </div>
              )) : <div className="text-gray-500">No classes yet</div>}
              <button onClick={bookFirstClass} className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">Book first class</button>
              {!!bookings.length && <div className="text-sm text-gray-600">Bookings: {bookings.length}</div>}
            </div>
          </Section>

          <Section title="Workout Log">
            <div className="space-y-3">
              <button onClick={createWorkout} className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">Add sample workout</button>
              <div className="space-y-2 max-h-56 overflow-auto pr-2">
                {workouts.length ? workouts.map(w => (
                  <div key={w._id} className="p-3 rounded border">
                    <div className="font-medium">{w.workout_name}</div>
                    <div className="text-xs text-gray-500">{w.date} • {w.duration_minutes} min</div>
                  </div>
                )) : <div className="text-gray-500">No workouts yet</div>}
              </div>
            </div>
          </Section>
        </div>

        <footer className="pt-6 text-center text-xs text-gray-500">Built with Flames</footer>
      </div>
    </div>
  )
}
