import React, { useMemo, useState } from 'react';
import { Gem, Heart, Plus, Trash2 } from 'lucide-react';
import { useAppData } from '../contexts/AppDataContext';
import { useCouple } from '../contexts/CoupleContext';
import { playGentlePop } from '../lib/sound';

export const OurPromisePage: React.FC = () => {
  const { promises: basePromises, addPromise, removePromise, isAdmin, user } = useAppData();
  const { coupleSpace, spacePromises, addSpacePromise, removeSpacePromise, myRoleName } = useCouple();
  const [authorName, setAuthorName] = useState<'Zikri' | 'Diann'>(myRoleName);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const combinedPromises = useMemo(() => {
    if (!coupleSpace) return basePromises;
    return [...spacePromises, ...basePromises];
  }, [basePromises, coupleSpace, spacePromises]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    setMsg(null);
    try {
      if (coupleSpace) {
        await addSpacePromise(text);
        setMsg(`Janji baru dari ${myRoleName} berhasil ditambahkan ke Couple Space!`);
      } else {
        const res = await addPromise(authorName, text);
        setMsg(
          res.syncedToCloud
            ? 'Janji baru berhasil ditambahkan dan disinkronkan ke cloud!'
            : 'Janji baru tersimpan di perangkat ini!'
        );
      }
      playGentlePop();
      setText('');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Gagal menyimpan janji.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <p className="text-xs font-semibold text-rose-500">
          Our Promise {coupleSpace ? '· Dibagikan Real-Time' : ''}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#4a2336]">
          Janji Kita Berdua 💍
        </h1>
        <p className="text-sm text-[#6b485b]">
          Komitmen sederhana yang akan selalu kita jaga bersama di setiap musim.
        </p>
      </div>

      {/* Promise Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {combinedPromises.map((item) => {
          const isSpacePromise = spacePromises.some((sp) => sp.id === item.id);
          const canDelete =
            isSpacePromise || item.isLocalOnly || isAdmin || (user && item.ownerUid === user.uid);
          return (
            <div
              key={item.id}
              className="rounded-3xl bg-white border border-pink-100 shadow-sm p-5 flex flex-col justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-pink-50 text-rose-500 flex items-center justify-center shrink-0">
                  <Gem className="w-4 h-4" />
                </div>
                <p className="text-sm sm:text-base font-medium text-[#4a2336] leading-relaxed">
                  {item.text}
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-pink-50 text-xs text-[#7c5a6c]">
                <span className="inline-flex items-center gap-1 font-semibold text-rose-500">
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>{item.authorName}</span>
                </span>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() =>
                      void (isSpacePromise ? removeSpacePromise(item.id) : removePromise(item))
                    }
                    aria-label="Hapus janji"
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Write Custom Promise Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl bg-gradient-to-br from-[#fff5f9] to-[#f8f0ff] border border-pink-100 p-5 sm:p-6 space-y-4"
      >
        <h2 className="font-display text-lg font-bold text-[#4a2336]">
          Tulis Janji Tambahan {coupleSpace ? `sebagai ${myRoleName}` : 'Masing-Masing'}
        </h2>

        {!coupleSpace && (
          <div className="flex gap-2">
            {(['Zikri', 'Diann'] as const).map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setAuthorName(name)}
                className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors cursor-pointer ${
                  authorName === name
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-white text-[#6b485b] border-pink-200 hover:bg-pink-50'
                }`}
              >
                Janji {name}
              </button>
            ))}
          </div>
        )}

        <textarea
          rows={3}
          required
          maxLength={450}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Tulis janji manis dari ${coupleSpace ? myRoleName : authorName} di sini...`}
          className="w-full px-4 py-3 rounded-2xl bg-white border border-pink-200 text-sm text-[#4a2336] focus:outline-none focus:ring-2 focus:ring-rose-300"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          {msg ? <span className="text-xs text-rose-600">{msg}</span> : <span />}
          <button
            type="submit"
            disabled={saving}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Tambahkan Janji'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
