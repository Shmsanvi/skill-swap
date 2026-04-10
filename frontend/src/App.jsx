import { useState, useEffect } from 'react'
import { getProfile, saveProfile, getReadiness } from './api'
import Graph from './components/Graph'
import Sidebar from './components/Sidebar'
import ProfileTab from './components/ProfileTab'
import DiscoverTab from './components/DiscoverTab'

function getSessionId() {
  let id = localStorage.getItem('skillswap-session')
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('skillswap-session', id) }
  return id
}

export default function App() {
  const [tab, setTab] = useState('graph')
  const [careers, setCareers] = useState([])
  const [userSkills, setUserSkills] = useState([])
  const [selectedCareer, setSelectedCareer] = useState(null)
  const [loading, setLoading] = useState(true)
  const sessionId = getSessionId()

  async function refresh() {
    const [profileRes, readinessRes] = await Promise.all([
      getProfile(sessionId),
      getReadiness(sessionId)
    ])
    setUserSkills(profileRes.data.skills || [])
    setCareers(readinessRes.data)
    if (!selectedCareer && readinessRes.data.length) setSelectedCareer(readinessRes.data[0])
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  async function handleToggleSkill(skill) {
    const next = userSkills.includes(skill)
      ? userSkills.filter(s => s !== skill)
      : [...userSkills, skill]
    setUserSkills(next)
    await saveProfile(sessionId, next)
    await refresh()
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a14', color: '#555', fontFamily: 'DM Sans, sans-serif' }}>
      Loading Skill-Swap...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a14', fontFamily: 'DM Sans, sans-serif', color: '#fff' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#7C6FFB,#FC5185)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⬡</div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>Universal Skill-Swap</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['graph','profile','discover'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 18px', borderRadius: 8, border: 'none', background: tab === t ? 'rgba(124,111,251,0.15)' : 'transparent',
              color: tab === t ? '#7C6FFB' : '#555', fontFamily: 'DM Sans, sans-serif', fontSize: 13,
              fontWeight: tab === t ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize'
            }}>{t}</button>
          ))}
        </div>
      </div>

      {tab === 'graph' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', height: 'calc(100vh - 65px)' }}>
          <Graph careers={careers} userSkills={userSkills} selectedCareer={selectedCareer} onSelectCareer={setSelectedCareer} />
          <Sidebar career={selectedCareer} userSkills={userSkills} sessionId={sessionId} onRefresh={refresh} />
        </div>
      )}
      {tab === 'profile' && <ProfileTab careers={careers} userSkills={userSkills} onToggle={handleToggleSkill} sessionId={sessionId} onRefresh={refresh} />}
      {tab === 'discover' && <DiscoverTab careers={careers} onSelect={c => { setSelectedCareer(c); setTab('graph') }} />}
    </div>
  )
}