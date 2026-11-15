import React from 'react';

const FLOATING_PARTICLES = [
  { left: '6%', delay: '0s', duration: '15s', size: 14, kind: 'heart' },
  { left: '16%', delay: '3s', duration: '18s', size: 12, kind: 'petal' },
  { left: '28%', delay: '6s', duration: '16s', size: 16, kind: 'heart' },
  { left: '41%', delay: '1.5s', duration: '19s', size: 11, kind: 'petal' },
  { left: '54%', delay: '4.5s', duration: '14s', size: 15, kind: 'heart' },
  { left: '67%', delay: '7s', duration: '17s', size: 13, kind: 'petal' },
  { left: '79%', delay: '2s', duration: '16s', size: 14, kind: 'heart' },
  { left: '91%', delay: '5.5s', duration: '20s', size: 12, kind: 'petal' },
];

export const FloatingHearts: React.FC<{ intense?: boolean }> = ({ intense = false }) => {
  const items = intense ? FLOATING_PARTICLES : FLOATING_PARTICLES.slice(0, 6);
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden z-0"
      aria-hidden="true"
    >
      {items.map((item, idx) =>
        item.kind === 'heart' ? (
          <svg
            key={idx}
            viewBox="0 0 24 24"
            width={item.size}
            height={item.size}
            className="animate-float-up absolute bottom-0 text-pink-300/60"
            style={{
              left: item.left,
              animationDelay: item.delay,
              animationDuration: item.duration,
            }}
            fill="currentColor"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        ) : (
          <div
            key={idx}
            className="animate-petal-drift absolute top-0 rounded-tl-full rounded-br-full bg-gradient-to-br from-pink-200/70 to-purple-200/60"
            style={{
              left: item.left,
              width: `${item.size}px`,
              height: `${item.size * 0.75}px`,
              animationDelay: item.delay,
              animationDuration: item.duration,
            }}
          />
        )
      )}
    </div>
  );
};
