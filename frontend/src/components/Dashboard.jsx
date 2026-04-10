export default function Dashboard({ careers, userSkills }) {
  const sorted = [...careers].sort((a, b) => b.score - a.score)
  const top = sorted[0]
  const allSkills = [...new Set(careers.flatMap(c => Object.keys(c.skills || {})))]
  const owned = allSkills.filter(s => userSkills.includes(s))

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <h2 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 700 }}>Your Dashboard</h2>
      <p style={{ color: '#555', margin: '0 0 32px', fontSize: 14 }}>Your career readiness at a glance.</p>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Skills you have', value: owned.length, color: '#00C9A7' },
          { label: 'Best match score', value: (top?.score || 0) + '%', color: '#7C6FFB' },
          { label: 'Careers tracked', value: careers.length, color: '#F7B731' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', padding: 24 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Best match */}
      {top && (
        <div style={{ background: `rgba(${top.color}, 0.06)`, borderRadius: 16, border: `1px solid ${top.color}33`, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#888', letterSpacing: '0.06em', marginBottom: 12 }}>🏆 YOUR BEST CAREER MATCH</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 48, fontWeight: 700, color: top.color }}>{top.score}%</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{top.label}</div>
              <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>Only {(top.gaps || []).length} skills away from being highly qualified</div>
            </div>
          </div>
        </div>
      )}

      {/* All careers progress */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#888', letterSpacing: '0.06em', marginBottom: 20 }}>ALL CAREER READINESS</div>
        {sorted.map(c => (
          <div key={c.slug} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: '#ccc', fontWeight: 500 }}>{c.label}</span>
              <span style={{ fontSize: 13, color: c.color, fontFamily: 'DM Mono, monospace', fontWeight: 600 }}>{c.score}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>
              <div style={{ height: '100%', width: c.score + '%', background: c.color, borderRadius: 4, transition: 'width 0.8s ease' }}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}