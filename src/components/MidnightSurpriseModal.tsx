import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Heart, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { playChime } from '../lib/sound';

interface MidnightSurpriseModalProps {
  coupleNames: string;
  onDismiss: () => void;
}

export const MidnightSurpriseModal: React.FC<MidnightSurpriseModalProps> = ({
  coupleNames,
  onDismiss,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Fireworks canvas + confetti burst
  useEffect(() => {
    const fireConfetti = () => {
      try {
        confetti({
          particleCount: 65,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#f472b6', '#fbcfe8', '#c084fc', '#fed7aa', '#ffffff'],
        });
      } catch {
        // Ignore confetti errors in headless envs
      }
    };
    fireConfetti();
    const confettiTimer = window.setInterval(fireConfetti, 2800);

    const canvas = canvasRef.current;
    if (!canvas) {
      return () => window.clearInterval(confettiTimer);
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return () => window.clearInterval(confettiTimer);
    }

    let animId = 0;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      radius: number;
    }

    const particles: Particle[] = [];
    const palette = ['#f472b6', '#fb7185', '#c084fc', '#fdba74', '#ffffff'];

    const spawnBurst = () => {
      const cx = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
      const cy = Math.random() * canvas.height * 0.45 + canvas.height * 0.1;
      for (let i = 0; i < 28; i++) {
        const angle = (Math.PI * 2 * i) / 28;
        const speed = 1.5 + Math.random() * 3.2;
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: palette[i % palette.length],
          radius: 2 + Math.random() * 2,
        });
      }
    };

    spawnBurst();
    const burstInterval = window.setInterval(spawnBurst, 950);

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.035;
        p.alpha -= 0.015;
        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);

    return () => {
      window.clearInterval(confettiTimer);
      window.clearInterval(burstInterval);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleToggleAudio = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      playChime([523.25, 659.25, 783.99, 1046.5, 1318.5], 110);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-rose-500/90 via-pink-500/90 to-purple-600/90 backdrop-blur-md overflow-hidden">
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-lg rounded-3xl bg-white/95 border border-pink-100 shadow-2xl p-6 sm:p-8 text-center"
      >
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={handleToggleAudio}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-pink-50 text-rose-600 hover:bg-pink-100 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Suara Aktif' : 'Aktifkan Suara'}</span>
          </button>
        </div>

        <motion.div
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-rose-300/50 mb-4"
        >
          <Heart className="w-8 h-8 fill-current" />
        </motion.div>

        <p className="text-xs font-semibold text-rose-500 tracking-wider uppercase">
          20 November 2026 · 00:00 WIT
        </p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-[#4a2336] leading-tight text-balance">
          HAPPY FIRST ANNIVERSARY
        </h2>
        <p className="mt-2 font-handwriting text-2xl text-rose-500">{coupleNames}</p>
        <p className="mt-4 text-sm sm:text-base text-[#5e3c4e] leading-relaxed">
          Satu tahun pertama resmi bersama sudah tiba! Terima kasih sudah menjadi bagian paling indah dalam setiap hariku.
        </p>

        <button
          type="button"
          onClick={() => {
            if (soundEnabled) playChime([659.25, 783.99, 1046.5], 95);
            onDismiss();
          }}
          className="mt-6 w-full min-h-[48px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white font-display font-semibold text-base shadow-lg shadow-rose-300/40 hover:brightness-105 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
          <span>OPEN YOUR SURPRISE</span>
        </button>
      </motion.div>
    </div>
  );
};
