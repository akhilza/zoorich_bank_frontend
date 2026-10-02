'use client';

import React from 'react';

interface ZoorichLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function NovaLogo({
  size = 'md',
  showText = true,
  subtitle = 'Private Banking • Switzerland',
  className = '',
  style = {},
}: ZoorichLogoProps) {
  const dimensions = {
    sm: { icon: 32, fontSize: '1.15rem', subSize: '0.62rem', gap: '10px' },
    md: { icon: 40, fontSize: '1.35rem', subSize: '0.70rem', gap: '12px' },
    lg: { icon: 50, fontSize: '1.75rem', subSize: '0.80rem', gap: '14px' },
    xl: { icon: 64, fontSize: '2.25rem', subSize: '0.90rem', gap: '16px' },
  }[size];

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dimensions.gap,
        userSelect: 'none',
        ...style,
      }}
    >
      <svg
        width={dimensions.icon}
        height={dimensions.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="zbBadgeBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#141824" />
            <stop offset="50%" stopColor="#0a0c12" />
            <stop offset="100%" stopColor="#040508" />
          </linearGradient>

          <linearGradient id="zbBadgeBorder" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#2563eb" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.25" />
          </linearGradient>

          <linearGradient id="zbZDiagonal" x1="34" y1="14" x2="14" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          <radialGradient id="zbCoreGlow" cx="24" cy="24" r="16" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect
          x="3"
          y="3"
          width="42"
          height="42"
          rx="11"
          fill="url(#zbBadgeBg)"
          stroke="url(#zbBadgeBorder)"
          strokeWidth="1.5"
        />

        <circle cx="24" cy="24" r="15" fill="url(#zbCoreGlow)" />

        <circle
          cx="24"
          cy="24"
          r="16.5"
          stroke="#38bdf8"
          strokeWidth="0.8"
          strokeOpacity="0.22"
          strokeDasharray="2 3"
        />

        <path
          d="M 13.5 14 H 34.5 V 18.5 H 22.5 L 13.5 14 Z"
          fill="#ffffff"
        />

        <path
          d="M 34.5 14 L 34.5 18.5 L 18 34 H 13.5 V 29.5 L 30 14 H 34.5 Z"
          fill="url(#zbZDiagonal)"
        />

        <path
          d="M 13.5 29.5 H 25.5 L 34.5 34 H 13.5 V 29.5 Z"
          fill="#ffffff"
        />

        <polygon points="24,19.5 27,24 24,28.5 21,24" fill="#ffffff" />
        <circle cx="24" cy="24" r="1.3" fill="#38bdf8" />

        <circle cx="8" cy="8" r="1" fill="#38bdf8" fillOpacity="0.6" />
        <circle cx="40" cy="8" r="1" fill="#38bdf8" fillOpacity="0.6" />
        <circle cx="8" cy="40" r="1" fill="#38bdf8" fillOpacity="0.6" />
        <circle cx="40" cy="40" r="1" fill="#38bdf8" fillOpacity="0.6" />
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span
              style={{
                fontSize: dimensions.fontSize,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#ffffff',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Zoorich
            </span>
            <span
              style={{
                fontSize: dimensions.fontSize,
                fontWeight: 500,
                letterSpacing: '0.01em',
                color: '#ffffff',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Bank
            </span>
          </div>

          {subtitle && (
            <span
              style={{
                fontSize: dimensions.subSize,
                color: '#a1a1aa',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginTop: '2px',
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
