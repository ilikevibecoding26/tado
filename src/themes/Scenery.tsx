import type { CSSProperties, ReactElement } from 'react'
import { useAppearance } from '../features/theme/appearance'
import type { ThemeId } from '../features/theme/theme'
import './Scenery.css'

// A decorative landscape along the bottom of the screen. It sits behind the app and ignores clicks.
// Elements marked `sc-loud` only appear on "All out"; the `sc-*` animation classes only move on
// Calm and All out (and not at all if the device asks to reduce motion). See Scenery.css.

const W = 1200
const H = 200

function delay(seconds: number): CSSProperties {
  return { animationDelay: `${seconds}s` }
}

function wave(y: number, amplitude: number, length: number): string {
  let d = `M-200 ${y}`
  for (let x = -200; x < W + 200; x += length) {
    d += ` q${length / 4} ${-amplitude} ${length / 2} 0 t${length / 2} 0`
  }
  return `${d} V${H + 20} H-200Z`
}

function sparkle(x: number, y: number, size: number): string {
  const s = size
  return `M${x} ${y - s} l${s * 0.28} ${s * 0.72} l${s * 0.72} ${s * 0.28} l${-s * 0.72} ${s * 0.28} l${-s * 0.28} ${s * 0.72} l${-s * 0.28} ${-s * 0.72} l${-s * 0.72} ${-s * 0.28} l${s * 0.72} ${-s * 0.28}Z`
}

function Pine({ x, scale, opacity }: { x: number; scale: number; opacity: number }) {
  return (
    <g transform={`translate(${x} ${H}) scale(${scale})`} fill="var(--accent)" fillOpacity={opacity}>
      <rect x="-4" y="-14" width="8" height="16" />
      <path d="M0 -112 L24 -66 H11 L32 -30 H14 L38 -8 H-38 L-14 -30 H-32 L-11 -66 H-24Z" />
    </g>
  )
}

function TadoScenery() {
  return (
    <>
      <path
        d="M0 150C200 100 350 120 520 140C700 160 850 90 1050 110C1130 118 1170 130 1200 125V200H0Z"
        fill="var(--accent)"
        fillOpacity=".14"
      />
      <path d="M0 176C220 140 400 172 600 166C800 160 950 130 1200 160V200H0Z" fill="var(--accent)" fillOpacity=".22" />
      {[
        [170, 70, 12, 0],
        [430, 38, 9, 1.2],
        [760, 62, 11, 2.1],
        [1010, 34, 9, 0.7],
      ].map(([x, y, size, d]) => (
        <path key={x} className="sc-twinkle" d={sparkle(x, y, size)} fill="var(--accent)" fillOpacity=".55" style={delay(d)} />
      ))}
      <g className="sc-loud">
        {[
          [300, 90, 8, 0.4],
          [620, 50, 7, 1.7],
          [900, 84, 8, 2.6],
          [1110, 66, 7, 0.9],
        ].map(([x, y, size, d]) => (
          <path key={x} className="sc-twinkle" d={sparkle(x, y, size)} fill="var(--accent)" fillOpacity=".5" style={delay(d)} />
        ))}
      </g>
    </>
  )
}

function CandyScenery() {
  const lollipops: [number, number, string, number][] = [
    [170, 104, 'var(--hue-blue)', 0.9],
    [450, 104, 'var(--accent)', 1],
    [640, 90, 'var(--hue-purple)', 1.1],
    [790, 118, 'var(--hue-yellow)', 0.85],
    [1040, 98, 'var(--accent)', 1],
  ]
  const sprinkles: [number, number, string, number][] = [
    [330, 48, 'var(--accent)', 0],
    [470, 34, 'var(--hue-yellow)', 1.3],
    [600, 70, 'var(--hue-blue)', 2.2],
    [740, 40, 'var(--hue-green)', 0.8],
    [880, 60, 'var(--accent)', 1.7],
  ]
  return (
    <>
      <path d="M0 140C180 100 330 150 520 130C720 110 880 150 1200 115V200H0Z" fill="var(--hue-blue)" fillOpacity=".2" />
      <path d="M0 165C240 130 420 175 640 150C860 125 1000 170 1200 145V200H0Z" fill="var(--accent)" fillOpacity=".2" />
      <path d="M0 184C200 164 460 196 700 178C900 163 1050 192 1200 176V200H0Z" fill="var(--hue-green)" fillOpacity=".3" />
      {lollipops.map(([x, y, color, scale]) => (
        <g key={x} transform={`translate(${x} ${y}) scale(${scale})`} className="sc-bob">
          <rect x="-2.5" y="14" width="5" height="76" rx="2.5" fill="var(--text)" fillOpacity=".35" />
          <circle r="22" fill={color} fillOpacity=".8" />
          <circle r="14" fill="none" stroke="var(--accent-contrast)" strokeOpacity=".7" strokeWidth="3" />
          <circle r="6" fill="none" stroke="var(--accent-contrast)" strokeOpacity=".7" strokeWidth="3" />
        </g>
      ))}
      <g className="sc-loud">
        {sprinkles.map(([x, y, color, d]) => (
          <rect
            key={x}
            className="sc-drift"
            x={x}
            y={y}
            width="14"
            height="5"
            rx="2.5"
            fill={color}
            fillOpacity=".8"
            transform={`rotate(${x % 90} ${x} ${y})`}
            style={delay(d)}
          />
        ))}
      </g>
    </>
  )
}

function SpaceScenery() {
  const stars: [number, number, number][] = [
    [90, 40, 0],
    [240, 90, 1.1],
    [380, 30, 2.3],
    [440, 40, 1.4],
    [520, 70, 0.6],
    [600, 120, 2.0],
    [660, 24, 1.8],
    [790, 80, 2.9],
    [900, 36, 0.3],
    [1160, 44, 1.5],
    [1090, 96, 2.5],
  ]
  return (
    <>
      {stars.map(([x, y, d]) => (
        <circle key={x} className="sc-twinkle" cx={x} cy={y} r="2" fill="#fff" style={delay(d)} />
      ))}
      <g className="sc-loud">
        {[
          [140, 100, 0.5],
          [460, 120, 1.4],
          [720, 50, 2.2],
          [980, 70, 0.9],
          [1040, 20, 1.9],
        ].map(([x, y, d]) => (
          <circle key={x} className="sc-twinkle" cx={x} cy={y} r="1.6" fill="#fff" style={delay(d)} />
        ))}
        <g className="sc-shoot">
          <line x1="0" y1="0" x2="-70" y2="-28" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeOpacity=".85" />
        </g>
      </g>
      <g className="sc-bob">
        <circle cx="720" cy="104" r="44" fill="var(--hue-purple)" fillOpacity=".6" />
        <ellipse cx="720" cy="104" rx="78" ry="14" fill="none" stroke="var(--accent)" strokeOpacity=".7" strokeWidth="5" transform="rotate(-16 720 104)" />
      </g>
      <circle cx="470" cy="84" r="22" fill="#e9ecff" fillOpacity=".55" />
      <circle cx="462" cy="78" r="5" fill="#c7cdf5" fillOpacity=".7" />
      <circle cx="479" cy="92" r="3.5" fill="#c7cdf5" fillOpacity=".7" />
      <path d="M0 178Q150 152 300 174T600 172T900 168T1200 174V200H0Z" fill="var(--code-bg)" fillOpacity=".95" />
      <ellipse cx="330" cy="188" rx="34" ry="6" fill="var(--border)" fillOpacity=".8" />
      <ellipse cx="780" cy="186" rx="26" ry="5" fill="var(--border)" fillOpacity=".8" />
    </>
  )
}

function ArcadeScenery() {
  const vertical = Array.from({ length: 17 }, (_, i) => -200 + i * 100)
  return (
    <>
      <circle cx="600" cy="146" r="74" fill="var(--accent)" fillOpacity=".4" />
      {[110, 124, 136, 146].map((y, i) => (
        <rect key={y} x="520" y={y} width="160" height={2 + i * 1.5} fill="var(--bg)" />
      ))}
      <path d="M100 150 L150 112 L190 132 L260 92 L320 140 L390 122 L460 152 L520 150 Z" fill="var(--hue-purple)" fillOpacity=".3" />
      <path d="M680 150 L740 124 L810 142 L880 100 L950 144 L1030 116 L1100 150 Z" fill="var(--hue-purple)" fillOpacity=".3" />
      <rect x="0" y="150" width={W} height="50" fill="var(--bg)" fillOpacity=".7" />
      <g stroke="var(--hue-blue)" strokeOpacity=".45" strokeWidth="1.5">
        {vertical.map((x) => (
          <line key={x} x1="600" y1="150" x2={600 + (x - 600) * 2.2} y2={H} />
        ))}
      </g>
      <g stroke="var(--accent)" strokeOpacity=".55" strokeWidth="1.5" className="sc-grid">
        {[154, 162, 174, 190].map((y) => (
          <line key={y} x1="0" y1={y} x2={W} y2={y} />
        ))}
      </g>
      <line x1="0" y1="150" x2={W} y2="150" stroke="var(--accent)" strokeWidth="2" strokeOpacity=".7" />
    </>
  )
}

function OceanScenery() {
  const bubbles: [number, number, number, boolean][] = [
    [430, 0, 4, false],
    [520, 2.4, 5, false],
    [660, 4.1, 4, false],
    [790, 1.2, 6, false],
    [150, 3.3, 3, true],
    [300, 5.2, 4, true],
    [590, 0.8, 3, true],
    [900, 3.7, 4, true],
    [1100, 2.0, 5, true],
  ]
  return (
    <>
      <path className="sc-wave sc-wave-1" d={wave(142, 14, 220)} fill="var(--accent)" fillOpacity=".14" />
      <path className="sc-wave sc-wave-2" d={wave(160, 12, 180)} fill="var(--accent)" fillOpacity=".2" />
      <path className="sc-wave sc-wave-1" d={wave(178, 10, 240)} fill="var(--accent)" fillOpacity=".28" />
      {bubbles.map(([x, d, r, extra]) => (
        <circle key={x} className={`sc-rise${extra ? ' sc-loud' : ''}`} cx={x} cy="190" r={r} fill="none" stroke="var(--accent)" strokeWidth="2" style={delay(d)} />
      ))}
      <g className="sc-loud">
        <g className="sc-swim">
          <path d="M0 150q18-14 36 0q-18 14-36 0ZM36 150l14-10v20Z" fill="var(--accent)" fillOpacity=".6" />
        </g>
      </g>
    </>
  )
}

function ForestScenery() {
  const far = [60, 190, 320, 450, 590, 700, 830, 960, 1090, 1170]
  const near = [120, 330, 470, 640, 790, 980, 1130]
  const leaves: [number, number, string, boolean][] = [
    [180, 0, 'var(--hue-yellow)', false],
    [520, 3, 'var(--hue-red)', false],
    [880, 5.5, 'var(--hue-yellow)', false],
    [340, 1.5, 'var(--hue-red)', true],
    [700, 4, 'var(--hue-yellow)', true],
    [1040, 2.4, 'var(--hue-red)', true],
    [1160, 6.5, 'var(--hue-yellow)', true],
  ]
  return (
    <>
      {far.map((x) => (
        <Pine key={`f${x}`} x={x} scale={0.7} opacity={0.14} />
      ))}
      {near.map((x) => (
        <Pine key={`n${x}`} x={x} scale={1.1} opacity={0.24} />
      ))}
      <path d="M0 184C200 172 420 190 640 180C860 170 1000 188 1200 178V200H0Z" fill="var(--accent)" fillOpacity=".3" />
      {leaves.map(([x, d, color, extra]) => (
        <ellipse key={x} className={`sc-fall${extra ? ' sc-loud' : ''}`} cx={x} cy="0" rx="7" ry="3.5" fill={color} fillOpacity=".75" style={delay(d)} />
      ))}
    </>
  )
}

function SunsetScenery() {
  return (
    <>
      <circle className="sc-sun" cx="640" cy="152" r="84" fill="var(--accent)" fillOpacity=".3" />
      <circle cx="640" cy="152" r="52" fill="var(--hue-yellow)" fillOpacity=".55" />
      <path d="M0 150C160 118 320 156 520 140C720 124 900 160 1200 130V200H0Z" fill="var(--hue-purple)" fillOpacity=".25" />
      <path d="M0 178C240 150 460 188 700 170C900 156 1050 186 1200 168V200H0Z" fill="var(--accent)" fillOpacity=".3" />
      {[
        [440, 60],
        [480, 82],
        [530, 50],
      ].map(([x, y]) => (
        <path key={x} className="sc-drift" d={`M${x} ${y}q8 -9 16 0q8 -9 16 0`} fill="none" stroke="var(--text-h)" strokeOpacity=".4" strokeWidth="2.5" strokeLinecap="round" />
      ))}
      <g className="sc-loud">
        <ellipse className="sc-drift" cx="420" cy="70" rx="46" ry="10" fill="var(--hue-red)" fillOpacity=".25" />
        <ellipse className="sc-drift" cx="1020" cy="52" rx="56" ry="11" fill="var(--hue-yellow)" fillOpacity=".25" />
        <ellipse className="sc-drift" cx="640" cy="36" rx="38" ry="8" fill="var(--hue-purple)" fillOpacity=".25" />
      </g>
    </>
  )
}

const SCENES: Partial<Record<ThemeId, () => ReactElement>> = {
  tado: TadoScenery,
  candy: CandyScenery,
  space: SpaceScenery,
  arcade: ArcadeScenery,
  ocean: OceanScenery,
  forest: ForestScenery,
  sunset: SunsetScenery,
}

export function Scenery() {
  const { theme, effects } = useAppearance()
  const Scene = SCENES[theme]
  // Minimal has no scenery on purpose.
  if (effects === 'off' || !Scene) return null
  return (
    <div className="scenery" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice">
        <Scene />
      </svg>
    </div>
  )
}
