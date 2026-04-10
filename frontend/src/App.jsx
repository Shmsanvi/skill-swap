import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { getReadiness, saveProfile } from './api'
import Auth from './components/Auth'
import Graph from './components/Graph'
import Sidebar from './components/Sidebar'
import ProfileTab from './components/ProfileTab'
import DiscoverTab from './components/DiscoverTab'
import Dashboard from './components/Dashboard'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('graph')
  const [careers, setCareers] = useState([])
  const [userSkills, setUserSkills] = useState([])
  const [selectedCareer, setSelectedCareer] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) refresh()
  }, [session])

  async function refresh() {
    const userId = session.user.id
    // Make sure profile exists first
    await saveProfile(userId, userSkills)
    const res = await getReadiness(userId)
    setCareers(res.data)
    if (!selectedCareer && res.data.length) setSelectedCareer(res.data[0])
    setLoading(false)
  }

  async function handleToggleSkill(skill) {
    const next = userSkills.includes(skill)
      ? userSkills.filter(s => s !== skill)
      : [...userSkills, skill]
    setUserSkills(next)
    await saveProfile(session.user.id, next)
    await refresh()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setSession(null)
    setCareers([])
    setUserSkills([])
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a14', color: '#555', fontFamily: 'DM Sans, sans-serif', fontSize: 16 }}>
      Loading...
    </div>
  )

  if (!session) return <Auth />

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a14', fontFamily: 'DM Sans, sans-serif', color: '#fff' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#7C6FFB,#FC5185)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⬡</div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>Universal Skill-Swap</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['graph', 'profile', 'discover', 'dashboard'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 18px', borderRadius: 8, border: 'none',
              background: tab === t ? 'rgba(124,111,251,0.15)' : 'transparent',
              color: tab === t ? '#7C6FFB' : '#555',
              fontFamily: 'DM Sans, sans-serif', fontSize: 13,
              fontWeight: tab === t ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize'
            }}>{t}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#555' }}>{session.user.email}</span>
          <button onClick={handleLogout} style={{
            padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: '#888', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
          }}>Log out</button>
        </div>
      </div>

      {tab === 'graph' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', height: 'calc(100vh - 65px)' }}>
          <Graph careers={careers} userSkills={userSkills} selectedCareer={selectedCareer} onSelectCareer={setSelectedCareer} />
          <Sidebar career={selectedCareer} userSkills={userSkills} sessionId={session.user.id} onRefresh={refresh} />
        </div>
      )}
      {tab === 'profile' && <ProfileTab careers={careers} userSkills={userSkills} onToggle={handleToggleSkill} sessionId={session.user.id} onRefresh={refresh} />}
      {tab === 'discover' && <DiscoverTab careers={careers} onSelect={c => { setSelectedCareer(c); setTab('graph') }} />}
      {tab === 'dashboard' && <Dashboard userId={session.user.id} careers={careers} userSkills={userSkills} />}
    </div>
  )
}