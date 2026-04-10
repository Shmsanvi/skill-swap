import { useEffect, useRef } from 'react'

export default function Graph({ careers, userSkills, selectedCareer, onSelectCareer }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({ nodes: [], dragging: null, hovered: null })
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !careers.length) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio
      canvas.height = canvas.offsetHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    const w = () => canvas.offsetWidth
    const h = () => canvas.offsetHeight

    // Build nodes
    const allSkills = [...new Set(careers.flatMap(c => Object.keys(c.skills)))]
    const careerNodes = careers.map((c, i) => {
      const a = (i / careers.length) * Math.PI * 2 - Math.PI / 2
      const r = Math.min(w(), h()) * 0.33
      return { id: c.slug, label: c.label, type: 'career', x: w()/2 + Math.cos(a)*r, y: h()/2 + Math.sin(a)*r, vx: 0, vy: 0, color: c.color, score: c.score, radius: 32, career: c }
    })
    const skillNodes = allSkills.map((s, i) => {
      const a = (i / allSkills.length) * Math.PI * 2
      const r = Math.min(w(), h()) * 0.15
      return { id: s, label: s, type: 'skill', x: w()/2 + Math.cos(a)*r + (Math.random()-.5)*30, y: h()/2 + Math.sin(a)*r + (Math.random()-.5)*30, vx: 0, vy: 0, owned: userSkills.includes(s), radius: userSkills.includes(s) ? 13 : 9 }
    })
    stateRef.current.nodes = [...careerNodes, ...skillNodes]

    const edges = careers.flatMap(c =>
      Object.entries(c.skills).map(([skill, weight]) => ({
        source: c.slug, target: skill, weight, owned: userSkills.includes(skill)
      }))
    )

    function simulate() {
      const nodes = stateRef.current.nodes
      nodes.forEach(n => { n.vx *= 0.85; n.vy *= 0.85 })
      for (let i = 0; i < nodes.length; i++)
        for (let j = i+1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]
          const dx = b.x-a.x, dy = b.y-a.y, d = Math.sqrt(dx*dx+dy*dy)||1
          const min = a.type==='career'&&b.type==='career' ? 140 : 65
          if (d < min) { const f=(min-d)/d*0.4; a.vx-=dx*f; a.vy-=dy*f; b.vx+=dx*f; b.vy+=dy*f }
        }
      edges.forEach(e => {
        const s = nodes.find(n=>n.id===e.source), t = nodes.find(n=>n.id===e.target)
        if (!s||!t) return
        const dx=t.x-s.x, dy=t.y-s.y, d=Math.sqrt(dx*dx+dy*dy)||1
        const ideal = 130, f=(d-ideal)/d*0.06*e.weight
        s.vx+=dx*f; s.vy+=dy*f; t.vx-=dx*f; t.vy-=dy*f
      })
      nodes.forEach(n => {
        if (n===stateRef.current.dragging) return
        n.vx+=(w()/2-n.x)*0.005; n.vy+=(h()/2-n.y)*0.004
        n.x+=n.vx; n.y+=n.vy
        n.x=Math.max(n.radius+4, Math.min(w()-n.radius-4, n.x))
        n.y=Math.max(n.radius+4, Math.min(h()-n.radius-4, n.y))
      })
    }

    function draw() {
      const nodes = stateRef.current.nodes
      ctx.clearRect(0, 0, w(), h())
      edges.forEach(e => {
        const s=nodes.find(n=>n.id===e.source), t=nodes.find(n=>n.id===e.target)
        if(!s||!t) return
        const isSel = selectedCareer && s.id===selectedCareer.slug
        ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(t.x,t.y)
        ctx.strokeStyle = e.owned ? (isSel?'#00C9A7':'rgba(0,201,167,0.2)') : (isSel?'rgba(255,255,255,0.25)':'rgba(255,255,255,0.04)')
        ctx.lineWidth = isSel ? e.weight*2.5 : e.weight*1.2; ctx.stroke()
      })
      nodes.forEach(n => {
        const hov = stateRef.current.hovered===n
        const sel = selectedCareer && n.id===selectedCareer.slug
        ctx.save()
        if (n.type==='career') {
          if (sel||hov) {
            const g=ctx.createRadialGradient(n.x,n.y,n.radius,n.x,n.y,n.radius*2.2)
            g.addColorStop(0, n.color+'55'); g.addColorStop(1,'transparent')
            ctx.fillStyle=g; ctx.beginPath(); ctx.arc(n.x,n.y,n.radius*2.2,0,Math.PI*2); ctx.fill()
          }
          ctx.beginPath(); ctx.arc(n.x,n.y,sel?n.radius+4:n.radius,0,Math.PI*2)
          ctx.fillStyle=n.color+(sel?'ff':'cc'); ctx.fill()
          ctx.strokeStyle='#fff'; ctx.lineWidth=sel?2.5:1; ctx.stroke()
          const arc=(n.score/100)*Math.PI*2-Math.PI/2
          ctx.beginPath(); ctx.arc(n.x,n.y,n.radius+6,-Math.PI/2,arc)
          ctx.strokeStyle='#ffffff88'; ctx.lineWidth=3; ctx.lineCap='round'; ctx.stroke()
          ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.textBaseline='middle'
          const words=n.label.split(' ')
          ctx.font=`bold ${sel?11:10}px 'DM Sans',sans-serif`
          if(words.length>1){ ctx.fillText(words.slice(0,-1).join(' '),n.x,n.y-6); ctx.fillText(words[words.length-1],n.x,n.y+6) }
          else ctx.fillText(n.label,n.x,n.y)
          ctx.font=`bold 9px 'DM Sans',sans-serif`; ctx.fillText(n.score+'%',n.x,n.y+n.radius+14)
        } else {
          const r=hov?n.radius+3:n.radius
          ctx.beginPath(); ctx.arc(n.x,n.y,r,0,Math.PI*2)
          ctx.fillStyle=n.owned?'rgba(0,201,167,0.15)':'rgba(50,50,50,0.6)'; ctx.fill()
          ctx.strokeStyle=n.owned?'#00C9A7':'#555'; ctx.lineWidth=n.owned?2:1; ctx.stroke()
          if(n.owned){ ctx.fillStyle='#00C9A7'; ctx.font='bold 8px DM Sans,sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('✓',n.x,n.y) }
          if(hov||n.owned){ ctx.fillStyle=n.owned?'#00C9A7':'#888'; ctx.font=`${n.owned?'bold':'normal'} 9px DM Sans,sans-serif`; ctx.textAlign='center'; ctx.fillText(n.label,n.x,n.y+r+10) }
        }
        ctx.restore()
      })
    }

    const loop = () => { simulate(); draw(); animRef.current=requestAnimationFrame(loop) }
    animRef.current = requestAnimationFrame(loop)

    const getNode = (x,y) => stateRef.current.nodes.find(n => Math.hypot(n.x-x,n.y-y)<n.radius+8)

    const onMove = e => {
      const rect=canvas.getBoundingClientRect(), mx=e.clientX-rect.left, my=e.clientY-rect.top
      if(stateRef.current.dragging){ stateRef.current.dragging.x=mx; stateRef.current.dragging.y=my; stateRef.current.dragging.vx=0; stateRef.current.dragging.vy=0 }
      stateRef.current.hovered=getNode(mx,my)
      canvas.style.cursor=stateRef.current.hovered?'pointer':'default'
    }
    const onDown = e => { const rect=canvas.getBoundingClientRect(); stateRef.current.dragging=getNode(e.clientX-rect.left,e.clientY-rect.top)||null }
    const onUp = e => {
      const rect=canvas.getBoundingClientRect(), n=getNode(e.clientX-rect.left,e.clientY-rect.top)
      if(n&&n===stateRef.current.dragging&&n.type==='career') onSelectCareer(n.career)
      stateRef.current.dragging=null
    }
    canvas.addEventListener('mousemove',onMove)
    canvas.addEventListener('mousedown',onDown)
    canvas.addEventListener('mouseup',onUp)

    return () => {
      cancelAnimationFrame(animRef.current)
      canvas.removeEventListener('mousemove',onMove)
      canvas.removeEventListener('mousedown',onDown)
      canvas.removeEventListener('mouseup',onUp)
      window.removeEventListener('resize',resize)
    }
  }, [careers, userSkills, selectedCareer])

  return (
    <div style={{ position:'relative', padding:16 }}>
      <canvas ref={canvasRef} style={{ width:'100%', height:'calc(100vh - 100px)', borderRadius:16, border:'1px solid rgba(255,255,255,0.05)', background:'rgba(255,255,255,0.01)' }} />
      <p style={{ position:'absolute', bottom:24, left:'50%', transform:'translateX(-50%)', fontSize:11, color:'#333', margin:0 }}>Click a career · Drag to rearrange</p>
    </div>
  )
}