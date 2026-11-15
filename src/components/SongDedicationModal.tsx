import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ExternalLink, Heart, MailOpen, Music, Play, X } from 'lucide-react';
import { SongDedication } from '../types';
import { buildYouTubeSearchUrl } from '../data/radioCatalog';

interface SongDedicationModalProps {
  dedication: SongDedication | null;
  partnerDisplayName: string;
  onClose: () => void;
  onPlaySong: (dedication: SongDedication) => void;
}

export const SongDedicationModal: React.FC<SongDedicationModalProps> = ({
  dedication,
  partnerDisplayName,
  onClose,
  onPlaySong,
}) => {
  const [envelopeOpened, setEnvelopeOpened] = useState(true);

  if (!dedication) return null;

  const hasDirectPlayable = Boolean(dedication.audioUrl || dedication.youtubeUrl);

  return (
    <AnimatePresence>
      <motion.div
        key={dedication.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-[#2d1220]/60 backdrop-blur-md flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 28, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#fff5f9] via-white to-[#f6efff] border border-pink-200 shadow-2xl overflow-hidden"
        >
          {/* Decorative envelope header flap */}
          <div className="relative bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 px-5 pt-5 pb-6 text-white">
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup surat dedikasi"
              className="absolute top-3.5 right-3.5 min-h-[44px] min-w-[44px] rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-pink-100">
              <MailOpen className="w-4 h-4" />
              <span>Song Dedication Letter 💌</span>
            </div>
            <h2 className="mt-1 font-display text-xl font-bold text-balance pr-10">
              {dedication.senderName} mendedikasikan sebuah lagu untukmu
            </h2>
            <p className="mt-0.5 text-xs text-pink-100">
              Untuk {partnerDisplayName} · Our Love Radio 💗
            </p>
          </div>

          {/* Animated Envelope Reveal Toggle */}
          {!envelopeOpened ? (
            <div className="p-7 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-pink-50 border border-pink-200 text-rose-500 flex items-center justify-center">
                <Heart className="w-8 h-8 fill-current animate-pulse" />
              </div>
              <p className="text-sm text-[#4a2336] font-medium">
                Ada pesan lagu rahasia dari {dedication.senderName}. Ketuk tombol di bawah untuk membuka suratnya.
              </p>
              <button
                type="button"
                onClick={() => setEnvelopeOpened(true)}
                className="min-h-[44px] px-6 py-2.5 rounded-2xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 cursor-pointer"
              >
                Buka Surat Lagu 💌
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-5 sm:p-6 space-y-5"
            >
              {/* Song Highlight Card */}
              <div className="rounded-2xl bg-white border border-pink-100 p-3.5 shadow-xs flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 overflow-hidden shrink-0 flex items-center justify-center border border-pink-100">
                  {dedication.artworkUrl ? (
                    <img
                      src={dedication.artworkUrl}
                      alt={dedication.songTitle}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="w-6 h-6 text-rose-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold text-rose-500">
                    Lagu Pilihan untukmu
                  </div>
                  <div className="font-display text-base font-bold text-[#4a2336] truncate">
                    {dedication.songTitle}
                  </div>
                  <div className="text-xs text-[#7c5a6c] truncate">{dedication.songArtist}</div>
                </div>
              </div>

              {/* Romantic Note Paper */}
              <div className="rounded-2xl bg-[#fff8fb] border border-pink-100 p-4 sm:p-5 relative">
                <p className="font-handwriting text-xl sm:text-2xl text-[#4a2336] leading-relaxed whitespace-pre-wrap">
                  “{dedication.message}”
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-[#7c5a6c] pt-2.5 border-t border-pink-100">
                  <span>Dengan hangat, {dedication.senderName}</span>
                  <span>
                    {new Date(dedication.createdAtMs).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                {hasDirectPlayable ? (
                  <button
                    type="button"
                    onClick={() => {
                      onPlaySong(dedication);
                      onClose();
                    }}
                    className="flex-1 min-h-[46px] px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-500 text-white text-sm font-semibold shadow-md shadow-rose-200/60 hover:brightness-105 inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Putar Lagu Ini 🎧</span>
                  </button>
                ) : (
                  <a
                    href={buildYouTubeSearchUrl(dedication.songTitle, dedication.songArtist)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 min-h-[46px] px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-500 text-white text-sm font-semibold shadow-md shadow-rose-200/60 hover:brightness-105 inline-flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Cari di YouTube 🎧</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[46px] px-5 py-2.5 rounded-2xl bg-white border border-pink-200 text-sm font-semibold text-[#6b485b] hover:bg-pink-50 cursor-pointer"
                >
                  Simpan & Tutup
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
