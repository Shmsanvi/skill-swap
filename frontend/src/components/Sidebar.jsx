import { useState } from 'react'
import { addConnection, getRoadmap } from '../api'

function RadialScore({ score, color }) {
  const r=52, circ=2*Math.PI*r, offset=circ-(score/100)*circ
  return (
    <svg width="136" height="136" viewBox="0 0 136 136" style={{transform:'rotate(-90deg)'}}>
      <circle cx="68" cy="68" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
      <circle cx="68" cy="68" r={r} fill="none" stroke={color} strokeWidth="10" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{transition:'stroke-dashoffset 0.8s ease'}}/>
      <text x="68" y="68" dominantBaseline="central" textAnchor="middle" style={{fill:'#fff',fontSize:26,fontWeight:700,fontFamily:'DM Sans,sans-serif',transform:'rotate(90deg)',transformOrigin:'68px 68px'}}>{score}%</text>
      <text x="68" y="90" dominantBaseline="central" textAnchor="middle" style={{fill:'rgba(255,255,255,0.4)',fontSize:11,fontFamily:'DM Sans,sans-serif',transform:'rotate(90deg)',transformOrigin:'68px 68px'}}>READY</text>
    </svg>
  )
}

export default function Sidebar({ career, userSkills, sessionId, onRefresh }) {
  const [roadmap, setRoadmap] = useState('')
  const [loadingAI, setLoadingAI] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [newImpact, setNewImpact] = useState(0.7)

  if (!career) return null

  const matched = userSkills.filter(s => career.skills?.[s])
  const gaps = career.gaps || []

  async function fetchRoadmap() {
    setLoadingAI(true); setRoadmap('')
    const res = await getRoadmap({ career_label: career.label, user_skills: userSkills, gaps: gaps.slice(0,3).map(g=>g.skill), score: career.score })
    setRoadmap(res.data.roadmap); setLoadingAI(false)
  }

  async function handleAddConn() {
    if (!newSkill.trim()) return
    await addConnection({ session_id: sessionId, skill: newSkill.trim(), career_slug: career.slug, impact: newImpact })
    setNewSkill(''); await onRefresh()
  }

  return (
    <div style={{ overflowY:'auto', padding:'16px 20px 24px', borderLeft:'1px solid rgba(255,255,255,0.06)' }}>
      {/* Score card */}
      <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:16, border:'1px solid rgba(255,255,255,0.07)', padding:20, marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
          <div style={{ width:12, height:12, borderRadius:'50%', background:career.color }}/>
          <div><div style={{ fontWeight:700, fontSize:15 }}>{career.label}</div><div style={{ color:'#555', fontSize:12 }}>readiness score</div></div>
        </div>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:14 }}><RadialScore score={career.score} color={career.color}/></div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <div style={{ background:'rgba(0,201,167,0.06)', borderRadius:10, padding:'12px 14px', border:'1px solid rgba(0,201,167,0.15)' }}>
            <div style={{ fontSize:22, fontWeight:700, color:'#00C9A7' }}>{matched.length}</div>
            <div style={{ fontSize:11, color:'#555' }}>Skills matched</div>
          </div>
          <div style={{ background:'rgba(252,81,133,0.06)', borderRadius:10, padding:'12px 14px', border:'1px solid rgba(252,81,133,0.15)' }}>
            <div style={{ fontSize:22, fontWeight:700, color:'#FC5185' }}>{gaps.length}</div>
            <div style={{ fontSize:11, color:'#555' }}>Gaps remaining</div>
          </div>
        </div>
      </div>

      {/* Gaps */}
      {gaps.length > 0 && (
        <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:16, border:'1px solid rgba(255,255,255,0.07)', padding:20, marginBottom:14 }}>
          <div style={{ fontSize:12, fontWeight:600, color:'#888', letterSpacing:'0.06em', marginBottom:12 }}>TOP GAPS TO CLOSE</div>
          {gaps.slice(0,5).map(g => (
            <div key={g.skill} style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:12, color:'#ccc' }}>{g.skill}</span>
                <span style={{ fontSize:11, color:career.color, fontFamily:'DM Mono,monospace' }}>+{g.impact}%</span>
              </div>
              <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:3 }}>
                <div style={{ height:'100%', width:g.impact+'%', background:career.color, borderRadius:3, transition:'width 0.7s ease' }}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Coach */}
      <div style={{ background:'rgba(124,111,251,0.06)', borderRadius:14, border:'1px solid rgba(124,111,251,0.25)', padding:16, marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <span style={{ color:'#7C6FFB', fontSize:12, fontWeight:600, letterSpacing:'0.05em' }}>✦ AI COACH</span>
          <button onClick={fetchRoadmap} disabled={loadingAI} style={{ padding:'5px 14px', borderRadius:20, border:'1px solid #7C6FFB', background:'transparent', color:'#7C6FFB', fontSize:12, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
            {loadingAI ? 'Thinking...' : 'Get roadmap →'}
          </button>
        </div>
        {roadmap ? <p style={{ color:'#ccc', fontSize:13, lineHeight:1.6, margin:0 }}>{roadmap}</p>
          : <p style={{ color:'#444', fontSize:12, margin:0 }}>Get a personalized 3-step plan powered by Claude AI.</p>}
      </div>

      {/* Add custom connection */}
      <div style={{ background:'rgba(255,255,255,0.02)', borderRadius:14, border:'1px dashed rgba(255,255,255,0.1)', padding:16 }}>
        <div style={{ fontSize:12, fontWeight:600, color:'#888', letterSpacing:'0.06em', marginBottom:12 }}>+ ADD SKILL CONNECTION</div>
        <input value={newSkill} onChange={e=>setNewSkill(e.target.value)} placeholder={`New skill for ${career.label}...`}
          style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'#fff', fontSize:13, fontFamily:'DM Sans,sans-serif', boxSizing:'border-box', marginBottom:10 }}/>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
          <span style={{ fontSize:12, color:'#666', whiteSpace:'nowrap' }}>Impact: {Math.round(newImpact*100)}%</span>
          <input type="range" min={0.1} max={1} step={0.05} value={newImpact} onChange={e=>setNewImpact(+e.target.value)} style={{ flex:1, accentColor:'#7C6FFB' }}/>
        </div>
        <button onClick={handleAddConn} style={{ width:'100%', padding:'9px 0', borderRadius:8, border:'none', background:'#7C6FFB', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
          Add Connection
        </button>
      </div>
    </div>
  )
}