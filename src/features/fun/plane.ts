/** A little plane flies across the top of the screen. */
export function flyPlane(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const plane = document.createElement('div')
  plane.className = 'magic-plane'
  plane.setAttribute('aria-hidden', 'true')
  plane.innerHTML =
    '<svg viewBox="0 0 120 40" width="120" height="40">' +
    '<path d="M0 22h30M6 30h22M12 14h16" stroke="currentColor" stroke-opacity=".35" stroke-width="3" stroke-linecap="round" fill="none"/>' +
    // Nose on the right, tail fin on the left: it flies to the right.
    '<path d="M40 20Q40 13 50 13H96Q112 13 117 20Q112 27 96 27H50Q40 27 40 20Z" fill="currentColor"/>' +
    '<path d="M40 14L35 3H48L56 14Z" fill="currentColor"/>' +
    '<path d="M62 22L50 37H64L84 22Z" fill="currentColor" fill-opacity=".8"/>' +
    '<circle cx="82" cy="19" r="2.2" fill="var(--bg)"/><circle cx="92" cy="19" r="2.2" fill="var(--bg)"/><circle cx="102" cy="19" r="2.2" fill="var(--bg)"/>' +
    '</svg>'
  document.body.appendChild(plane)
  setTimeout(() => plane.remove(), 4600)
}
