import type { ReactElement } from 'react'
import type { ThemeId } from '../features/theme/theme'

// Every mascot draws into a 100x100 box. Body colors mostly come from the theme so each
// character matches its palette; faces and a few details use fixed colors that read on any theme.

export function CalendarGuy() {
  return (
    <>
      <rect x="4" y="4" width="92" height="92" rx="22" fill="var(--code-bg)" />
      <path d="M4 38V26a22 22 0 0 1 22-22h48a22 22 0 0 1 22 22v12Z" fill="var(--accent)" />
      <rect x="36" y="14" width="8" height="16" rx="4" fill="var(--accent-contrast)" />
      <rect x="56" y="14" width="8" height="16" rx="4" fill="var(--accent-contrast)" />
      <circle cx="38" cy="60" r="5.5" fill="var(--text-h)" />
      <circle cx="62" cy="60" r="5.5" fill="var(--text-h)" />
      <path d="M34 74Q50 90 66 74" stroke="var(--text-h)" strokeWidth="5" fill="none" strokeLinecap="round" />
    </>
  )
}

function DotFace() {
  return (
    <>
      <circle cx="50" cy="50" r="38" fill="none" stroke="var(--text-h)" strokeWidth="4" />
      <circle cx="39" cy="46" r="4" fill="var(--text-h)" />
      <circle cx="61" cy="46" r="4" fill="var(--text-h)" />
      <path d="M40 64h20" stroke="var(--text-h)" strokeWidth="4" strokeLinecap="round" />
    </>
  )
}

function Cupcake() {
  return (
    <>
      <path d="M24 56h52l-6 31a8 8 0 0 1-8 6H38a8 8 0 0 1-8-6Z" fill="#f2c48d" />
      <path d="M38 61l3 29M50 61v31M62 61l-3 29" stroke="#d9a468" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="50" cy="55" rx="30" ry="12" fill="var(--accent)" />
      <ellipse cx="50" cy="43" rx="23" ry="11" fill="var(--accent)" />
      <ellipse cx="50" cy="32" rx="15" ry="9" fill="var(--accent)" />
      <ellipse cx="42" cy="28" rx="5" ry="2.5" fill="#fff" fillOpacity=".35" />
      <circle cx="50" cy="20" r="5" fill="#ff4d6d" />
      <circle cx="43" cy="42" r="3" fill="var(--accent-contrast)" />
      <circle cx="57" cy="42" r="3" fill="var(--accent-contrast)" />
      <path d="M44 48q6 5 12 0" stroke="var(--accent-contrast)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <rect x="26" y="52" width="7" height="3" rx="1.5" fill="#ffd166" transform="rotate(-25 29 53)" />
      <rect x="64" y="51" width="7" height="3" rx="1.5" fill="#7ad7f0" transform="rotate(30 67 52)" />
      <rect x="36" y="36" width="6" height="3" rx="1.5" fill="#b5ead7" transform="rotate(20 39 37)" />
      <rect x="58" y="34" width="6" height="3" rx="1.5" fill="#ffd166" transform="rotate(-30 61 35)" />
    </>
  )
}

function Astronaut() {
  return (
    <>
      <rect x="28" y="78" width="44" height="16" rx="8" fill="var(--accent)" />
      <circle cx="17" cy="50" r="6" fill="var(--accent)" />
      <circle cx="83" cy="50" r="6" fill="var(--accent)" />
      <circle cx="50" cy="48" r="34" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="3" />
      <rect x="25" y="31" width="50" height="36" rx="18" fill="#141f4d" />
      <path d="M31 41q5-6 13-6" stroke="#fff" strokeOpacity=".55" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="42" cy="50" r="3.5" fill="#7af0ff" />
      <circle cx="58" cy="50" r="3.5" fill="#7af0ff" />
      <path d="M44 58q6 5 12 0" stroke="#7af0ff" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M50 14V7" stroke="#c7d2fe" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="6" r="3.5" fill="var(--accent)" />
    </>
  )
}

const INVADER_ROWS = [
  '..#.....#..',
  '...#...#...',
  '..#######..',
  '.##.###.##.',
  '###########',
  '#.#######.#',
  '#.#.....#.#',
  '...##.##...',
]

function Invader() {
  return (
    <g shapeRendering="crispEdges">
      {INVADER_ROWS.flatMap((row, y) =>
        [...row].map((cell, x) =>
          cell === '#' ? (
            <rect key={`${x}-${y}`} x={11.5 + x * 7} y={22 + y * 7} width="7" height="7" fill="var(--accent)" />
          ) : null,
        ),
      )}
    </g>
  )
}

function Fish() {
  return (
    <>
      <path d="M72 50 93 33v34Z" fill="var(--accent)" fillOpacity=".7" />
      <path d="M38 31q8-14 22-9l-5 11Z" fill="var(--accent)" fillOpacity=".7" />
      <ellipse cx="46" cy="50" rx="32" ry="22" fill="var(--accent)" />
      <path d="M54 34q7 16 0 32" stroke="var(--accent-contrast)" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="30" cy="44" r="6" fill="#fff" />
      <circle cx="29" cy="44" r="3" fill="#0a1c2a" />
      <path d="M21 58q7 6 14 0" stroke="var(--accent-contrast)" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="13" cy="30" r="4" fill="none" stroke="var(--accent)" strokeWidth="2.5" />
      <circle cx="20" cy="17" r="2.5" fill="none" stroke="var(--accent)" strokeWidth="2" />
    </>
  )
}

function Fox() {
  return (
    <>
      <path d="M16 12 40 32h20L84 12l3 40Q87 78 50 91Q13 78 13 52Z" fill="#e8833a" />
      <path d="M22 24 38 35 28 47Z" fill="#7a3b12" fillOpacity=".5" />
      <path d="M78 24 62 35 72 47Z" fill="#7a3b12" fillOpacity=".5" />
      <path d="M13 56Q50 60 50 91Q13 78 13 56Z" fill="#fff4e6" />
      <path d="M87 56Q50 60 50 91Q87 78 87 56Z" fill="#fff4e6" />
      <circle cx="36" cy="50" r="4" fill="#2f2118" />
      <circle cx="64" cy="50" r="4" fill="#2f2118" />
      <ellipse cx="50" cy="76" rx="5.5" ry="4" fill="#2f2118" />
    </>
  )
}

function Sun() {
  return (
    <>
      <g stroke="var(--accent)" strokeWidth="5" strokeLinecap="round">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line key={angle} x1="50" y1="11" x2="50" y2="3" transform={`rotate(${angle} 50 50)`} />
        ))}
      </g>
      <circle cx="50" cy="50" r="29" fill="var(--accent)" />
      <circle cx="41" cy="47" r="3.5" fill="var(--accent-contrast)" />
      <circle cx="59" cy="47" r="3.5" fill="var(--accent-contrast)" />
      <path d="M40 58q10 9 20 0" stroke="var(--accent-contrast)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <circle cx="33" cy="57" r="4" fill="#fff" fillOpacity=".25" />
      <circle cx="67" cy="57" r="4" fill="#fff" fillOpacity=".25" />
    </>
  )
}

export const MASCOTS: Record<ThemeId, () => ReactElement> = {
  tado: CalendarGuy,
  minimal: DotFace,
  candy: Cupcake,
  space: Astronaut,
  arcade: Invader,
  ocean: Fish,
  forest: Fox,
  sunset: Sun,
}
