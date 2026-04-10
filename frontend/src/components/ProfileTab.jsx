export default function ProfileTab({ careers, userSkills, onToggle }) {
  const allSkills = [...new Set(careers.flatMap(c => Object.keys(c.skills || {})))].sort()
  const top3 = [...careers].sort((a,b)=>b.score-a.score).slice(0,3)

  return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:'28px 24px' }}>
      <h2 style={{ margin:'0 0 6px', fontSize:24, fontWeight:700 }}>Your Skill Profile</h2>
      <p style={{ color:'#555', margin:'0 0 28px', fontSize:14 }}>Toggle skills to update your readiness in real time.</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:28 }}>
        {top3.map((c,i) => (
          <div key={c.slug} style={{ background:'rgba(255,255,255,0.03)', borderRadius:14, border:`1px solid ${c.color}33`, padding:18, position:'relative' }}>
            {i===0 && <div style={{ position:'absolute', top:10, right:10, fontSize:10, background:c.color+'22', color:c.color, padding:'2px 8px', borderRadius:20, fontWeight:600 }}>BEST MATCH</div>}
            <div style={{ fontSize:28, fontWeight:700, color:c.color }}>{c.score}%</div>
            <div style={{ fontSize:13, color:'#ccc', fontWeight:600 }}>{c.label}</div>
            <div style={{ fontSize:11, color:'#444', marginTop:2 }}>{(c.gaps||[]).length} gaps remaining</div>
          </div>
        ))}
      </div>
      <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:16, border:'1px solid rgba(255,255,255,0.07)', padding:24 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'#888', letterSpacing:'0.06em', marginBottom:16 }}>
          ALL SKILLS — {userSkills.length} selected
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {allSkills.map(s => {
            const owned = userSkills.includes(s)
            return (
              <button key={s} onClick={() => onToggle(s)} style={{
                padding:'5px 14px', borderRadius:20, border:`1.5px solid ${owned?'#00C9A7':'rgba(255,255,255,0.1)'}`,
                background: owned?'rgba(0,201,167,0.1)':'rgba(255,255,255,0.03)', color:owned?'#00C9A7':'#777',
                fontSize:12, cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontWeight:owned?600:400
              }}>{owned?'✓ ':''}{s}</button>
            )
          })}
        </div>
      </div>
    </div>
  )
}