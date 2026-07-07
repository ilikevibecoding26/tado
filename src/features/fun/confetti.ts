const COLORS = ['#aa3bff', '#47bfff', '#ffb703', '#22c55e', '#ef4444', '#f472b6']

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  vr: number
  size: number
  color: string
}

export function burstConfetti(originX: number, originY: number): void {
  const canvas = document.createElement('canvas')
  canvas.style.position = 'fixed'
  canvas.style.inset = '0'
  canvas.style.width = '100vw'
  canvas.style.height = '100vh'
  canvas.style.pointerEvents = 'none'
  canvas.style.zIndex = '9999'
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    canvas.remove()
    return
  }

  const particles: Particle[] = Array.from({ length: 60 }, () => ({
    x: originX,
    y: originY,
    vx: (Math.random() - 0.5) * 12,
    vy: Math.random() * -10 - 4,
    rotation: Math.random() * 360,
    vr: (Math.random() - 0.5) * 20,
    size: Math.random() * 6 + 4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }))

  const gravity = 0.35
  const start = performance.now()
  const duration = 1200

  function frame(now: number) {
    const elapsed = now - start
    ctx!.clearRect(0, 0, canvas.width, canvas.height)
    for (const p of particles) {
      p.vy += gravity
      p.x += p.vx
      p.y += p.vy
      p.rotation += p.vr
      ctx!.save()
      ctx!.translate(p.x, p.y)
      ctx!.rotate((p.rotation * Math.PI) / 180)
      ctx!.fillStyle = p.color
      ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      ctx!.restore()
    }
    if (elapsed < duration) {
      requestAnimationFrame(frame)
    } else {
      canvas.remove()
    }
  }
  requestAnimationFrame(frame)
}
