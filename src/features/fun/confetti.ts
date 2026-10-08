import { getAppearance } from '../theme/appearance'
import type { EffectsLevel, ThemeId } from '../theme/theme'

type Shape = 'rect' | 'dot' | 'ring' | 'star' | 'pixel' | 'leaf' | 'sprinkle' | 'heart' | 'ember'

interface Style {
  shapes: Shape[]
  /** Pixels per frame squared; negative values float upward. */
  gravity: number
  /** Per-frame velocity multiplier; below 1 the burst slows and drifts. */
  drag: number
  /** Multiplier on how hard the burst launches. */
  launch: number
  /** Sideways wobble while moving. */
  sway: number
  /** Particles fly straight up instead of outward (bubbles, embers). */
  floats: boolean
}

const STYLES: Record<ThemeId, Style> = {
  tado: { shapes: ['rect'], gravity: 0.35, drag: 1, launch: 1, sway: 0, floats: false },
  minimal: { shapes: ['dot'], gravity: 0.3, drag: 1, launch: 0.8, sway: 0, floats: false },
  candy: { shapes: ['sprinkle', 'heart', 'dot'], gravity: 0.3, drag: 1, launch: 1, sway: 0, floats: false },
  space: { shapes: ['star', 'dot'], gravity: 0.03, drag: 0.95, launch: 1, sway: 0, floats: false },
  arcade: { shapes: ['pixel'], gravity: 0.4, drag: 1, launch: 1.1, sway: 0, floats: false },
  ocean: { shapes: ['ring'], gravity: -0.05, drag: 0.97, launch: 0.5, sway: 0.7, floats: true },
  forest: { shapes: ['leaf'], gravity: 0.06, drag: 0.96, launch: 0.8, sway: 1.1, floats: false },
  sunset: { shapes: ['ember', 'dot'], gravity: -0.04, drag: 0.97, launch: 0.6, sway: 0.4, floats: true },
  gold: { shapes: ['star', 'rect', 'dot'], gravity: 0.3, drag: 1, launch: 1, sway: 0, floats: false },
}

interface Level {
  count: number
  duration: number
  scale: number
  /** Fire a second, smaller burst partway through. */
  encore: boolean
}

// "off" keeps the original confetti (same count, timing and size).
const LEVELS: Record<EffectsLevel, Level> = {
  off: { count: 60, duration: 1200, scale: 1, encore: false },
  calm: { count: 45, duration: 1700, scale: 1, encore: false },
  loud: { count: 110, duration: 2800, scale: 1.35, encore: true },
}

const DEFAULT_COLORS = ['#aa3bff', '#47bfff', '#ffb703', '#22c55e', '#ef4444', '#f472b6']

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  vr: number
  size: number
  color: string
  shape: Shape
  phase: number
}

// The active theme lists its confetti colors in the --confetti variable.
function getColors(theme?: ThemeId): string[] {
  let target: HTMLElement = document.documentElement
  let probe: HTMLElement | null = null
  if (theme) {
    // Read another theme's palette without switching to it.
    probe = document.createElement('div')
    probe.dataset.theme = theme
    document.body.appendChild(probe)
    target = probe
  }
  const raw = getComputedStyle(target).getPropertyValue('--confetti')
  probe?.remove()
  const colors = raw
    .split(',')
    .map((color) => color.trim())
    .filter(Boolean)
  return colors.length > 0 ? colors : DEFAULT_COLORS
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function spawn(count: number, originX: number, originY: number, style: Style, level: Level, colors: string[]): Particle[] {
  return Array.from({ length: count }, () => {
    const shape = pick(style.shapes)
    const angle = Math.random() * Math.PI * 2
    const burst = Math.random() * 3 + 1
    let size = (Math.random() * 6 + 4) * level.scale
    if (shape === 'pixel') size = Math.round(size / 3) * 3 + 3
    if (shape === 'star') size *= 0.9
    return {
      x: originX,
      y: originY,
      // Outward bursts fall back down; floating ones spread sideways and drift up.
      vx: style.floats ? Math.cos(angle) * burst * style.launch * 2 : (Math.random() - 0.5) * 12 * style.launch,
      vy: style.floats ? -Math.abs(Math.sin(angle)) * burst * style.launch * 2 - 1 : (Math.random() * -10 - 4) * style.launch,
      rotation: Math.random() * 360,
      vr: (Math.random() - 0.5) * 20,
      size,
      color: pick(colors),
      shape,
      phase: Math.random() * Math.PI * 2,
    }
  })
}

function drawShape(ctx: CanvasRenderingContext2D, p: Particle): void {
  const s = p.size
  ctx.fillStyle = p.color
  ctx.strokeStyle = p.color
  switch (p.shape) {
    case 'rect':
      ctx.fillRect(-s / 2, -s / 2, s, s * 0.6)
      break
    case 'dot':
      ctx.beginPath()
      ctx.arc(0, 0, s / 2.2, 0, Math.PI * 2)
      ctx.fill()
      break
    case 'ring':
      ctx.lineWidth = 1.6
      ctx.beginPath()
      ctx.arc(0, 0, s * 0.8, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(-s * 0.3, -s * 0.3, s * 0.22, 0, Math.PI * 2)
      ctx.fill()
      break
    case 'star': {
      ctx.beginPath()
      for (let i = 0; i < 10; i++) {
        const radius = i % 2 === 0 ? s * 0.9 : s * 0.4
        const a = (Math.PI / 5) * i - Math.PI / 2
        ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius)
      }
      ctx.closePath()
      ctx.fill()
      break
    }
    case 'pixel':
      ctx.fillRect(-s / 2, -s / 2, s, s)
      break
    case 'leaf':
      ctx.beginPath()
      ctx.ellipse(0, 0, s * 1.1, s * 0.5, 0, 0, Math.PI * 2)
      ctx.fill()
      break
    case 'sprinkle':
      ctx.lineWidth = s * 0.6
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(-s * 0.8, 0)
      ctx.lineTo(s * 0.8, 0)
      ctx.stroke()
      break
    case 'heart':
      ctx.beginPath()
      ctx.moveTo(0, s * 0.35)
      ctx.bezierCurveTo(-s * 1.1, -s * 0.4, -s * 0.4, -s * 1.1, 0, -s * 0.45)
      ctx.bezierCurveTo(s * 0.4, -s * 1.1, s * 1.1, -s * 0.4, 0, s * 0.35)
      ctx.fill()
      break
    case 'ember':
      ctx.shadowColor = p.color
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(0, 0, s / 2.6, 0, Math.PI * 2)
      ctx.fill()
      break
  }
}

/** Pass `themeOverride` to burst in another theme's style and colors (used by party mode). */
export function burstConfetti(originX: number, originY: number, themeOverride?: ThemeId): void {
  const { theme: currentTheme, effects } = getAppearance()
  const theme = themeOverride ?? currentTheme
  // Themed effects respect the device's reduced-motion setting; the plain confetti never did.
  if (effects !== 'off' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const style = STYLES[effects === 'off' ? 'tado' : theme]
  const level = LEVELS[effects]
  const colors = getColors(effects === 'off' ? undefined : themeOverride)

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

  const particles = spawn(level.count, originX, originY, style, level, colors)
  let encorePending = level.encore
  const start = performance.now()

  function frame(now: number) {
    const elapsed = now - start
    if (encorePending && elapsed > 300) {
      encorePending = false
      particles.push(...spawn(Math.round(level.count / 2), originX, originY, style, level, colors))
    }
    ctx!.clearRect(0, 0, canvas.width, canvas.height)
    const fade = effects === 'off' ? 1 : Math.min(1, (level.duration - elapsed) / (level.duration * 0.35))
    for (const p of particles) {
      p.vy += style.gravity
      p.vx *= style.drag
      p.vy *= style.drag
      p.x += p.vx + Math.sin(p.phase + elapsed / 140) * style.sway
      p.y += p.vy
      p.rotation += p.vr
      ctx!.save()
      ctx!.globalAlpha = Math.max(0, fade)
      ctx!.translate(p.x, p.y)
      if (p.shape !== 'pixel' && p.shape !== 'ring' && p.shape !== 'ember') {
        ctx!.rotate((p.rotation * Math.PI) / 180)
      }
      drawShape(ctx!, p)
      ctx!.restore()
    }
    if (elapsed < level.duration) {
      requestAnimationFrame(frame)
    } else {
      canvas.remove()
    }
  }
  requestAnimationFrame(frame)
}
