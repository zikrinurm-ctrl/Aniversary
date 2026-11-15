// Lightweight Web Audio API sound effects (never auto-plays without user gesture)
let sharedCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedCtx) {
    sharedCtx = new AudioCtx();
  }
  if (sharedCtx.state === 'suspended') {
    void sharedCtx.resume();
  }
  return sharedCtx;
}

export function playChime(freqs: number[] = [523.25, 659.25, 783.99, 1046.5], stepMs = 110): void {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + (idx * stepMs) / 1000);
      gain.gain.setValueAtTime(0.001, now + (idx * stepMs) / 1000);
      gain.gain.exponentialRampToValueAtTime(0.11, now + (idx * stepMs) / 1000 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (idx * stepMs) / 1000 + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + (idx * stepMs) / 1000);
      osc.stop(now + (idx * stepMs) / 1000 + 0.48);
    });
  } catch {
    // Ignore audio context restriction errors
  }
}

export function playGentlePop(): void {
  playChime([587.33, 880], 70);
}

export function playSoftError(): void {
  playChime([329.63, 277.18], 130);
}

export function playHugHeartbeat(): void {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [0, 0.24, 0.72, 0.96].forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(idx % 2 === 0 ? 115 : 92, now + offset);
      gain.gain.setValueAtTime(0.001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.16, now + offset + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.19);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.21);
    });
    playChime([523.25, 659.25, 783.99], 180);
  } catch {
    // Ignore
  }
}

export function playMelodyNotes(notes: { freq: number; dur: number }[]): void {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    let cursor = ctx.currentTime;
    notes.forEach(({ freq, dur }) => {
      if (freq > 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, cursor);
        gain.gain.setValueAtTime(0.001, cursor);
        gain.gain.exponentialRampToValueAtTime(0.12, cursor + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, cursor + dur * 0.95);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(cursor);
        osc.stop(cursor + dur);
      }
      cursor += dur;
    });
  } catch {
    // Ignore
  }
}
