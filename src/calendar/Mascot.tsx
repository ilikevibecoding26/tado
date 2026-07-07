export function Mascot() {
  return (
    <svg viewBox="0 0 100 100" width="56" height="56" role="img" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="mascot-body">
          <rect x="4" y="4" width="92" height="92" rx="22" />
        </clipPath>
      </defs>
      <g clipPath="url(#mascot-body)">
        <rect x="4" y="4" width="92" height="92" fill="var(--code-bg)" />
        <rect x="4" y="4" width="92" height="34" fill="var(--accent)" />
        <rect x="36" y="14" width="8" height="16" rx="4" fill="#ffffff" />
        <rect x="56" y="14" width="8" height="16" rx="4" fill="#ffffff" />
      </g>
      <circle cx="38" cy="60" r="5.5" fill="var(--text-h)" />
      <circle cx="62" cy="60" r="5.5" fill="var(--text-h)" />
      <path d="M34 74 Q50 90 66 74" stroke="var(--text-h)" strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
  )
}
