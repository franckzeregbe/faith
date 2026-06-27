import React from 'react'

type Props = {
  size?: number
}

export default function Logo({ size = 44 }: Props) {
  const s = size
  const h = Math.round(s * 0.15)

  return (
    <svg width={s * 2.8} height={s * 0.9} viewBox="0 0 280 90" fill="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="lg" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#a0784a" />
          <stop offset="100%" stopColor="#d7b77b" />
        </linearGradient>
      </defs>

      {/* Symbole : fond */}
      <rect x="0" y={s * 0.1} width={s} height={s} rx={s * 0.27} fill="url(#lg)" />

      {/* Croix */}
      <line x1={s * 0.5} y1={s * 0.23} x2={s * 0.5} y2={s * 0.87} stroke="#fff" strokeWidth={s * 0.07} strokeLinecap="round" />
      <line x1={s * 0.27} y1={s * 0.52} x2={s * 0.73} y2={s * 0.52} stroke="#fff" strokeWidth={s * 0.07} strokeLinecap="round" />

      {/* Flamme */}
      <path d={`M${s * 0.5} ${s * 0.08} C${s * 0.5} ${s * 0.08} ${s * 0.41} ${s * 0.25} ${s * 0.41} ${s * 0.32} C${s * 0.41} ${s * 0.38} ${s * 0.45} ${s * 0.43} ${s * 0.5} ${s * 0.43} C${s * 0.55} ${s * 0.43} ${s * 0.59} ${s * 0.38} ${s * 0.59} ${s * 0.32} C${s * 0.59} ${s * 0.25} ${s * 0.5} ${s * 0.08} ${s * 0.5} ${s * 0.08}Z`} fill="#fff" opacity="0.92" />

      {/* FAITH texte */}
      <text x={s * 1.15} y={s * 0.57} fontFamily="Inter, Arial, sans-serif" fontWeight="900" fontSize={s * 0.66} fill="#3f352c" letterSpacing={s * 0.08}>FAITH</text>

      {/* Sous-titre */}
      <text x={s * 1.16} y={s * 0.78} fontFamily="Inter, Arial, sans-serif" fontWeight="600" fontSize={s * 0.24} fill="#8d7f70" letterSpacing={s * 0.12}>GESTION PASTORALE</text>
    </svg>
  )
}
