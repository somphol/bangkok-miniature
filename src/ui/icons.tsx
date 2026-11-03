type IconProps = { size?: number; strokeWidth?: number }

const base = (size: number, strokeWidth: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
})

export function Sun({ size = 16, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

export function Moon({ size = 16, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z" />
    </svg>
  )
}

export function RotateCw({ size = 17, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M21 12a9 9 0 1 1-2.6-6.4" />
      <path d="M21 3v6h-6" />
    </svg>
  )
}

export function RotateCcw({ size = 17, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M3 12a9 9 0 1 0 2.6-6.4" />
      <path d="M3 3v6h6" />
    </svg>
  )
}

export function Plus({ size = 18, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function Minus({ size = 18, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M5 12h14" />
    </svg>
  )
}

export function Camera({ size = 17, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M4 7h3l1.5-2h7L17 7h3v12H4Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  )
}

export function Maximize({ size = 17, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
    </svg>
  )
}

export function X({ size = 16, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

export function MapPin({ size = 15, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  )
}

export function ArrowUpRight({ size = 14, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  )
}

export function Compass({ size = 32, strokeWidth = 1 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" />
    </svg>
  )
}

export function MousePointer2({ size = 13, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)}>
      <path d="m5 3 6.5 17 2.4-6.1 6.1-2.4L5 3Z" />
    </svg>
  )
}
