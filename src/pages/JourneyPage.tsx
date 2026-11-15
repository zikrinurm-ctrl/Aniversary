import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CalendarHeart, Heart, Plus, Users } from 'lucide-react';
import { useAppData } from '../contexts/AppDataContext';
import { useCouple } from '../contexts/CoupleContext';

export const JourneyPage: React.FC = () => {
  const { timeline } = useAppData();
  const { coupleSpace, isPaired, addSpaceTimelineItem, spaceTimeline } = useCouple();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [dateLabel, setDateLabel] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);

  const combinedTimeline = [...timeline, ...spaceTimeline];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || busy) return;
    setBusy(true);
    try {
      await addSpaceTimelineItem({
        title,
        dateLabel: dateLabel || 'Momen Spesial Kita',
        description,
      });
      setTitle('');
      setDateLabel('');
      setDescription('');
      setShowForm(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-rose-500">
            Our Journey {coupleSpace ? '· Tersinkronisasi Bersama' : ''}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#4a2336]">
            Garis Waktu Cerita Zikri & Diann
          </h1>
          <p className="text-sm text-[#6b485b]">
            Setiap langkah dari pertemuan pertama hingga satu tahun bersama.
          </p>
        </div>

        {coupleSpace && (
          <button
            type="button"
            onClick={() => setShowForm((s) => !s)}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-rose-500 text-white text-xs sm:text-sm font-semibold hover:bg-rose-600 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'Tutup Form' : 'Tambah Momen Bersama'}</span>
          </button>
        )}
      </div>

      {coupleSpace && (
        <div className="rounded-2xl bg-gradient-to-r from-[#fff3f7] to-[#f6efff] border border-pink-100 px-4 py-3 flex items-center gap-2 text-xs text-[#5e3c4e]">
          <Users className="w-4 h-4 text-rose-500 shrink-0" />
          <span>
            {isPaired
              ? 'Timeline ini dibagikan secara real-time antara Zikri & Diann. Kalian berdua bisa menambah bab cerita baru di sini.'
              : 'Ruang pasangan aktif. Momen yang kamu tambahkan di sini akan langsung terlihat oleh pasangan saat bergabung.'}
          </span>
        </div>
      )}

      {showForm && coupleSpace && (
        <form
          onSubmit={handleAdd}
          className="rounded-3xl bg-white border border-pink-100 shadow-sm p-5 sm:p-6 space-y-3"
        >
          <h2 className="font-display text-base font-bold text-[#4a2336]">
            Tambah Bab Baru di Perjalanan Kita
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul momen (misal: Anniv Dinner Pertama)"
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
            />
            <input
              type="text"
              required
              value={dateLabel}
              onChange={(e) => setDateLabel(e.target.value)}
              placeholder="Tanggal (misal: 20 November 2026)"
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
            />
          </div>
          <textarea
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ceritakan kenangan manis di momen ini..."
            className="w-full p-3.5 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={busy}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 cursor-pointer"
            >
              {busy ? 'Menyimpan...' : 'Simpan ke Timeline Bersama'}
            </button>
          </div>
        </form>
      )}

      <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-pink-300 before:via-rose-300 before:to-purple-300">
        {combinedTimeline.map((item, idx) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: Math.min(idx * 0.05, 0.35) }}
            className="relative rounded-3xl bg-white border border-pink-100 shadow-sm overflow-hidden"
          >
            {/* Node dot */}
            <div className="absolute -left-[22px] sm:-left-[26px] top-6 w-5 h-5 rounded-full bg-rose-500 border-4 border-[#fff9fb] flex items-center justify-center">
              <Heart className="w-2.5 h-2.5 text-white fill-current" />
            </div>

            {item.imageUrl && (
              <div className="h-44 sm:h-52 w-full overflow-hidden bg-pink-50">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-5 sm:p-6 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-500">
                <CalendarHeart className="w-4 h-4" />
                <span>{item.dateLabel}</span>
              </div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-[#4a2336]">
                {item.title}
              </h2>
              <p className="text-sm text-[#5e3c4e] leading-relaxed">{item.description}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
};
