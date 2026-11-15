import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import { Flame, Mic, MicOff, RotateCcw, Sparkles, Wind } from 'lucide-react';
import { useCouple } from '../contexts/CoupleContext';
import { playChime } from '../lib/sound';
import { idbGet, idbSet } from '../lib/indexedDb';

const WISH_STORAGE_KEY = 'anniversary_candle_wish_v1';

export const CandleSurprisePage: React.FC = () => {
  const { coupleSpace, updateSharedCandle } = useCouple();
  const [lit, setLit] = useState(true);
  const [showSmoke, setShowSmoke] = useState(false);
  const [wishInput, setWishInput] = useState('');
  const [savedWish, setSavedWish] = useState('');
  const [micActive, setMicActive] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    void idbGet<string>(WISH_STORAGE_KEY).then((w) => {
      if (w) setSavedWish(w);
    });
    return () => {
      stopMic();
    };
  }, []);

  // Real-time candle synchronization when connected in a Couple Space
  useEffect(() => {
    if (!coupleSpace) return;
    setLit(coupleSpace.candleLit);
    if (!coupleSpace.candleLit) {
      setShowSmoke(true);
    } else {
      setShowSmoke(false);
    }
    if (coupleSpace.candleWish) {
      setSavedWish(coupleSpace.candleWish);
    }
  }, [coupleSpace?.candleLit, coupleSpace?.candleWish]);

  const stopMic = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      void audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setMicActive(false);
    setMicLevel(0);
  };

  const blowOutCandle = () => {
    if (!lit) return;
    setLit(false);
    setShowSmoke(true);
    stopMic();
    playChime([523.25, 659.25, 783.99, 1046.5], 95);
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#f472b6', '#fbcfe8', '#c084fc', '#fed7aa', '#ffffff'],
      });
    } catch {
      // Ignore
    }
    const finalWish =
      wishInput.trim() ||
      savedWish ||
      'Semoga Zikri & Diann selalu bahagia, sehat, dan saling menjaga selamanya.';
    setSavedWish(finalWish);
    void idbSet(WISH_STORAGE_KEY, finalWish);
    if (coupleSpace) {
      void updateSharedCandle(false, finalWish);
    }
  };

  const relightCandle = () => {
    setLit(true);
    setShowSmoke(false);
    if (coupleSpace) {
      void updateSharedCandle(true, savedWish);
    }
  };

  const startMicBlowDetection = async () => {
    setMicError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicError('Browser ini tidak mendukung akses mikrofon. Gunakan tombol Tiup Lilin manual.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      setMicActive(true);
      let loudFrames = 0;

      const monitor = () => {
        analyser.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = (dataArray[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const pct = Math.min(100, Math.round(rms * 360));
        setMicLevel(pct);
        if (rms > 0.16) {
          loudFrames += 1;
          if (loudFrames >= 6) {
            blowOutCandle();
            return;
          }
        } else {
          loudFrames = Math.max(0, loudFrames - 1);
        }
        rafRef.current = requestAnimationFrame(monitor);
      };
      rafRef.current = requestAnimationFrame(monitor);
    } catch {
      setMicError('Izin mikrofon ditolak atau tidak tersedia. Gunakan tombol Tiup Lilin di bawah ya!');
      stopMic();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <p className="text-xs font-semibold text-rose-500">
          Candle Surprise {coupleSpace ? '· Tersinkronisasi Bersama' : ''}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#4a2336]">
          Make A Wish & Tiup Lilin Anniversary 🎂
        </h1>
        <p className="text-sm text-[#6b485b]">
          Tuliskan harapan terbaikmu untuk kita berdua, lalu tiup lilinnya lewat tombol atau mikrofon.
        </p>
      </div>

      {/* Interactive 3D-Look Pastel Cake Stage */}
      <div className="rounded-3xl bg-gradient-to-b from-[#fff5f9] via-[#fdf2f8] to-[#f5efff] border border-pink-100 shadow-sm px-4 py-10 sm:py-12 flex flex-col items-center justify-center relative overflow-hidden">
        {lit && (
          <div className="animate-gentle-glow pointer-events-none absolute top-14 w-52 h-52 rounded-full bg-amber-200/35 blur-2xl" />
        )}

        <div className="relative flex flex-col items-center mt-8">
          <div className="relative z-20 flex flex-col items-center -mb-1">
            <div className="relative h-14 w-10">
              {lit ? (
                <div className="animate-candle-flame absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="w-6 h-10 rounded-full bg-gradient-to-t from-amber-500 via-orange-400 to-yellow-200 shadow-[0_0_24px_rgba(251,191,36,0.9)]" />
                  <div className="w-2.5 h-5 rounded-full bg-white/90 -mt-6" />
                </div>
              ) : (
                showSmoke && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="animate-smoke-rise w-4 h-4 rounded-full bg-slate-300/60 blur-[2px]" />
                    <div
                      className="animate-smoke-rise w-6 h-6 rounded-full bg-slate-200/50 blur-[3px] -mt-2"
                      style={{ animationDelay: '0.25s' }}
                    />
                  </div>
                )
              )}
            </div>
            <div className="w-0.5 h-2.5 bg-[#4a2336]" />
            <div className="w-5 h-16 rounded-t-md bg-gradient-to-b from-rose-300 via-pink-200 to-rose-400 border border-rose-200 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 opacity-35 bg-[repeating-linear-gradient(45deg,#ffffff,#ffffff_5px,transparent_5px,transparent_10px)]" />
            </div>
          </div>

          <div className="relative z-10 w-44 sm:w-48 h-16 rounded-t-2xl bg-gradient-to-b from-[#ffe4ef] to-[#fbcfe8] border border-pink-200 shadow-md flex items-start justify-center overflow-hidden">
            <div className="w-full flex justify-around">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-6 bg-white/95 rounded-b-full shadow-xs"
                  style={{ height: i % 2 === 0 ? '20px' : '13px' }}
                />
              ))}
            </div>
            <span className="absolute bottom-2 font-handwriting text-lg font-bold text-rose-600">
              1st Year
            </span>
          </div>

          <div className="relative w-60 sm:w-68 h-24 rounded-t-xl rounded-b-2xl bg-gradient-to-b from-[#fce7f3] via-[#f9a8d4] to-[#f472b6] border border-pink-300 shadow-lg flex items-center justify-center overflow-hidden">
            <div className="absolute top-0 left-0 right-0 flex justify-around">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className="w-7 bg-white/90 rounded-b-full"
                  style={{ height: i % 2 === 0 ? '18px' : '11px' }}
                />
              ))}
            </div>
            <div className="mt-3 px-4 py-1 rounded-full bg-white/85 text-rose-600 font-display text-xs sm:text-sm font-bold shadow-xs">
              Zikri & Diann
            </div>
          </div>

          <div className="w-72 sm:w-80 h-4 rounded-full bg-gradient-to-b from-white to-pink-100 border border-pink-200 shadow-md -mt-1" />
        </div>

        <div className="mt-8 w-full max-w-md space-y-4">
          {lit ? (
            <>
              <div>
                <label htmlFor="wish-input" className="block text-xs font-semibold text-[#6b485b] mb-1.5">
                  Tulis Harapan (Make A Wish)
                </label>
                <input
                  id="wish-input"
                  type="text"
                  value={wishInput}
                  onChange={(e) => setWishInput(e.target.value)}
                  placeholder="Contoh: Semoga kita selalu saling menjaga sampai tua..."
                  maxLength={200}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-white border border-pink-200 text-sm text-[#4a2336] focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={blowOutCandle}
                  className="flex-1 min-h-[48px] px-5 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-display font-semibold text-sm shadow-md shadow-rose-200 hover:brightness-105 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Wind className="w-4 h-4" />
                  <span>Tiup Lilin</span>
                </button>

                <button
                  type="button"
                  onClick={micActive ? stopMic : startMicBlowDetection}
                  className={`min-h-[48px] px-4 py-3 rounded-xl border text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    micActive
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
                  }`}
                >
                  {micActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{micActive ? 'Matikan Mik' : 'Tiup Pakai Mik'}</span>
                </button>
              </div>

              {micActive && (
                <div className="rounded-xl bg-white border border-purple-100 p-3 text-center space-y-2">
                  <p className="text-xs text-purple-700 font-medium">
                    Mikrofon aktif! Tiup ke arah mikrofon HP atau laptopmu...
                  </p>
                  <div className="w-full h-2.5 rounded-full bg-purple-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-400 to-purple-500 transition-all duration-75"
                      style={{ width: `${micLevel}%` }}
                    />
                  </div>
                </div>
              )}

              {micError && (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3 text-center">
                  {micError}
                </p>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white border border-pink-200 p-5 text-center space-y-3 shadow-sm"
            >
              <div className="inline-flex items-center gap-1.5 text-rose-500 text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Harapan Anniversary Terkirim</span>
              </div>
              <p className="font-handwriting text-2xl text-[#4a2336] leading-snug">
                “{savedWish}”
              </p>
              <p className="text-xs text-[#7c5a6c]">
                Semoga semua doa dan harapan baik untuk Zikri & Diann segera terwujud.
              </p>
              <button
                type="button"
                onClick={relightCandle}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-pink-50 text-rose-600 hover:bg-pink-100 text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Nyalakan Kembali</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-pink-100 p-4 flex items-center gap-3 text-xs sm:text-sm text-[#6b485b]">
        <Flame className="w-5 h-5 text-amber-500 shrink-0" />
        <span>
          {coupleSpace
            ? 'Status lilin dan harapan kalian tersinkronisasi secara real-time di kedua perangkat!'
            : 'Tips: Jika sedang bermain bersama di sebelah pasangan, nyalakan mikrofon lalu tiup berdua bersamaan.'}
        </span>
      </div>
    </div>
  );
};
