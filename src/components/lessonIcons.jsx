import React from 'react';

/**
 * 기술 흐름 공용 아이콘. 20×20 좌표계, 선(stroke)으로만 그린다.
 * 색·굵기는 쓰는 쪽 CSS가 정한다(fill: none; stroke: currentColor 등).
 */
const ICONS = {
  user: (
    <>
      <circle cx="10" cy="6.5" r="3.5" />
      <path d="M3 18c1.2-4.5 12.8-4.5 14 0" />
    </>
  ),
  browser: (
    <>
      <rect x="2" y="3" width="16" height="14" rx="2" />
      <path d="M2 7h16M5 5h.01M7.5 5h.01" />
    </>
  ),
  gate: (
    <>
      <rect x="2.5" y="3" width="15" height="14" rx="2" />
      <path d="M6 10h8M11 7l3 3-3 3" />
    </>
  ),
  shield: (
    <>
      <path d="M10 2l6.5 2.5v5c0 4-2.8 7-6.5 8.5C6.3 16.5 3.5 13.5 3.5 9.5v-5z" />
      <path d="M7 10l2 2 4-4" />
    </>
  ),
  db: (
    <>
      <ellipse cx="10" cy="5" rx="6.5" ry="2.5" />
      <path d="M3.5 5v10c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5V5M3.5 10c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5" />
    </>
  ),
  gear: (
    <>
      <circle cx="10" cy="10" r="3" />
      <path d="M10 2v3M10 15v3M2 10h3M15 10h3M4.3 4.3l2.1 2.1M13.6 13.6l2.1 2.1M4.3 15.7l2.1-2.1M13.6 6.4l2.1-2.1" />
    </>
  ),
  target: (
    <>
      <circle cx="10" cy="10" r="7" />
      <circle cx="10" cy="10" r="3" />
      <path d="M10 1v4M10 15v4M1 10h4M15 10h4" />
    </>
  ),
  agent: (
    <>
      <rect x="2.5" y="3" width="15" height="10" rx="1.5" />
      <path d="M7 17h6M10 13v4M6 8h2M10 8h4" />
    </>
  ),
  server: (
    <>
      <rect x="3" y="2.5" width="14" height="6" rx="1.5" />
      <rect x="3" y="11.5" width="14" height="6" rx="1.5" />
      <path d="M6 5.5h.01M6 14.5h.01M10 5.5h4M10 14.5h4" />
    </>
  ),
  box: (
    <>
      <path d="M10 2l7 4v8l-7 4-7-4V6z" />
      <path d="M3 6l7 4 7-4M10 10v8" />
    </>
  ),
  pod: (
    <>
      <rect x="3" y="3" width="14" height="14" rx="4" />
      <circle cx="10" cy="10" r="3" />
    </>
  ),
  registry: (
    <>
      <rect x="2.5" y="3" width="15" height="5" rx="1" />
      <rect x="2.5" y="12" width="15" height="5" rx="1" />
      <path d="M6 5.5h.01M6 14.5h.01" />
    </>
  ),
  route: (
    <>
      <circle cx="4" cy="16" r="2" />
      <circle cx="16" cy="4" r="2" />
      <path d="M6 16h5a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h5" />
    </>
  ),
  split: (
    <>
      <path d="M2 10h6M8 10l4-5h6M8 10l4 5h6M8 10h10" />
    </>
  ),
  book: (
    <>
      <path d="M3 4h5a2 2 0 0 1 2 2v11a2 2 0 0 0-2-2H3zM17 4h-5a2 2 0 0 0-2 2v11a2 2 0 0 1 2-2h5z" />
    </>
  ),
  chart: (
    <>
      <path d="M3 17h14M5 14V9M9 14V5M13 14v-3M17 14V7" />
    </>
  ),
  scale: (
    <>
      <path d="M3 10h14M6 7l-3 3 3 3M14 7l3 3-3 3" />
    </>
  ),
  heart: (
    <>
      <path d="M2 10h4l2-4 3 8 2-4h5" />
    </>
  ),
  disk: (
    <>
      <rect x="2.5" y="4" width="15" height="12" rx="2" />
      <circle cx="13.5" cy="12" r="1" />
      <path d="M5.5 8h9" />
    </>
  ),
  ticket: (
    <>
      <path d="M3 5h14v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z" />
      <path d="M10 6v8" strokeDasharray="1.5 2" />
    </>
  ),
  git: (
    <>
      <circle cx="6" cy="4.5" r="2" />
      <circle cx="6" cy="15.5" r="2" />
      <circle cx="14" cy="8" r="2" />
      <path d="M6 6.5v7M14 10c0 3-8 2-8 3.5" />
    </>
  ),
  hammer: (
    <>
      <path d="M11 4l5 5-2 2-5-5zM9.5 7.5L3 14l3 3 6.5-6.5" />
    </>
  ),
  archive: (
    <>
      <rect x="2.5" y="3" width="15" height="4" rx="1" />
      <path d="M4 7v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7M8 10.5h4" />
    </>
  ),
  cloud: (
    <>
      <path d="M6 16h8.5a3.5 3.5 0 0 0 .4-7A5 5 0 0 0 5.2 8.5 3.8 3.8 0 0 0 6 16z" />
    </>
  ),
  wheel: (
    <>
      <circle cx="10" cy="10" r="7.5" />
      <circle cx="10" cy="10" r="2" />
      <path d="M10 2.5V8M10 12v5.5M2.5 10H8M12 10h5.5M4.7 4.7l3.9 3.9M11.4 11.4l3.9 3.9M4.7 15.3l3.9-3.9M11.4 8.6l3.9-3.9" />
    </>
  ),
  bell: (
    <>
      <path d="M5 14V9a5 5 0 0 1 10 0v5l1.5 2h-13zM8.5 18h3" />
    </>
  ),
  alert: (
    <>
      <path d="M10 2.5l8 14H2z" />
      <path d="M10 8v4M10 14.5h.01" />
    </>
  ),
  bulb: (
    <>
      <path d="M7 14.5h6M8 17.5h4M10 2.5a5 5 0 0 0-3 9c.6.5 1 1.2 1 2h4c0-.8.4-1.5 1-2a5 5 0 0 0-3-9z" />
    </>
  ),
  spark: (
    <>
      <path d="M10 2l1.8 6.2L18 10l-6.2 1.8L10 18l-1.8-6.2L2 10l6.2-1.8z" />
    </>
  ),
  layers: (
    <>
      <path d="M10 2l8 4-8 4-8-4zM2 10l8 4 8-4M2 14l8 4 8-4" />
    </>
  ),
};

export default ICONS;

export function Icon({name, size = 20, className}) {
  const glyph = ICONS[name];
  if (!glyph) return null;
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {glyph}
    </svg>
  );
}
