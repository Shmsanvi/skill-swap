export default function DiscoverTab({ careers, onSelect }) {
  return (
    <div style={{ maxWidth:900, margin:'0 auto', padding:'28px 24px' }}>
      <h2 style={{ margin:'0 0 6px', fontSize:24, fontWeight:700 }}>Career Pathway Explorer</h2>
      <p style={{ color:'#555', margin:'0 0 24px', fontSize:14 }}>All careers ranked by your current readiness.</p>
      <div style={{ display:'grid', gap:10 }}>
        {[...careers].sort((a,b)=>b.score-a.score).map((c,i) => {
          const matched = Object.keys(c.skills||{}).filter(s => (c.gaps||[]).every(g=>g.skill!==s))
          const gaps = (c.gaps||[]).slice(0,3)
          return (
            <div key={c.slug} onClick={() => onSelect(c)}
              style={{ display:'grid', gridTemplateColumns:'52px 1fr auto', alignItems:'center', gap:16, padding:18, background:'rgba(255,255,255,0.03)', borderRadius:14, border:`1px solid rgba(255,255,255,${i===0?'0.12':'0.06'})`, cursor:'pointer' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:700, color:c.color }}>{c.score}%</div>
                <div style={{ fontSize:10, color:'#444' }}>#{i+1}</div>
              </div>
              <div>
                <div style={{ fontWeight:600, fontSize:15, marginBottom:6 }}>{c.label}</div>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                  {matched.slice(0,3).map(s=><span key={s} style={{ fontSize:10, padding:'2px 8px', borderRadius:10, background:'rgba(0,201,167,0.1)', color:'#00C9A7', border:'1px solid rgba(0,201,167,0.2)' }}>✓ {s}</span>)}
                  {gaps.map(g=><span key={g.skill} style={{ fontSize:10, padding:'2px 8px', borderRadius:10, background:'rgba(255,255,255,0.04)', color:'#555', border:'1px solid rgba(255,255,255,0.07)' }}>+ {g.skill}</span>)}
                </div>
              </div>
              <div style={{ fontSize:11, color:'#7C6FFB', fontWeight:600 }}>Explore →</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}