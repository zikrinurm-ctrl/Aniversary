import React from 'react';
import { motion } from 'motion/react';

interface EqualizerBarsProps {
  active: boolean;
  size?: 'sm' | 'md' | 'lg';
  light?: boolean;
}

export const EqualizerBars: React.FC<EqualizerBarsProps> = ({
  active,
  size = 'md',
  light = false,
}) => {
  const heights =
    size === 'sm'
      ? [10, 14, 12, 16]
      : size === 'lg'
      ? [18, 28, 22, 32, 20]
      : [12, 20, 16, 22];

  const barWidth = size === 'sm' ? 'w-0.5' : size === 'lg' ? 'w-1.5' : 'w-1';
  const maxHeightClass = size === 'sm' ? 'h-4' : size === 'lg' ? 'h-8' : 'h-6';

  return (
    <div
      className={`inline-flex items-end gap-0.5 ${maxHeightClass}`}
      aria-label={active ? 'Equalizer aktif' : 'Audio dijeda'}
    >
      {heights.map((maxPx, idx) => (
        <motion.span
          key={idx}
          animate={
            active
              ? {
                  scaleY: [0.3, 1, 0.45, 0.9, 0.35],
                }
              : { scaleY: 0.25 }
          }
          transition={
            active
              ? {
                  repeat: Infinity,
                  duration: 0.75 + idx * 0.14,
                  ease: 'easeInOut',
                }
              : { duration: 0.2 }
          }
          style={{
            height: `${maxPx}px`,
            transformOrigin: 'bottom',
          }}
          className={`${barWidth} rounded-full ${
            light
              ? 'bg-white'
              : 'bg-gradient-to-t from-rose-500 via-pink-500 to-purple-500'
          }`}
        />
      ))}
    </div>
  );
};

export const FloatingMusicNotes: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  const notes = [
    { symbol: '♪', x: '12%', delay: 0 },
    { symbol: '♫', x: '34%', delay: 1.1 },
    { symbol: '♡', x: '62%', delay: 0.6 },
    { symbol: '♪', x: '84%', delay: 1.7 },
  ];

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {notes.map((n, i) => (
        <motion.span
          key={i}
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: -90, opacity: [0, 0.7, 0] }}
          transition={{
            repeat: Infinity,
            duration: 3.4,
            delay: n.delay,
            ease: 'easeOut',
          }}
          style={{ left: n.x, bottom: '8%' }}
          className="absolute text-rose-400/80 text-base font-bold select-none"
        >
          {n.symbol}
        </motion.span>
      ))}
    </div>
  );
};
