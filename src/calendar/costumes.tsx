import type { HolidayId } from '../features/fun/holidays'
import type { ThemeId } from '../features/theme/theme'

// Where each mascot's head is, in the 100x100 mascot box, so a hat can sit on it.
const HEAD: Record<ThemeId, { x: number; y: number; scale: number }> = {
  tado: { x: 50, y: 6, scale: 1 },
  minimal: { x: 50, y: 14, scale: 1 },
  candy: { x: 50, y: 15, scale: 0.9 },
  space: { x: 50, y: 14, scale: 1 },
  arcade: { x: 50, y: 22, scale: 0.9 },
  ocean: { x: 44, y: 30, scale: 0.8 },
  forest: { x: 50, y: 32, scale: 0.75 },
  sunset: { x: 50, y: 22, scale: 0.8 },
  gold: { x: 50, y: -2, scale: 0.8 },
}

// Each costume is drawn with its base at (0, 0), growing upward.
function Hat({ holiday }: { holiday: HolidayId }) {
  switch (holiday) {
    case 'halloween':
      return (
        <>
          <ellipse cx="0" cy="0" rx="30" ry="5" fill="#6a45a3" stroke="#2b1b3d" strokeWidth="1.5" />
          <path d="M-18 0Q-10 -24 -2 -42L13 -35Q5 -20 18 0Z" fill="#6a45a3" stroke="#2b1b3d" strokeWidth="1.5" strokeLinejoin="round" />
          <rect x="-17" y="-11" width="34" height="7" fill="#ff8a3d" />
          <rect x="-4" y="-11" width="8" height="7" fill="#ffd24a" />
        </>
      )
    case 'christmas':
      return (
        <>
          <path d="M-22 0Q-24 -34 6 -34Q24 -34 29 -14L25 0Z" fill="#d62839" />
          <rect x="-27" y="-6" width="54" height="9" rx="4.5" fill="#fff" />
          <circle cx="29" cy="-14" r="6" fill="#fff" />
        </>
      )
    case 'newyear':
      return (
        <>
          <path d="M-15 0L0 -38L15 0Z" fill="#7c5cff" />
          <path d="M-9 -16H9M-5 -27H5" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          <circle cx="0" cy="-39" r="4.5" fill="#ffd24a" />
          <circle cx="-26" cy="-20" r="2.5" fill="#ff6b81" />
          <circle cx="27" cy="-28" r="2.5" fill="#5ec8ff" />
          <circle cx="24" cy="-6" r="2" fill="#ffd24a" />
        </>
      )
    case 'valentines':
      return (
        <>
          <path d="M0 -4C-15 -18 -7 -34 0 -25C7 -34 15 -18 0 -4Z" fill="#ff4d6d" transform="translate(0 -6)" />
          <path d="M0 -4C-15 -18 -7 -34 0 -25C7 -34 15 -18 0 -4Z" fill="#ff8fa3" transform="translate(-26 -14) scale(.5)" />
          <path d="M0 -4C-15 -18 -7 -34 0 -25C7 -34 15 -18 0 -4Z" fill="#ff8fa3" transform="translate(26 -20) scale(.45)" />
        </>
      )
    case 'stpatrick':
      return (
        <>
          <rect x="-13" y="-32" width="26" height="30" fill="#2f9e44" />
          <rect x="-27" y="-4" width="54" height="6" rx="3" fill="#2f9e44" />
          <rect x="-13" y="-12" width="26" height="6" fill="#1b5e20" />
          <rect x="-4.5" y="-13" width="9" height="8" rx="1.5" fill="#ffd24a" />
        </>
      )
  }
}

export function Costume({ holiday, mascot }: { holiday: HolidayId; mascot: ThemeId }) {
  const { x, y, scale } = HEAD[mascot]
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <Hat holiday={holiday} />
    </g>
  )
}
